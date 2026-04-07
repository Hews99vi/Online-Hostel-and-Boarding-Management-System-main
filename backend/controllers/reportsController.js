const User = require("../models/User.js");
const Room = require("../models/Room.js");
const Booking = require("../models/Booking.js");
const Payment = require("../models/Payment.js");

// Get comprehensive system summary
exports.getSystemSummary = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: "admin" });
    const userCount = await User.countDocuments({ role: "user" });

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await User.countDocuments({ 
      createdAt: { $gte: startOfMonth } 
    });

    // Room statistics
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ available: true });
    const unavailableRooms = await Room.countDocuments({ available: false });

    const roomsByType = await Room.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    // Booking statistics
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: "confirmed" });
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const cancelledBookings = await Booking.countDocuments({ status: "cancelled" });
    const completedBookings = await Booking.countDocuments({ status: "completed" });
    const activeBookings = confirmedBookings + pendingBookings;

    // Payment statistics
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ status: "completed" });
    const failedPayments = await Payment.countDocuments({ status: "failed" });

    // Revenue statistics - Total all time
    const revenueData = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          averageTransaction: { $avg: "$amount" },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const averageTransaction = revenueData[0]?.averageTransaction || 0;

    // Revenue this month
    const revenueThisMonth = await Payment.aggregate([
      { 
        $match: { 
          status: "completed",
          createdAt: { $gte: startOfMonth }
        } 
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const thisMonthRevenue = revenueThisMonth[0]?.total || 0;

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Recent activity
    const recentBookings = await Booking.find()
      .populate("user", "name email")
      .populate("room", "name type")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPayments = await Payment.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      users: {
        total: totalUsers,
        admins: adminCount,
        regular: userCount,
        newThisMonth: newThisMonth,
      },
      rooms: {
        total: totalRooms,
        available: availableRooms,
        unavailable: unavailableRooms,
        byType: roomsByType,
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        pending: pendingBookings,
        cancelled: cancelledBookings,
        completed: completedBookings,
        active: activeBookings,
      },
      payments: {
        total: totalPayments,
        completed: completedPayments,
        failed: failedPayments,
      },
      revenue: {
        total: totalRevenue,
        average: averageTransaction,
        monthly: monthlyRevenue,
        thisMonth: thisMonthRevenue,
      },
      recentActivity: {
        recentBookings: recentBookings,
        recentPayments: recentPayments,
      },
    });
  } catch (error) {
    console.error("Error in getSystemSummary:", error);
    res.status(500).json({ message: "Error fetching system summary", error: error.message });
  }
};

// Get booking analytics
exports.getBookingAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Total bookings in date range
    const totalBookings = await Booking.countDocuments(dateFilter);
    
    // Bookings by status
    const bookingsByStatus = await Booking.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$status", count: { $sum: 1 }, totalAmount: { $sum: "$totalPrice" } } },
    ]);

    // Count specific statuses
    const confirmedBookings = bookingsByStatus.find(b => b._id === "confirmed")?.count || 0;
    const cancelledBookings = bookingsByStatus.find(b => b._id === "cancelled")?.count || 0;
    const pendingBookings = bookingsByStatus.find(b => b._id === "pending")?.count || 0;
    const completedBookings = bookingsByStatus.find(b => b._id === "completed")?.count || 0;

    // Bookings by room
    const bookingsByRoom = await Booking.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$room", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "rooms",
          localField: "_id",
          foreignField: "_id",
          as: "roomInfo",
        },
      },
      { $unwind: "$roomInfo" },
      {
        $project: {
          roomName: "$roomInfo.name",
          roomType: "$roomInfo.type",
          count: 1
        }
      }
    ]);

    // Monthly bookings aggregation
    const bookingsByMonth = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          count: 1
        }
      }
    ]);

    res.status(200).json({
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      pendingBookings,
      completedBookings,
      bookingsByStatus,
      bookingsByRoom,
      bookingsByMonth,
    });
  } catch (error) {
    console.error("Error in getBookingAnalytics:", error);
    res.status(500).json({ message: "Error fetching booking analytics", error: error.message });
  }
};

// Get revenue analytics
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = { status: "completed" };
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Total revenue and transactions
    const revenueTotal = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = revenueTotal[0]?.totalRevenue || 0;
    const totalTransactions = revenueTotal[0]?.totalTransactions || 0;

    // Revenue by payment method
    const revenueByMethod = await Payment.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$paymentMethod", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // Monthly revenue
    const revenueByMonth = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          revenue: 1,
          count: 1
        }
      }
    ]);

    res.status(200).json({
      totalRevenue,
      totalTransactions,
      revenueByMethod,
      revenueByMonth,
    });
  } catch (error) {
    console.error("Error in getRevenueAnalytics:", error);
    res.status(500).json({ message: "Error fetching revenue analytics", error: error.message });
  }
};

// Get top performing rooms
exports.getTopRooms = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const topRooms = await Booking.aggregate([
      { $match: { ...dateFilter, status: { $in: ["confirmed", "completed"] } } },
      {
        $group: {
          _id: "$room",
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "rooms",
          localField: "_id",
          foreignField: "_id",
          as: "roomInfo",
        },
      },
      { $unwind: "$roomInfo" },
      {
        $project: {
          _id: 1,
          roomName: "$roomInfo.name",
          roomType: "$roomInfo.type",
          roomPrice: "$roomInfo.price",
          totalBookings: 1,
          totalRevenue: 1,
          averageRevenuePerBooking: { 
            $divide: ["$totalRevenue", "$totalBookings"] 
          }
        }
      }
    ]);

    res.status(200).json({
      topRooms,
      totalRooms: topRooms.length
    });
  } catch (error) {
    console.error("Error in getTopRooms:", error);
    res.status(500).json({ message: "Error fetching top rooms", error: error.message });
  }
};

// Get occupancy rate and statistics
exports.getOccupancyStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.$or = [
        {
          checkInDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        },
        {
          checkOutDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        },
        {
          checkInDate: { $lte: new Date(startDate) },
          checkOutDate: { $gte: new Date(endDate) }
        }
      ];
    }

    // Total available rooms
    const totalRooms = await Room.countDocuments();
    
    // Active bookings (confirmed or completed)
    const activeBookings = await Booking.countDocuments({
      ...dateFilter,
      status: { $in: ["confirmed", "completed"] }
    });

    // Calculate occupancy rate
    const totalPossibleBookings = totalRooms * (endDate && startDate ? 
      Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) : 30);
    
    const occupancyRate = totalRooms > 0 ? (activeBookings / totalPossibleBookings * 100) : 0;

    // Room type occupancy
    const roomTypeOccupancy = await Booking.aggregate([
      { $match: { ...dateFilter, status: { $in: ["confirmed", "completed"] } } },
      {
        $lookup: {
          from: "rooms",
          localField: "room",
          foreignField: "_id",
          as: "roomInfo",
        },
      },
      { $unwind: "$roomInfo" },
      {
        $group: {
          _id: "$roomInfo.type",
          bookings: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "rooms",
          let: { roomType: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$type", "$$roomType"] } } },
            { $count: "total" }
          ],
          as: "totalRoomsOfType",
        },
      },
      {
        $project: {
          _id: 1,
          bookings: 1,
          totalRooms: { $arrayElemAt: ["$totalRoomsOfType.total", 0] },
          occupancyRate: {
            $multiply: [
              {
                $divide: [
                  "$bookings",
                  { $multiply: [{ $arrayElemAt: ["$totalRoomsOfType.total", 0] }, 30] }
                ]
              },
              100
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      totalRooms,
      activeBookings,
      occupancyRate: occupancyRate.toFixed(2),
      roomTypeOccupancy,
    });
  } catch (error) {
    console.error("Error in getOccupancyStats:", error);
    res.status(500).json({ message: "Error fetching occupancy statistics", error: error.message });
  }
};
