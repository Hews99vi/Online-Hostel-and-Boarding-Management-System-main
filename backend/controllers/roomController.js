const Room = require("../models/Room.js");

exports.getRooms = async (req, res) => {
  try {
    const { q, type, minPrice, maxPrice, capacity, available } = req.query;

    // Build query object
    const query = {};

    // Search by name
    if (q) {
      query.name = { $regex: q, $options: "i" };
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by capacity
    if (capacity) {
      query.capacity = { $gte: Number(capacity) };
    }

    // Filter by availability
    if (available === "true") {
      query.available = true;
    }

    const rooms = await Room.find(query).sort({ createdAt: -1 });
    res.status(200).json(rooms);
  } catch (error) {
    console.log("Error in getRooms: ", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(room);
  } catch (error) {
    console.log("Error in getRoomById: ", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const {
      name,
      type,
      price,
      capacity,
      size,
      description,
      amenities,
      image,
      images,
      available,
    } = req.body;

    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Validate required fields
    if (
      !name ||
      !type ||
      !price ||
      !capacity ||
      !size ||
      !description ||
      !image
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // Validate room type
    const validTypes = ["Single", "Double", "Suite"];
    if (!validTypes.includes(type)) {
      return res
        .status(400)
        .json({
          message: "Invalid room type. Must be Single, Double, or Suite",
        });
    }

    // Validate numeric fields
    if (price <= 0 || capacity <= 0 || size <= 0) {
      return res
        .status(400)
        .json({
          message: "Price, capacity, and size must be positive numbers",
        });
    }

    const room = await Room.create({
      name,
      type,
      price,
      capacity,
      size,
      description,
      amenities: amenities || [],
      image,
      images: images || [],
      available: available !== undefined ? available : true,
    });

    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.log("Error in createRoom: ", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { type, price, capacity, size } = req.body;

    // Validate room type if provided
    if (type) {
      const validTypes = ["Single", "Double", "Suite"];
      if (!validTypes.includes(type)) {
        return res
          .status(400)
          .json({
            message: "Invalid room type. Must be Single, Double, or Suite",
          });
      }
    }

    // Validate numeric fields if provided
    if (price !== undefined && price <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number" });
    }
    if (capacity !== undefined && capacity <= 0) {
      return res
        .status(400)
        .json({ message: "Capacity must be a positive number" });
    }
    if (size !== undefined && size <= 0) {
      return res
        .status(400)
        .json({ message: "Size must be a positive number" });
    }

    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    console.log("Error in updateRoom: ", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if room exists
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check for active bookings
    const Booking = require("../models/Booking.js");
    const activeBookings = await Booking.find({
      room: req.params.id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (activeBookings.length > 0) {
      return res.status(409).json({
        message:
          "Cannot delete room with active bookings. Please cancel all bookings first.",
        activeBookingsCount: activeBookings.length,
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.log("Error in deleteRoom: ", error.message);
    res.status(500).json({ message: error.message });
  }
};
