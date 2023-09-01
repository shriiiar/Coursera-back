const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const quizMarkSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "videos",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    marks: {
      type: String,
    },
    total: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Export Course model
const QuizMark = mongoose.model("quizMark", quizMarkSchema);
module.exports = QuizMark;
