const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    notification_type: {
      type: String,
      // required: true
    },
    description: {
      type: String,
      trim: true,
    },
    link: {
      type: String,
      // required: true
    },
    title: {
      type: String,
      // required: true
    },
    student: {
      type: Schema.Types.Mixed,
      ref: "students",
    },
    teacher: {
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

// Export contest model
const Notification = mongoose.model("notification", notificationSchema);
module.exports = Notification;
