const cloudinary = require("../lib/cloudinary.js");
const User = require("../models/User.js");
const Booking = require("../models/Booking.js");

// Admin Functions
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getAllUsers: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalCustomers = totalUsers - totalAdmins;

    // Get users with booking counts
    const usersWithBookings = await User.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "user",
          as: "bookings",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          bookingCount: { $size: "$bookings" },
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 10 },
    ]);

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.status(200).json({
      totalUsers,
      totalAdmins,
      totalCustomers,
      recentUsers,
      topUsers: usersWithBookings,
    });
  } catch (error) {
    console.log("Error in getUserStats: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user's bookings
    await Booking.deleteMany({ user: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// User Functions
exports.getProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "phone",
      "address",
      "about",
      "profilePicture",
    ];

    const updatedData = {};

    for (const field of allowedFields) {
      if (req.body[field]) {
        updatedData[field] = req.body[field];
      }
    }

    if (req.body.profilePicture) {
      const result = await cloudinary.uploader.upload(req.body.profilePicture);
      updatedData.profilePicture = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedData },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const user = req.user._id;

    await User.findByIdAndDelete(user);

    res.clearCookie("jwt-luxestay");

    res.json({ message: "Account Deleted Successfully" });
  } catch (error) {
    console.error("Error in deleteAccount", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
