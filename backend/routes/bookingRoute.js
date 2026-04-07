const express = require("express");
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
  deleteBooking,
  updateBookingStatus,
  checkAvailability,
} = require("../controllers/bookingController.js");
const { protectRoute, adminOnly } = require("../middleware/authMiddleware.js");

// Public route - Check room availability (must be first)
router.get("/availability", checkAvailability);

// All routes below require authentication
router.use(protectRoute);

// User booking routes
router.get("/my-bookings", getUserBookings);
router.post("/", createBooking);

// Admin routes
router.get("/admin/all", adminOnly, getAllBookings);
router.patch("/:id/status", adminOnly, updateBookingStatus);

// Booking-specific routes (must be after specific routes like /my-bookings)
router.get("/:id", getBookingById);
router.patch("/:id/cancel", cancelBooking);
router.delete("/:id", deleteBooking);

module.exports = router;
