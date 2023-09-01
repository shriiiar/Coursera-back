const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const modulesSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "courses",
    },
    milestoneId: {
      type: Schema.Types.ObjectId,
      ref: "milestones",
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    totalTimes: {
      type: String,
      trim: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "videos",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Export modules model
const Modules = mongoose.model("modules", modulesSchema);
module.exports = Modules;
