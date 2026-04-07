import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
  getPaymentStats,
} from "../lib/adminApi";
import { format } from "date-fns";
import { Calendar, Search, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";

const AdminBookingsManagementPage = () => {
  const [bookings, setBookings] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const [bookingsData, statsData] = await Promise.all([
        getAllBookings(),
        getPaymentStats()
      ]);
      setBookings(bookingsData?.bookings || []);
      setPaymentStats(statsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error(error.response?.data?.message || "Failed to fetch bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      toast.success("Booking status updated successfully");
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error(error.message || "Failed to update booking status");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await cancelBooking(bookingId);
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(error.message || "Failed to cancel booking");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBookings = (bookings || [])
    .filter((booking) => {
      if (filter === "all") return true;
      return booking.status === filter;
    })
    .filter((booking) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        booking.user?.name?.toLowerCase().includes(search) ||
        booking.user?.email?.toLowerCase().includes(search) ||
        booking.room?.name?.toLowerCase().includes(search) ||
        booking._id?.toLowerCase().includes(search)
      );
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Booking Management</h1>
              <p className="text-gray-600 text-lg">Manage all bookings in the system</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${paymentStats?.totalRevenue ? paymentStats.totalRevenue.toFixed(2) : '0.00'}
                </p>
                <p className="text-xs text-gray-500 mt-1">From completed payments</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Filters */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2 flex-wrap">
                <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All ({bookings.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === "pending"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Pending (
                {bookings.filter((b) => b.status === "pending").length})
              </button>
              <button
                onClick={() => setFilter("confirmed")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === "confirmed"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Confirmed (
                {bookings.filter((b) => b.status === "confirmed").length})
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === "completed"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Completed (
                {bookings.filter((b) => b.status === "completed").length})
              </button>
              <button
                onClick={() => setFilter("cancelled")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === "cancelled"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Cancelled (
                {bookings.filter((b) => b.status === "cancelled").length})
              </button>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by guest, email, room, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Check-out
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Calendar className="w-16 h-16 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-lg font-medium">No bookings found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your filters or search term</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-purple-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {booking._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.user?.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.user?.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.room?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(booking.checkInDate), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(
                          new Date(booking.checkOutDate),
                          "MMM dd, yyyy"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${booking.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status === "confirmed" && <CheckCircle className="w-3 h-3" />}
                          {booking.status === "cancelled" && <XCircle className="w-3 h-3" />}
                          {booking.status === "pending" && <Clock className="w-3 h-3" />}
                          {booking.status === "completed" && <CheckCircle className="w-3 h-3" />}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {booking.status === "pending" && (
                            <button
                              onClick={() =>
                                handleStatusChange(booking._id, "confirmed")
                              }
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                            >
                              Confirm
                            </button>
                          )}
                          {booking.status === "confirmed" && (
                            <button
                              onClick={() =>
                                handleStatusChange(booking._id, "completed")
                              }
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                            >
                              Complete
                            </button>
                          )}
                          {booking.status !== "cancelled" &&
                            booking.status !== "completed" && (
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                              >
                                Cancel
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {filteredBookings.length}
                </div>
                <div className="text-sm text-gray-500">Total Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${paymentStats?.totalRevenue ? paymentStats.totalRevenue.toFixed(2) : '0.00'}
                </div>
                <div className="text-sm text-gray-500">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {
                    filteredBookings.filter(
                      (b) => b.status === "confirmed" || b.status === "pending"
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredBookings.filter((b) => b.status === "completed")
                    .length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminBookingsManagementPage;
