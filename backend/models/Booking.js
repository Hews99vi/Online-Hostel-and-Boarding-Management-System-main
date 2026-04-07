const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    specialRequests: {
      type: String,
      default: "",
    },
    guestName: {
      type: String,
      required: true,
    },
    guestEmail: {
      type: String,
      required: true,
    },
    guestPhone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
