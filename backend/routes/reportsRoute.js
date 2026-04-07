const express = require("express");
const router = express.Router();
const {
  getSystemSummary,
  getBookingAnalytics,
  getRevenueAnalytics,
  getTopRooms,
  getOccupancyStats,
} = require("../controllers/reportsController.js");
const { protectRoute, adminOnly } = require("../middleware/authMiddleware.js");

// All routes require authentication and admin access
router.use(protectRoute);
router.use(adminOnly);

router.get("/summary", getSystemSummary);
router.get("/bookings", getBookingAnalytics);
router.get("/revenue", getRevenueAnalytics);
router.get("/top-rooms", getTopRooms);
router.get("/occupancy", getOccupancyStats);

module.exports = router;
