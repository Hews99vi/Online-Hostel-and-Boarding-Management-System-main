const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Single", "Double", "Suite"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Indexes for better query performance
roomSchema.index({ type: 1, available: 1 });
roomSchema.index({ price: 1 });
roomSchema.index({ name: "text" });

module.exports = mongoose.model("Room", roomSchema);
