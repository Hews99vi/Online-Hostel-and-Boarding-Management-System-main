import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Users, Search } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import ChatBox from "../components/ChatBox";
import { getAllChats, getChatMessages, sendMessage } from "../lib/chatApi";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { axiosInstance } from "../lib/axios";

const AdminChatPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    initializeChats();

    return () => {
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeChats = async () => {
    try {
      setLoading(true);

      // Get all chats
      const chatsData = await getAllChats();
      setChats(chatsData.chats || []);

      // Connect socket - fetch token from backend since cookie is httpOnly
      try {
        const tokenResponse = await axiosInstance.get("/auth/socket-token");
        const token = tokenResponse.data.token;

        if (token) {
          const socketInstance = connectSocket(token);
          setSocket(socketInstance);

          // Listen for new messages
          socketInstance.on("messageReceived", ({ message, chat }) => {
            // Update chats list
            setChats((prevChats) => {
              const chatIndex = prevChats.findIndex((c) => c._id === chat._id);
              if (chatIndex !== -1) {
                const updatedChats = [...prevChats];
                updatedChats[chatIndex] = chat;
                // Move to top
                updatedChats.unshift(updatedChats.splice(chatIndex, 1)[0]);
                return updatedChats;
              } else {
                return [chat, ...prevChats];
              }
            });

            // If this is the selected chat, add message
            if (selectedChat && message.chat === selectedChat._id) {
              // Check for duplicates before adding
              setMessages((prev) => {
                const exists = prev.some((msg) => msg._id === message._id);
                if (exists) return prev;
                return [...prev, message];
              });
            }
          });

          // Mark messages as read
          socketInstance.on("messagesRead", ({ chatId }) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.chat === chatId ? { ...msg, isRead: true } : msg
              )
            );
          });
        }
      } catch (error) {
        console.error("Failed to get socket token:", error);
      }
    } catch (error) {
      console.error("Error initializing chats:", error);
      toast.error("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = async (chat) => {
    try {
      setSelectedChat(chat);
      const messagesData = await getChatMessages(chat._id);
      setMessages(messagesData.messages || []);

      // Mark as read
      if (socket) {
        socket.emit("markAsRead", chat._id);
      }

      // Update chat in list
      setChats((prevChats) =>
        prevChats.map((c) =>
          c._id === chat._id ? { ...c, unreadCount: 0, unreadBy: "none" } : c
        )
      );
    } catch (error) {
      console.error("Error loading chat messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const handleSendMessage = async (content) => {
    if (!selectedChat) {
      toast.error("No chat selected");
      return;
    }

    try {
      // Send message via REST API (this will save to DB and socket will broadcast)
      const response = await sendMessage(selectedChat._id, content);
      
      // Add message to local UI immediately
      setMessages((prev) => [...prev, response.message]);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const filteredChats = (chats || []).filter((chat) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      chat.user?.name?.toLowerCase().includes(search) ||
      chat.user?.email?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Chats</h1>
              <p className="text-gray-600">Manage conversations with users</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          style={{ height: "calc(100vh - 250px)" }}
        >
          <div className="flex h-full">
            {/* Chat List Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {filteredChats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Users className="w-12 h-12 mb-2" />
                    <p>No chats yet</p>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <button
                      key={chat._id}
                      onClick={() => handleSelectChat(chat)}
                      className={`w-full text-left p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                        selectedChat?._id === chat._id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900">
                          {chat.user?.name || "Unknown User"}
                        </p>
                        {chat.unreadBy === "admin" && chat.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.user?.email || "No email"}
                      </p>
                      {chat.lastMessage && (
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(chat.updatedAt), "MMM dd, HH:mm")}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <p className="font-semibold text-gray-900">
                      {selectedChat.user?.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedChat.user?.email || "No email"}
                    </p>
                  </div>

                  {/* Chat Box */}
                  <div className="flex-1 min-h-0">
                    <ChatBox
                      chatId={selectedChat._id}
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      socket={socket}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Select a chat to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminChatPage;
