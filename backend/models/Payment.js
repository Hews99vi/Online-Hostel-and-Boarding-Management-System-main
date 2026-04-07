const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "paypal", "stripe", "cash"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
      index: true,
    },
    cardDetails: {
      cardHolderName: String,
      cardLastFour: String,
      cardType: String, // Visa, Mastercard, etc.
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    paymentDate: {
      type: Date,
    },
    refundDate: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    failureReason: {
      type: String,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

// Generate transaction ID before saving (async function, no next() needed)
paymentSchema.pre("save", async function () {
  if (!this.transactionId && this.status !== "pending") {
    this.transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
});

// Index for faster queries
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ status: 1 });
// Removed duplicate transactionId index since it's defined in schema

module.exports = mongoose.model("Payment", paymentSchema);
