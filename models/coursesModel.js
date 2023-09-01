const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const coursesSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    courseName: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      trim: true,
    },
    requirements: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      trim: true,
      default: "approved",
      enum: ["pending", "approved", "rejected"],
    },
    milestones: [
      {
        type: Schema.Types.ObjectId,
        ref: "milestones",
      },
    ],

    modules: [
      {
        type: Schema.Types.ObjectId,
        ref: "modules",
      },
    ],
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "videos",
      },
    ],

    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Export Course model
const Courses = mongoose.model("courses", coursesSchema);
module.exports = Courses;
