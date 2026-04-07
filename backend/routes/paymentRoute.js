const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  createPayment,
  getUserPayments,
  getAllPayments,
  getPaymentById,
  getPaymentByBooking,
  processRefund,
  getPaymentStats,
} = require("../controllers/paymentController.js");
const { protectRoute } = require("../middleware/authMiddleware.js");

// All routes require authentication
router.use(protectRoute);

// Stripe payment routes
router.post("/create-intent", createPaymentIntent);
router.post("/confirm", confirmPayment);

// User payment routes
router.post("/", createPayment);
router.get("/my-payments", getUserPayments);
router.get("/:id", getPaymentById);
router.get("/booking/:bookingId", getPaymentByBooking);

// Admin routes
router.get("/", getAllPayments);
router.post("/:id/refund", processRefund);
router.get("/admin/stats", getPaymentStats);

module.exports = router;
