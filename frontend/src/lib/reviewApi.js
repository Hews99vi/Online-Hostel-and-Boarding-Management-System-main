import { axiosInstance } from "./axios";

export const getRandomUserReviews = async (limit = 3) => {
  try {
    const response = await axiosInstance.get("/reviews/random", {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getRoomReviews = async (roomId) => {
  try {
    const response = await axiosInstance.get(`/reviews/room/${roomId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const createReview = async (roomId, data) => {
  try {
    const response = await axiosInstance.post(`/reviews/room/${roomId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updateReview = async (reviewId, data) => {
  try {
    const response = await axiosInstance.put(`/reviews/${reviewId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
