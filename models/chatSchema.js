const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const chatSchema = new Schema(
  {
    chatName: {
      type: String,
      trim: true,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: "message",
    },
  },
  {
    timestamps: true,
  }
);

// Export Course model
const Chat = mongoose.model("chat", chatSchema);
module.exports = Chat;
