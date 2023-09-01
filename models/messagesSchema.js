const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//create schema
const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    content: {
      type: String,
      trim: true,
    },

    chat: {
      type: Schema.Types.ObjectId,
      ref: "chat",
    },
  },
  {
    timestamps: true,
  }
);

// Export Course model
const Messages = mongoose.model("message", messageSchema);
module.exports = Messages;
