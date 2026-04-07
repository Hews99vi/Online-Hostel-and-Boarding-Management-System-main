const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    // Track who has unread messages (user or admin)
    unreadBy: {
      type: String,
      enum: ["user", "admin", "none"],
      default: "none",
    },
  },
  { timestamps: true }
);

// Ensure each user has only one chat with admin
chatSchema.index({ user: 1 }, { unique: true });

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
