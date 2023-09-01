const Chat = require("../models/chatSchema");
const Messages = require("../models/messagesSchema");
const User = require("../models/userModel");

exports.accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send({
      success: false,
      message: "UserId not sent with request",
    });
  }

  let isChat = await Chat.find({
    $and: [
      { users: { $elemMatch: { $eq: req.user?._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name email",
  });

  if (isChat.length > 0) {
    res.send({ data: isChat[0] });
  } else {
    let chatData = {
      chatName: "sender",
      users: [req.user?._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send({
        success: true,
        message: "Successful",
        data: fullChat,
      });
    } catch (error) {
      return res.status(400).send({
        success: false,
        message: "Failed",
      });
    }
  }
};

exports.getChat = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user?._id } } })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name email",
        });
        res.status(200).send({
          success: true,
          message: "Successful",
          data: results,
        });
      });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Failed to get chat",
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { searchText } = req.query;
    const requester = await User.findById({ _id: req.user?._id });

    const role = requester.role;
    let query = {};

    if (searchText) {
      if (role === "student" || role === "teacher") {
        query = {
          $or: [
            { name: { $regex: searchText, $options: "i" } },
            { email: { $regex: searchText, $options: "i" } },
          ],
          role: role === "student" ? "teacher" : "student",
        };
      } else if (role === "admin") {
        query = {
          $or: [
            { name: { $regex: searchText, $options: "i" } },
            { email: { $regex: searchText, $options: "i" } },
          ],
        };
      }
    } else {
      if (role === "student" || role === "teacher") {
        query = { role: role === "student" ? "teacher" : "student" };
      } else if (role === "admin") {
        query = {};
      }
    }
    const result = await User.find(query).select("-password");

    res.status(200).send({
      success: true,
      message: "Successful fetched users",
      data: result,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Failed to fetch",
    });
  }
};

exports.sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).send({
      success: false,
      message: "Information missing",
    });
  }

  let newMessage = {
    sender: req.user?._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Messages.create(newMessage);

    message = await message.populate("sender", "name");
    message = await message.populate("sender");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email ",
    });
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.status(200).send({
      success: true,
      message: "Successfully Message created",
      data: message,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Failed to create message",
    });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Messages.find({ chat: req.params.chatId })
      .populate("sender", "name email")
      .populate("chat");
    res.status(200).send({
      success: true,
      message: "Successfully fetched all messages",
      data: messages,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Failed to fetched all messages",
    });
  }
};
