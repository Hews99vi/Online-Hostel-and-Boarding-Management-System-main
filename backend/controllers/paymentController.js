const Payment = require("../models/Payment.js");
const Booking = require("../models/Booking.js");

// Lazy-load Stripe to ensure environment variables are loaded first
let stripe = null;
const getStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

// Create Stripe Payment Intent
exports.createPaymentIntent = async (req, res) => {
  try {
    console.log("=== CREATE PAYMENT INTENT START ===");
    console.log("Request body:", req.body);
    console.log("User:", req.user?._id);
    
    const stripe = getStripe();
    console.log("Stripe initialized:", !!stripe);
    
    if (!stripe) {
      console.error("❌ Stripe not configured");
      return res.status(500).json({ 
        message: "Payment service not configured. Please contact administrator." 
      });
    }

    const { bookingId } = req.body;
    console.log("Booking ID:", bookingId);

    // Validate booking exists and belongs to user
    const booking = await Booking.findById(bookingId).populate("room");
    console.log("Booking found:", !!booking);
    
    if (!booking) {
      console.error("❌ Booking not found");
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log("Booking details:", {
      id: booking._id,
      user: booking.user,
      totalPrice: booking.totalPrice,
      room: booking.room?.name
    });

    if (booking.user.toString() !== req.user._id.toString()) {
      console.error("❌ User not authorized");
      return res.status(403).json({ message: "Not authorized to pay for this booking" });
    }

    // Check if payment already exists for this booking
    const existingPayment = await Payment.findOne({ 
      booking: bookingId, 
      status: { $in: ["completed", "processing"] } 
    });

    if (existingPayment) {
      console.log("⚠️ Payment already exists");
      return res.status(400).json({ 
        message: "Payment already exists for this booking",
        payment: existingPayment 
      });
    }

    console.log("Creating Stripe payment intent...");
    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100), // Stripe expects amount in cents
      currency: "usd",
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user._id.toString(),
        roomName: booking.room.name,
      },
      description: `Payment for ${booking.room.name} booking`,
    });
    console.log("✅ Payment intent created:", paymentIntent.id);

    console.log("Creating payment record...");
    // Create payment record in pending state
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id,
      amount: booking.totalPrice,
      paymentMethod: "stripe",
      status: "processing",
      transactionId: paymentIntent.id,
    });
    console.log("✅ Payment record created:", payment._id);

    console.log("=== CREATE PAYMENT INTENT SUCCESS ===");
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      amount: booking.totalPrice,
    });
  } catch (error) {
    console.error("=== CREATE PAYMENT INTENT ERROR ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    console.error("Full error:", error);
    res.status(500).json({ 
      message: "Error creating payment intent", 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Confirm Payment Success
exports.confirmPayment = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ 
        message: "Payment service not configured. Please contact administrator." 
      });
    }

    const { paymentIntentId, paymentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ 
        message: "Payment not completed",
        status: paymentIntent.status 
      });
    }

    // Update payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    payment.status = "completed";
    payment.paymentDate = new Date();
    await payment.save();

    // Update booking status
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.status = "confirmed";
      await booking.save();
    }

    await payment.populate("booking");
    await payment.populate("user", "-password");

    res.status(200).json({
      message: "Payment confirmed successfully",
      payment,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ 
      message: "Error confirming payment", 
      error: error.message 
    });
  }
};

// Create a new payment (Legacy - for non-Stripe payments)
exports.createPayment = async (req, res) => {
  try {
    const {
      bookingId,
      amount,
      paymentMethod,
      cardDetails,
      billingAddress,
    } = req.body;

    // Validate booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to pay for this booking" });
    }

    // Check if payment already exists for this booking
    const existingPayment = await Payment.findOne({ 
      booking: bookingId, 
      status: { $in: ["completed", "processing"] } 
    });

    if (existingPayment) {
      return res.status(400).json({ 
        message: "Payment already exists for this booking",
        payment: existingPayment 
      });
    }

    // Validate amount matches booking total
    if (amount !== booking.totalPrice) {
      return res.status(400).json({ 
        message: "Payment amount does not match booking total",
        expected: booking.totalPrice,
        received: amount
      });
    }

    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id,
      amount,
      paymentMethod,
      cardDetails: cardDetails ? {
        cardHolderName: cardDetails.cardHolderName,
        cardLastFour: cardDetails.cardNumber ? cardDetails.cardNumber.slice(-4) : undefined,
        cardType: cardDetails.cardType,
      } : undefined,
      billingAddress,
      status: "processing",
    });

    // Simulate payment processing (in production, integrate with real payment gateway)
    // For demo purposes, randomly succeed or fail
    const paymentSuccess = Math.random() > 0.1; // 90% success rate

    if (paymentSuccess) {
      payment.status = "completed";
      payment.paymentDate = new Date();
      payment.transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      await payment.save();

      // Update booking status
      booking.status = "confirmed";
      await booking.save();

      await payment.populate("booking");
      await payment.populate("user", "-password");

      res.status(201).json({
        message: "Payment completed successfully",
        payment,
      });
    } else {
      payment.status = "failed";
      payment.failureReason = "Payment declined by bank";
      await payment.save();

      await payment.populate("booking");
      await payment.populate("user", "-password");

      res.status(402).json({
        message: "Payment failed",
        payment,
      });
    }
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Error processing payment", error: error.message });
  }
};

// Get all payments for the logged-in user
exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate({
        path: "booking",
        populate: { path: "room" }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching user payments:", error);
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
};

// Get all payments (admin only)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: "booking",
        populate: { path: "room" }
      })
      .populate("user", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching all payments:", error);
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
};

// Get a single payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: "booking",
        populate: { path: "room" }
      })
      .populate("user", "-password");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check if user is authorized to view this payment
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this payment" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ message: "Error fetching payment", error: error.message });
  }
};

// Get payment by booking ID
exports.getPaymentByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const payment = await Payment.findOne({ booking: bookingId })
      .populate({
        path: "booking",
        populate: { path: "room" }
      })
      .populate("user", "-password");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found for this booking" });
    }

    // Check if user is authorized
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this payment" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ message: "Error fetching payment", error: error.message });
  }
};

// Process refund (admin only)
exports.processRefund = async (req, res) => {
  try {
    const { refundAmount, reason } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status !== "completed") {
      return res.status(400).json({ message: "Only completed payments can be refunded" });
    }

    if (refundAmount > payment.amount) {
      return res.status(400).json({ message: "Refund amount cannot exceed payment amount" });
    }

    payment.status = "refunded";
    payment.refundAmount = refundAmount;
    payment.refundDate = new Date();
    payment.failureReason = reason;
    await payment.save();

    await payment.populate("booking");
    await payment.populate("user", "-password");

    res.status(200).json({
      message: "Refund processed successfully",
      payment,
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({ message: "Error processing refund", error: error.message });
  }
};

// Get payment statistics (admin only)
exports.getPaymentStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const recentPayments = await Payment.find()
      .populate("booking")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      statistics: stats,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentPayments,
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    res.status(500).json({ message: "Error fetching payment statistics", error: error.message });
  }
};
