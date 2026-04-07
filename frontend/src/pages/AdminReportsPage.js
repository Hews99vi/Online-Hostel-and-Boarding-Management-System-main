import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  getSystemSummary,
  getBookingAnalytics,
  getRevenueAnalytics,
  getTopRooms,
  getOccupancyStats,
} from "../lib/adminApi";
import { format, subMonths } from "date-fns";

const AdminReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [bookingAnalytics, setBookingAnalytics] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [topRooms, setTopRooms] = useState(null);
  const [occupancyStats, setOccupancyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryData, bookingData, revenueData, topRoomsData, occupancyData] = await Promise.all([
        getSystemSummary(),
        getBookingAnalytics(dateRange.startDate, dateRange.endDate),
        getRevenueAnalytics(dateRange.startDate, dateRange.endDate),
        getTopRooms(dateRange.startDate, dateRange.endDate, 10),
        getOccupancyStats(dateRange.startDate, dateRange.endDate),
      ]);
      setSummary(summaryData);
      setBookingAnalytics(bookingData);
      setRevenueAnalytics(revenueData);
      setTopRooms(topRoomsData);
      setOccupancyStats(occupancyData);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error(error.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              System Reports
            </h1>
            <p className="text-gray-600">
              Overview of system statistics and analytics
            </p>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={fetchData}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Apply Filter
              </button>
            </div>
          </div>

          {/* System Summary */}
          {summary && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                System Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {summary.users?.total || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Users</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {summary.users?.newThisMonth || 0} new this month
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600">
                    {summary.rooms?.total || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Rooms</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {summary.rooms?.available || 0} available
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-600">
                    {summary.bookings?.total || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {summary.bookings?.active || 0} active
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-orange-600">
                    ${(summary.revenue?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <div className="text-xs text-gray-500 mt-1">
                    ${(summary.revenue?.thisMonth || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} this month
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Booking Analytics */}
          {bookingAnalytics && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Booking Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {bookingAnalytics.totalBookings || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {bookingAnalytics.confirmedBookings || 0}
                  </div>
                  <div className="text-sm text-gray-600">Confirmed</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {bookingAnalytics.cancelledBookings || 0}
                  </div>
                  <div className="text-sm text-gray-600">Cancelled</div>
                </div>
              </div>

              {/* Booking Status Breakdown */}
              {bookingAnalytics.bookingsByStatus && bookingAnalytics.bookingsByStatus.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Status Breakdown
                  </h3>
                  <div className="space-y-2">
                    {bookingAnalytics.bookingsByStatus.map((status) => (
                      <div key={status._id} className="flex items-center">
                        <div className="w-32 text-sm font-medium text-gray-700 capitalize">
                          {status._id}:
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-200 rounded-full h-6 relative">
                            <div
                              className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                              style={{
                                width: `${
                                  (status.count / (bookingAnalytics.totalBookings || 1)) * 100
                                }%`,
                                minWidth: status.count > 0 ? "50px" : "0px"
                              }}
                            >
                              <span className="text-xs text-white font-medium">
                                {status.count}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly Trends */}
              {bookingAnalytics.bookingsByMonth && bookingAnalytics.bookingsByMonth.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Monthly Trends
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Month
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Bookings
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookingAnalytics.bookingsByMonth.map((month, idx) => (
                          <tr key={`${month.year}-${month.month}-${idx}`}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {new Date(month.year, month.month - 1).toLocaleDateString(
                                "en-US",
                                { year: "numeric", month: "long" }
                              )}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {month.count || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Revenue Analytics */}
          {revenueAnalytics && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Revenue Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600">
                    ${(revenueAnalytics.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Avg: ${((revenueAnalytics.totalRevenue || 0) / (revenueAnalytics.totalTransactions || 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/transaction
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {revenueAnalytics.totalTransactions || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Transactions
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              {revenueAnalytics.revenueByMethod && revenueAnalytics.revenueByMethod.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Revenue by Payment Method
                  </h3>
                  <div className="space-y-2">
                    {revenueAnalytics.revenueByMethod.map((method, idx) => (
                      <div key={`${method._id}-${idx}`} className="flex items-center">
                        <div className="w-32 text-sm font-medium text-gray-700 capitalize">
                          {method._id || "Unknown"}:
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-200 rounded-full h-6 relative">
                            <div
                              className="bg-green-600 h-6 rounded-full flex items-center justify-end pr-2"
                              style={{
                                width: `${
                                  ((method.total || 0) / (revenueAnalytics.totalRevenue || 1)) *
                                  100
                                }%`,
                                minWidth: method.total > 0 ? "80px" : "0px"
                              }}
                            >
                              <span className="text-xs text-white font-medium">
                                ${(method.total || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly Revenue */}
              {revenueAnalytics.revenueByMonth && revenueAnalytics.revenueByMonth.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Monthly Revenue
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Month
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Revenue
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Transactions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {revenueAnalytics.revenueByMonth.map((month, idx) => (
                          <tr key={`${month.year}-${month.month}-${idx}`}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {new Date(month.year, month.month - 1).toLocaleDateString(
                                "en-US",
                                { year: "numeric", month: "long" }
                              )}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-green-600">
                              ${(month.revenue || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {month.count || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Top Performing Rooms */}
          {topRooms && topRooms.topRooms && topRooms.topRooms.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Top Performing Rooms
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Room Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Bookings
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Revenue
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Avg/Booking
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topRooms.topRooms.map((room, idx) => (
                      <tr key={`${room._id}-${idx}`}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {room.roomName}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600 capitalize">
                          {room.roomType}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {room.totalBookings}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-green-600">
                          ${(room.totalRevenue || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          ${(room.averageRevenuePerBooking || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Occupancy Statistics */}
          {occupancyStats && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Occupancy Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-indigo-600">
                    {occupancyStats.occupancyRate}%
                  </div>
                  <div className="text-sm text-gray-600">Occupancy Rate</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {occupancyStats.totalRooms || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Rooms</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-600">
                    {occupancyStats.activeBookings || 0}
                  </div>
                  <div className="text-sm text-gray-600">Active Bookings</div>
                </div>
              </div>

              {/* Room Type Occupancy */}
              {occupancyStats.roomTypeOccupancy && occupancyStats.roomTypeOccupancy.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Occupancy by Room Type
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Room Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Bookings
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Total Rooms
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Occupancy Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {occupancyStats.roomTypeOccupancy.map((type, idx) => (
                          <tr key={`${type._id}-${idx}`}>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 capitalize">
                              {type._id}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {type.bookings || 0}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {type.totalRooms || 0}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-indigo-600">
                              {(type.occupancyRate || 0).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Activity */}
          {summary && summary.recentActivity && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Recent Bookings
                  </h3>
                  {summary.recentActivity.recentBookings && summary.recentActivity.recentBookings.length > 0 ? (
                    <div className="space-y-2">
                      {summary.recentActivity.recentBookings.map((booking) => (
                        <div
                          key={booking._id}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.user?.name || "Unknown"} booked {booking.room?.name || "Unknown Room"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(
                                new Date(booking.createdAt),
                                "MMM dd, yyyy HH:mm"
                              )}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            ${(booking.totalPrice || 0).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No recent bookings</p>
                  )}
                </div>

                {/* Recent Payments */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Recent Payments
                  </h3>
                  {summary.recentActivity.recentPayments && summary.recentActivity.recentPayments.length > 0 ? (
                    <div className="space-y-2">
                      {summary.recentActivity.recentPayments.map((payment) => (
                        <div
                          key={payment._id}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              Payment via {payment.paymentMethod || "Unknown"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(
                                new Date(payment.createdAt),
                                "MMM dd, yyyy HH:mm"
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                payment.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : payment.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {payment.status || "pending"}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              ${(payment.amount || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No recent payments</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
