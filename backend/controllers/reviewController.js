const Review = require("../models/Review.js");
const Room = require("../models/Room.js");

exports.getRandomUserReviews = async (req, res) => {
  try {
    const parsedLimit = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 50)
      : 6;

    const pipeline = [
      { $group: { _id: "$user", reviews: { $push: "$$ROOT" } } },
      {
        $project: {
          review: {
            $arrayElemAt: [
              "$reviews",
              {
                $floor: {
                  $multiply: [{ $rand: {} }, { $size: "$reviews" }],
                },
              },
            ],
          },
        },
      },
      { $sample: { size: limit } },
    ];

    const grouped = await Review.aggregate(pipeline);
    const reviews = grouped.map((entry) => entry.review);

    await Review.populate(reviews, [
      { path: "user", select: "name profilePicture" },
      { path: "room", select: "name" },
    ]);

    res.status(200).json(reviews);
  } catch (error) {
    console.log("Error in getRandomUserReviews:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getRoomReviews = async (req, res) => {
  try {
    const { roomId } = req.params;

    const reviews = await Review.find({ room: roomId })
      .sort({ createdAt: -1 })
      .populate("user", "name profilePicture");

    res.status(200).json(reviews);
  } catch (error) {
    console.log("Error in getRoomReviews:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const existingReview = await Review.findOne({
      room: roomId,
      user: req.user._id,
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this room" });
    }

    const review = await Review.create({
      room: roomId,
      user: req.user._id,
      rating,
      comment: comment.trim(),
    });

    await review.populate("user", "name profilePicture");

    res.status(201).json(review);
  } catch (error) {
    console.log("Error in createReview:", error.message);

    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this room" });
    }

    res.status(500).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You can only delete your own reviews" });
    }

    await review.deleteOne();

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.log("Error in deleteReview:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You can only edit your own reviews" });
    }

    if (rating === undefined || rating === null || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    review.rating = rating;
    review.comment = comment.trim();

    await review.save();
    await review.populate("user", "name profilePicture");

    res.status(200).json(review);
  } catch (error) {
    console.log("Error in updateReview:", error.message);
    res.status(500).json({ message: error.message });
  }
};
