import { axiosInstance } from "./axios";

export const getUserChat = async () => {
  const response = await axiosInstance.get("/chats/my-chat");
  return response.data;
};

export const getAllChats = async () => {
  const response = await axiosInstance.get("/chats");
  return response.data;
};

export const getChatMessages = async (chatId) => {
  const response = await axiosInstance.get(`/chats/${chatId}/messages`);
  return response.data;
};

export const sendMessage = async (chatId, content) => {
  const response = await axiosInstance.post("/chats/send", {
    chatId,
    content,
  });
  return response.data;
};

export const markMessagesAsRead = async (chatId) => {
  const response = await axiosInstance.put(`/chats/${chatId}/read`);
  return response.data;
};

export const deleteChat = async (chatId) => {
  const response = await axiosInstance.delete(`/chats/${chatId}`);
  return response.data;
};
