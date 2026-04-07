const express = require("express");
const router = express.Router();
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController.js");
const { protectRoute, adminOnly } = require("../middleware/authMiddleware.js");

// Public routes
router.get("/", getRooms);
router.get("/:id", getRoomById);

// Protected routes (admin only)
router.post("/", protectRoute, adminOnly, createRoom);
router.put("/:id", protectRoute, adminOnly, updateRoom);
router.delete("/:id", protectRoute, adminOnly, deleteRoom);

module.exports = router;
