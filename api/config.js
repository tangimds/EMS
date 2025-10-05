const dotenv = require("dotenv");
dotenv.config();

const ENVIRONMENT = process.env.ENVIRONMENT || "development";
const MONGO_URL = process.env.MONGO_URL || "";
const SECRET = process.env.SECRET || "not-so-secret";
const SENTRY_URL = process.env.SENTRY_URL || "";
const APP_URL = process.env.APP_URL || "http://localhost:5173";

const S3_REGION = process.env.S3_REGION || "";
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || "";
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || "";
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "";

const CONFIG = {
  ENVIRONMENT,
  MONGO_URL,
  SECRET,
  SENTRY_URL,
  APP_URL,
  S3_REGION,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME,
};

if (ENVIRONMENT === "development") console.log(CONFIG);

module.exports = CONFIG;
