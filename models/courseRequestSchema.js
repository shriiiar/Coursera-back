const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseRequestSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "courses",
    },
  },
  {
    timestamps: true,
  }
);

const CourseRequest = mongoose.model("courseRequests", CourseRequestSchema);
module.exports = CourseRequest;
