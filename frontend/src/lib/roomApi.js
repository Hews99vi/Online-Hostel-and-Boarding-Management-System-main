import { axiosInstance } from "./axios";

export const getRooms = async (params) => {
  try {
    const response = await axiosInstance.get("/rooms", { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getRoomById = async (id) => {
  try {
    const response = await axiosInstance.get(`/rooms/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const createRoom = async (data) => {
  try {
    const response = await axiosInstance.post("/rooms", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updateRoom = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/rooms/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const deleteRoom = async (id) => {
  try {
    const response = await axiosInstance.delete(`/rooms/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
