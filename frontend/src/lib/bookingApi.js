import { axiosInstance } from "./axios";

// Create a new booking
export const createBooking = async (bookingData) => {
  const response = await axiosInstance.post("/bookings", bookingData);
  return response.data;
};

// Get all bookings for the logged-in user
export const getUserBookings = async () => {
  const response = await axiosInstance.get("/bookings/my-bookings");
  return response.data;
};

// Get a single booking by ID
export const getBookingById = async (bookingId) => {
  const response = await axiosInstance.get(`/bookings/${bookingId}`);
  return response.data;
};

// Cancel a booking
export const cancelBooking = async (bookingId) => {
  const response = await axiosInstance.patch(`/bookings/${bookingId}/cancel`);
  return response.data;
};

// Check room availability
export const checkAvailability = async (roomId, checkInDate, checkOutDate) => {
  const response = await axiosInstance.get("/bookings/availability", {
    params: {
      roomId,
      checkInDate,
      checkOutDate,
    },
  });
  return response.data;
};

// Get all bookings (admin only)
export const getAllBookings = async () => {
  const response = await axiosInstance.get("/bookings");
  return response.data;
};

// Update booking status (admin only)
export const updateBookingStatus = async (bookingId, status) => {
  const response = await axiosInstance.patch(`/bookings/${bookingId}/status`, { status });
  return response.data;
};
