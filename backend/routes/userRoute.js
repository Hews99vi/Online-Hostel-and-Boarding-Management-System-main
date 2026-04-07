const express = require("express");
const { protectRoute } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  deleteProfile,
  getAllUsers,
  getUserStats,
  deleteUser,
} = require("../controllers/userController");
const router = express.Router();

// Admin routes
router.get("/admin/all", protectRoute, getAllUsers);
router.get("/admin/stats", protectRoute, getUserStats);
router.delete("/admin/:userId", protectRoute, deleteUser);

// User routes
router.get("/:id", protectRoute, getProfile);
router.put("/update-profile", protectRoute, updateProfile);
router.delete("/delete-profile", protectRoute, deleteProfile);

module.exports = router;
