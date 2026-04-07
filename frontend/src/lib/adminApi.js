import { axiosInstance } from "./axios";

// User Management
export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/user/admin/all");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/user/admin/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserStats = async () => {
  try {
    const response = await axiosInstance.get("/user/admin/stats");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Booking Management
export const getAllBookings = async () => {
  try {
    const response = await axiosInstance.get("/bookings/admin/all");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await axiosInstance.patch(`/bookings/${bookingId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const response = await axiosInstance.delete(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Room Management
export const deleteRoom = async (roomId) => {
  try {
    const response = await axiosInstance.delete(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reports
export const getSystemSummary = async () => {
  try {
    const response = await axiosInstance.get("/reports/summary");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getBookingAnalytics = async (startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axiosInstance.get("/reports/bookings", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getRevenueAnalytics = async (startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axiosInstance.get("/reports/revenue", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getTopRooms = async (startDate, endDate, limit = 10) => {
  try {
    const params = { limit };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axiosInstance.get("/reports/top-rooms", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getOccupancyStats = async (startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axiosInstance.get("/reports/occupancy", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Payment Management
export const getAllPayments = async () => {
  try {
    const response = await axiosInstance.get("/payments/admin/all");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPaymentStats = async () => {
  try {
    const response = await axiosInstance.get("/payments/admin/stats");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const processRefund = async (paymentId) => {
  try {
    const response = await axiosInstance.post(`/payments/${paymentId}/refund`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
