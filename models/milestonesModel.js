const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const milestoneSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "courses",
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
    modules: [
      {
        type: Schema.Types.ObjectId,
        ref: "modules",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Export milestone model
const Milestones = mongoose.model("milestones", milestoneSchema);
module.exports = Milestones;
