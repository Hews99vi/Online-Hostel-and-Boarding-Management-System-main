import { axiosInstance } from "./axios";

// Create Stripe Payment Intent
export const createPaymentIntent = async (bookingId) => {
  const response = await axiosInstance.post("/payments/create-intent", { bookingId });
  return response.data;
};

// Confirm Payment
export const confirmPayment = async (paymentIntentId, paymentId) => {
  const response = await axiosInstance.post("/payments/confirm", { paymentIntentId, paymentId });
  return response.data;
};

// Create a new payment
export const createPayment = async (paymentData) => {
  const response = await axiosInstance.post("/payments", paymentData);
  return response.data;
};

// Get all payments for the logged-in user
export const getUserPayments = async () => {
  const response = await axiosInstance.get("/payments/my-payments");
  return response.data;
};

// Get a single payment by ID
export const getPaymentById = async (paymentId) => {
  const response = await axiosInstance.get(`/payments/${paymentId}`);
  return response.data;
};

// Get payment by booking ID
export const getPaymentByBooking = async (bookingId) => {
  const response = await axiosInstance.get(`/payments/booking/${bookingId}`);
  return response.data;
};

// Get all payments (admin only)
export const getAllPayments = async () => {
  const response = await axiosInstance.get("/payments");
  return response.data;
};

// Process refund (admin only)
export const processRefund = async (paymentId, refundData) => {
  const response = await axiosInstance.post(`/payments/${paymentId}/refund`, refundData);
  return response.data;
};

// Get payment statistics (admin only)
export const getPaymentStats = async () => {
  const response = await axiosInstance.get("/payments/admin/stats");
  return response.data;
};
