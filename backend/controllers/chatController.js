const Chat = require("../models/Chat.js");
const Message = require("../models/Message.js");
const { getIO } = require("../lib/socket.js");

// Get or create user's chat with admin
const getUserChat = async (req, res) => {
  try {
    const userId = req.user._id;

    let chat = await Chat.findOne({ user: userId })
      .populate("user", "name email")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name email",
        },
      });

    if (!chat) {
      chat = await Chat.create({ user: userId });
      await chat.populate("user", "name email");
    }

    res.status(200).json({ chat });
  } catch (error) {
    console.error("Error getting user chat:", error);
    res.status(500).json({ message: "Failed to get chat" });
  }
};

// Get all chats (admin only)
const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate("user", "name email")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name email",
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({ chats });
  } catch (error) {
    console.error("Error getting all chats:", error);
    res.status(500).json({ message: "Failed to get chats" });
  }
};

// Get messages for a specific chat
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === "admin";

    // Verify user has access to this chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check authorization
    if (!isAdmin && chat.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ message: "Failed to get messages" });
  }
};

// Send a message (REST fallback, mainly using Socket.io)
const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const senderId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
    } else {
      // Create new chat for user
      chat = await Chat.findOne({ user: senderId });
      if (!chat) {
        chat = await Chat.create({ user: senderId });
      }
    }

    const message = await Message.create({
      chat: chat._id,
      sender: senderId,
      content: content.trim(),
    });

    await message.populate("sender", "name email");

    // Update chat
    chat.lastMessage = message._id;
    chat.unreadBy = req.user.role === "admin" ? "user" : "admin";
    chat.unreadCount += 1;
    await chat.save();

    await chat.populate("user", "name email");
    await chat.populate("lastMessage");

    // Broadcast via socket for real-time updates
    try {
      const io = getIO();
      
      // Emit to the other party (not the sender)
      if (req.user.role === "admin") {
        // Admin sent message, notify the specific user
        io.to(`user:${chat.user._id}`).emit("messageReceived", {
          message,
          chat,
        });
      } else {
        // User sent message, notify all admins
        io.to("admin").emit("messageReceived", { message, chat });
      }
    } catch (error) {
      console.error("Socket broadcast error:", error);
      // Continue even if socket broadcast fails
    }

    res.status(201).json({ message, chatId: chat._id });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      { chat: chatId, sender: { $ne: userId }, isRead: false },
      { isRead: true }
    );

    const chat = await Chat.findById(chatId);
    if (chat) {
      chat.unreadCount = 0;
      chat.unreadBy = "none";
      await chat.save();
    }

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};

// Delete a chat (admin only)
const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Delete all messages in the chat
    await Message.deleteMany({ chat: chatId });

    // Delete the chat
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ message: "Failed to delete chat" });
  }
};

module.exports = {
  getUserChat,
  getAllChats,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  deleteChat,
};
