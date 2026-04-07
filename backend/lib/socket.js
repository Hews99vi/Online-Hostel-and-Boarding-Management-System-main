const jwt = require("jsonwebtoken");
const Chat = require("../models/Chat.js");
const Message = require("../models/Message.js");
const User = require("../models/User.js");

let io;

const setupSocket = (socketIO) => {
  io = socketIO;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

    // Join user's personal room
    socket.join(`user:${socket.user._id}`);

    // If admin, join admin room
    if (socket.user.role === "admin") {
      socket.join("admin");
    }

    // Handle sending a message
    socket.on("sendMessage", async (data) => {
      try {
        const { content, chatId } = data;
        const senderId = socket.user._id;

        // Find or create chat
        let chat;
        if (chatId) {
          chat = await Chat.findById(chatId);
        } else {
          // Create new chat if user is sending first message
          chat = await Chat.findOne({ user: senderId });
          if (!chat) {
            chat = await Chat.create({ user: senderId });
          }
        }

        // Create message
        const message = await Message.create({
          chat: chat._id,
          sender: senderId,
          content,
        });

        // Populate sender info
        await message.populate("sender", "name email");

        // Update chat's last message
        chat.lastMessage = message._id;
        chat.unreadBy = socket.user.role === "admin" ? "user" : "admin";
        chat.unreadCount += 1;
        await chat.save();

        // Populate chat for response
        await chat.populate("user", "name email");
        await chat.populate("lastMessage");

        // Emit to sender
        socket.emit("messageReceived", { message, chat });

        // Emit to recipient
        if (socket.user.role === "admin") {
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
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Mark messages as read
    socket.on("markAsRead", async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        // Update messages to read
        await Message.updateMany(
          { chat: chatId, sender: { $ne: socket.user._id }, isRead: false },
          { isRead: true }
        );

        // Update chat unread count
        chat.unreadCount = 0;
        chat.unreadBy = "none";
        await chat.save();

        // Notify the other party
        if (socket.user.role === "admin") {
          io.to(`user:${chat.user}`).emit("messagesRead", { chatId });
        } else {
          io.to("admin").emit("messagesRead", { chatId });
        }
      } catch (error) {
        console.error("Mark as read error:", error);
      }
    });

    // Handle typing indicator
    socket.on("typing", (chatId) => {
      if (socket.user.role === "admin") {
        Chat.findById(chatId).then((chat) => {
          if (chat) {
            io.to(`user:${chat.user}`).emit("userTyping", {
              chatId,
              user: socket.user.name,
            });
          }
        });
      } else {
        io.to("admin").emit("userTyping", {
          chatId,
          user: socket.user.name,
        });
      }
    });

    socket.on("stopTyping", (chatId) => {
      if (socket.user.role === "admin") {
        Chat.findById(chatId).then((chat) => {
          if (chat) {
            io.to(`user:${chat.user}`).emit("userStoppedTyping", { chatId });
          }
        });
      } else {
        io.to("admin").emit("userStoppedTyping", { chatId });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { setupSocket, getIO };
