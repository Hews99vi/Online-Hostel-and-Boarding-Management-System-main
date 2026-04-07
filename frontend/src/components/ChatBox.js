import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { format } from "date-fns";
import { useAuthStore } from "../store/useAuthStore";

const ChatBox = ({ chatId, messages, onSendMessage, socket }) => {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { authUser } = useAuthStore();

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on("userTyping", ({ chatId: typingChatId, user }) => {
      if (typingChatId === chatId) {
        setTypingUser(user);
        setIsTyping(true);
      }
    });

    socket.on("userStoppedTyping", ({ chatId: typingChatId }) => {
      if (typingChatId === chatId) {
        setIsTyping(false);
        setTypingUser("");
      }
    });

    return () => {
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    };
  }, [socket, chatId]);

  const handleTyping = () => {
    if (!socket) return;

    socket.emit("typing", chatId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", chatId);
    }, 1000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    onSendMessage(newMessage);
    setNewMessage("");

    if (socket) {
      socket.emit("stopTyping", chatId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.sender?._id === authUser?._id;
              return (
                <div
                  key={message._id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {format(new Date(message.createdAt), "HH:mm")}
                    </p>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 py-2 text-sm text-gray-500 italic">
          {typingUser} is typing...
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
