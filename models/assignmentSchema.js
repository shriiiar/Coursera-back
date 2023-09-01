const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const assignmentSchema = new Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "courses",
    },
    milestoneId: {
      type: Schema.Types.ObjectId,
      ref: "milestones",
    },
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: "modules",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    submissions: {
      type: Schema.Types.Array,
      ref: "completedAssignments",
    },
    marks: {
      type: Schema.Types.Array,
      ref: "marks",
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "videos",
    },
    pdf: {
      name: String,
      mimeType: String,
      id: String,
    },
  },
  {
    timestamps: true,
  }
);

// Export Course model
const Assignment = mongoose.model("assignments", assignmentSchema);
module.exports = Assignment;
