const express = require("express");
const router = express.Router();
const {
  getRoomReviews,
  createReview,
  deleteReview,
  updateReview,
  getRandomUserReviews,
} = require("../controllers/reviewController.js");
const { protectRoute } = require("../middleware/authMiddleware.js");

router.get("/random", getRandomUserReviews);
router.get("/room/:roomId", getRoomReviews);
router.post("/room/:roomId", protectRoute, createReview);
router.delete("/:reviewId", protectRoute, deleteReview);
router.put("/:reviewId", protectRoute, updateReview);

module.exports = router;
