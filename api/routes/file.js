const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const AWS = require("aws-sdk");
const passport = require("passport");

const {
  S3_REGION,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME,
} = require("../config");

router.post(
  "/",
  passport.authenticate(["user"], { session: false }),
  async (req, res) => {
    const { files, folder } = req.body;

    if (!folder)
      return res
        .status(400)
        .send({ ok: false, message: "No folder specified" });

    if (!files)
      return res.status(400).send({ ok: false, message: "No files uploaded" });

    // Ensure 'files' is always an array
    const filesArray = Array.isArray(files) ? files : [files];

    const uploadPromises = filesArray
      .map((file) => {
        const base64ContentArray = file.rawBody.split(",");
        const contentType = base64ContentArray[0].match(
          /[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/
        )[0];
        const extension = file.name.split(".").pop();
        const buffer = Buffer.from(base64ContentArray[1], "base64");
        const uuid = crypto.randomBytes(16).toString("hex");

        let s3bucket = new AWS.S3({
          region: S3_REGION,
          accessKeyId: S3_ACCESS_KEY_ID,
          secretAccessKey: S3_SECRET_ACCESS_KEY,
        });

        const path = `file${folder}/${uuid}/${file.name}.${extension}`;

        var params = {
          ACL: "private",
          Bucket: S3_BUCKET_NAME,
          Key: path,
          Body: buffer,
          ContentEncoding: "base64",
          ContentType: contentType,
          Metadata: { "Cache-Control": "max-age=31536000" },
        };

        return new Promise((resolve, reject) => {
          s3bucket.upload(params, function (err, data) {
            if (err) return reject(`error in callback:${err}`);
            resolve(path);
          });
        });
      })
      .filter((promise) => promise !== null); // Filter out the nulls

    try {
      const keys = await Promise.all(uploadPromises);
      return res.status(200).send({ ok: true, data: keys });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ ok: false, message: error.message || "SERVER_ERROR" });
    }
  }
);

router.get(
  "/download",
  passport.authenticate(["user"], { session: false }),
  async (req, res) => {
    try {
      const { key } = req.query;
      if (!key || typeof key !== "string")
        return res.status(400).send({ ok: false, message: "Missing key" });

      const s3 = new AWS.S3({
        region: S3_REGION,
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
      });

      // Fetch metadata first to set headers properly
      const head = await s3
        .headObject({ Bucket: S3_BUCKET_NAME, Key: key })
        .promise()
        .catch((err) => {
          if (err && (err.code === "NotFound" || err.statusCode === 404))
            return null;
          throw err;
        });

      if (!head)
        return res.status(404).send({ ok: false, message: "File not found" });

      const fileName = key.split("/").pop() || "file";
      res.setHeader(
        "Content-Type",
        head.ContentType || "application/octet-stream"
      );
      res.setHeader("Content-Length", head.ContentLength || 0);
      res.setHeader("Content-Disposition", `inline; filename=\"${fileName}\"`);
      if (head.ETag) res.setHeader("ETag", head.ETag);

      const stream = s3
        .getObject({ Bucket: S3_BUCKET_NAME, Key: key })
        .createReadStream();
      stream.on("error", (err) => {
        console.error(err);
        if (!res.headersSent) res.status(500).end();
      });
      stream.pipe(res);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ ok: false, message: error.message || "SERVER_ERROR" });
    }
  }
);

module.exports = router;
