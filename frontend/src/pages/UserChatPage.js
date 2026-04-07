import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ChatBox from "../components/ChatBox";
import { getUserChat, getChatMessages, sendMessage } from "../lib/chatApi";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { axiosInstance } from "../lib/axios";

const UserChatPage = () => {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    initializeChat();

    return () => {
      disconnectSocket();
    };
  }, []);

  const initializeChat = async () => {
    try {
      setLoading(true);

      // Get or create chat
      const chatData = await getUserChat();
      setChat(chatData.chat);

      // Get messages
      if (chatData.chat) {
        const messagesData = await getChatMessages(chatData.chat._id);
        setMessages(messagesData.messages || []);
      }

      // Connect socket - fetch token from backend since cookie is httpOnly
      try {
        const tokenResponse = await axiosInstance.get("/auth/socket-token");
        const token = tokenResponse.data.token;
        
        console.log("Token found:", token ? "Yes" : "No");

        if (token) {
          console.log("Attempting to connect socket...");
          const socketInstance = connectSocket(token);
          setSocket(socketInstance);

          socketInstance.on("connect", () => {
            console.log("✅ Socket connected successfully");
          });

          socketInstance.on("connect_error", (error) => {
            console.error("❌ Socket connection error:", error.message);
          });

          // Listen for new messages
          socketInstance.on("messageReceived", ({ message, chat: updatedChat }) => {
            console.log("📨 Message received via socket:", message);
            if (message.chat === chatData.chat._id) {
              // Check for duplicates before adding
              setMessages((prev) => {
                const exists = prev.some((msg) => msg._id === message._id);
                if (exists) {
                  console.log("⚠️ Duplicate message detected, skipping");
                  return prev;
                }
                return [...prev, message];
              });
              setChat(updatedChat);
            }
          });

          // Mark messages as read
          socketInstance.on("messagesRead", () => {
            setMessages((prev) =>
              prev.map((msg) => ({ ...msg, isRead: true }))
            );
          });
        } else {
          console.warn("⚠️ No authentication token received");
        }
      } catch (error) {
        console.error("Failed to get socket token:", error);
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast.error("Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content) => {
    if (!chat) {
      toast.error("Chat not initialized");
      return;
    }

    try {
      // Send message via REST API (this will save to DB and socket will broadcast)
      const response = await sendMessage(chat._id, content);
      
      // Add message to local UI immediately
      setMessages((prev) => [...prev, response.message]);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chat with Admin</h1>
              <p className="text-gray-600">Get help and support</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl"
          style={{ height: "calc(100vh - 250px)" }}
        >
          {chat && (
            <ChatBox
              chatId={chat._id}
              messages={messages}
              onSendMessage={handleSendMessage}
              socket={socket}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserChatPage;
