const AuthGuard = require("../middlewares/AuthGuard");

const router = require("express").Router();
const chatController = require("../controllers/chatController");

router.post("/", AuthGuard, chatController.accessChat);
router.get("/", AuthGuard, chatController.getChat);
router.get("/users", AuthGuard, chatController.getUsers);
router.post("/message", AuthGuard, chatController.sendMessage);
router.get("/message/:chatId", AuthGuard, chatController.getAllMessages);

module.exports = router;
