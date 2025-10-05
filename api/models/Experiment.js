const mongoose = require("mongoose");

const experimentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    research_focus: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["planning", "in-progress", "completed", "on-hold", "cancelled"],
      default: "planning",
    },
    collected_data: {
      type: String,
      trim: true,
    },
    start_date: {
      type: Date,
      default: Date.now,
    },
    end_date: {
      type: Date,
    },
    attachments: {
      type: Array,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Index for better query performance
experimentSchema.index({ user: 1, status: 1 });
experimentSchema.index({
  research_focus: "text",
  title: "text",
  description: "text",
});

module.exports =
  mongoose.models.Experiment || mongoose.model("Experiment", experimentSchema);
