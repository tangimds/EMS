const express = require("express");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const Experiment = require("../models/Experiment");

const router = express.Router();

router.get(
  "/",
  passport.authenticate(["user"], { session: false }),
  async (req, res) => {
    try {
      console.log("🔍 ~ req.user:", req.user);
      const { status, search } = req.query;
      let query = { user: req.user._id };

      // Filter by status if provided
      if (status && status !== "all") {
        query.status = status;
      }

      // Search functionality
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { researchFocus: { $regex: search, $options: "i" } },
        ];
      }

      const experiments = await Experiment.find(query)
        .sort({ createdAt: -1 })
        .populate("user", "name email");

      res.json({ ok: true, data: experiments });
    } catch (error) {
      console.error("Get experiments error:", error);
      res.status(500).json({
        ok: false,
        message: "Server error while fetching experiments",
      });
    }
  }
);

router.get(
  "/:id",
  passport.authenticate(["user"], { session: false }),
  async (req, res) => {
    try {
      const experiment = await Experiment.findOne({
        _id: req.params.id,
        user: req.user._id,
      }).populate("user", "name email");

      if (!experiment) {
        return res
          .status(404)
          .json({ ok: false, message: "Experiment not found" });
      }

      res.json({ ok: true, data: experiment });
    } catch (error) {
      console.error("Get experiment error:", error);
      res
        .status(500)
        .json({ ok: false, message: "Server error while fetching experiment" });
    }
  }
);

router.post(
  "/",
  [
    passport.authenticate(["user"], { session: false }),
    body("title")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const experimentData = {
        ...req.body,
        user: req.user._id,
      };
      console.log("✌️ ~ experimentData:", experimentData);

      const experiment = new Experiment(experimentData);
      await experiment.save();

      res.status(201).json({
        ok: true,
        message: "Experiment created successfully",
        data: experiment,
      });
    } catch (error) {
      console.error("Create experiment error:", error);
      res
        .status(500)
        .json({ ok: false, message: "Server error while creating experiment" });
    }
  }
);

router.put(
  "/:id",
  [
    passport.authenticate(["user"], { session: false }),
    body("title")
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters long"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters long"),
    body("researchFocus")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Research focus is required"),
    body("status")
      .optional()
      .isIn(["planning", "in-progress", "completed", "on-hold", "cancelled"]),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const experiment = await Experiment.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true, runValidators: true }
      );

      if (!experiment) {
        return res.status(404).json({ message: "Experiment not found" });
      }

      res.json({
        ok: true,
        message: "Experiment updated successfully",
        data: experiment,
      });
    } catch (error) {
      console.error("Update experiment error:", error);
      res
        .status(500)
        .json({ message: "Server error while updating experiment" });
    }
  }
);

// @route   DELETE /api/experiments/:id
// @desc    Delete an experiment
// @access  Private
router.delete(
  "/:id",
  passport.authenticate(["user"], { session: false }),
  async (req, res) => {
    try {
      const experiment = await Experiment.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!experiment) {
        return res.status(404).json({ message: "Experiment not found" });
      }

      res.json({ ok: true, message: "Experiment deleted successfully" });
    } catch (error) {
      console.error("Delete experiment error:", error);
      res
        .status(500)
        .json({ ok: false, message: "Server error while deleting experiment" });
    }
  }
);

module.exports = router;
