const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const markSchema = new Schema(
  {
    mark: {
      type: Number,
    },
    fullMark: {
      type: Number,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "courses",
    },
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "assignments",
    },
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: "completedAssignments",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

// Export Course model
const Mark = mongoose.model("marks", markSchema);
module.exports = Mark;
