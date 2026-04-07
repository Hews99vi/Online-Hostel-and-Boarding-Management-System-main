const express = require("express");
const { protectRoute, adminOnly } = require("../middleware/authMiddleware.js");
const {
  getUserChat,
  getAllChats,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  deleteChat,
} = require("../controllers/chatController.js");

const router = express.Router();

// User routes
router.get("/my-chat", protectRoute, getUserChat);
router.get("/:chatId/messages", protectRoute, getChatMessages);
router.post("/send", protectRoute, sendMessage);
router.put("/:chatId/read", protectRoute, markMessagesAsRead);

// Admin routes
router.get("/", protectRoute, adminOnly, getAllChats);
router.delete("/:chatId", protectRoute, adminOnly, deleteChat);

module.exports = router;
