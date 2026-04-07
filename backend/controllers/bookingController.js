const Booking = require("../models/Booking.js");
const Room = require("../models/Room.js");

// Helper function to check for booking conflicts
const checkBookingConflict = async (roomId, checkInDate, checkOutDate, excludeBookingId = null) => {
  const query = {
    room: roomId,
    status: { $in: ["pending", "confirmed"] },
    $or: [
      {
        // New booking starts during an existing booking
        checkInDate: { $lte: checkInDate },
        checkOutDate: { $gt: checkInDate },
      },
      {
        // New booking ends during an existing booking
        checkInDate: { $lt: checkOutDate },
        checkOutDate: { $gte: checkOutDate },
      },
      {
        // New booking completely contains an existing booking
        checkInDate: { $gte: checkInDate },
        checkOutDate: { $lte: checkOutDate },
      },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);
  return conflictingBooking !== null;
};

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      roomId,
      checkInDate,
      checkOutDate,
      guests,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
    } = req.body;

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return res.status(400).json({ message: "Check-in date cannot be in the past" });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!room.available) {
      return res.status(400).json({ message: "Room is not available for booking" });
    }

    // Check for booking conflicts
    const hasConflict = await checkBookingConflict(roomId, checkIn, checkOut);
    if (hasConflict) {
      return res.status(409).json({ 
        message: "Room is already booked for the selected dates",
        conflict: true 
      });
    }

    // Validate guest count
    if (guests > room.capacity) {
      return res.status(400).json({ 
        message: `Room capacity is ${room.capacity} guests` 
      });
    }

    // Calculate total price (number of nights * price per night)
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * room.price;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      room: roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests,
      totalPrice,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests: specialRequests || "",
      status: "confirmed",
    });

    // Populate room and user details
    await booking.populate("room");
    await booking.populate("user", "-password");

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};

// Get all bookings for the logged-in user
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("room")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
};

// Get all bookings (admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("room")
      .populate("user", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
};

// Get a single booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("room")
      .populate("user", "-password");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is authorized to view this booking
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this booking" });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Error fetching booking", error: error.message });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is authorized to cancel this booking
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    // Check if booking can be cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    if (booking.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel a completed booking" });
    }

    // Check if cancellation is allowed (e.g., not less than 24 hours before check-in)
    const now = new Date();
    const checkIn = new Date(booking.checkInDate);
    const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 24) {
      return res.status(400).json({ 
        message: "Cancellation not allowed less than 24 hours before check-in" 
      });
    }

    booking.status = "cancelled";
    await booking.save();

    await booking.populate("room");
    await booking.populate("user", "-password");

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Error cancelling booking", error: error.message });
  }
};

// Update booking status (admin only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    await booking.populate("room");
    await booking.populate("user", "-password");

    res.status(200).json({
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Error updating booking status", error: error.message });
  }
};

// Check room availability for specific dates
exports.checkAvailability = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.query;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const hasConflict = await checkBookingConflict(roomId, checkIn, checkOut);

    res.status(200).json({
      available: !hasConflict && room.available,
      room: {
        id: room._id,
        name: room.name,
        price: room.price,
      },
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ message: "Error checking availability", error: error.message });
  }
};

// Delete a booking (admin only or user can delete their own cancelled bookings)
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check authorization
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this booking" });
    }

    // Only allow deletion of cancelled bookings for regular users
    if (!isAdmin && booking.status !== "cancelled") {
      return res.status(400).json({ 
        message: "Only cancelled bookings can be deleted. Please cancel the booking first." 
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Error deleting booking", error: error.message });
  }
};
