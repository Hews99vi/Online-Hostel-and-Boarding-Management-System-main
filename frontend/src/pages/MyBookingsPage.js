import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getUserBookings, cancelBooking } from "../lib/bookingApi";
import { useAuthStore } from "../store/useAuthStore";

const MyBookingsPage = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [filter, setFilter] = useState("all"); // all, upcoming, past, cancelled

  useEffect(() => {
    if (!authUser) {
      navigate("/login");
      return;
    }
    fetchBookings();
  }, [authUser, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getUserBookings();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setCancellingId(bookingId);
      await cancelBooking(bookingId);
      toast.success("Booking cancelled successfully");
      fetchBookings(); // Refresh bookings
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(
        error.response?.data?.message || "Failed to cancel booking"
      );
    } finally {
      setCancellingId(null);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFilteredBookings = () => {
    const now = new Date();
    return bookings.filter((booking) => {
      const checkInDate = new Date(booking.checkInDate);
      const checkOutDate = new Date(booking.checkOutDate);

      switch (filter) {
        case "upcoming":
          return checkInDate > now && booking.status !== "cancelled";
        case "past":
          return checkOutDate < now || booking.status === "completed";
        case "cancelled":
          return booking.status === "cancelled";
        default:
          return true;
      }
    });
  };

  const canCancelBooking = (booking) => {
    if (booking.status !== "confirmed" && booking.status !== "pending") {
      return false;
    }
    const now = new Date();
    const checkIn = new Date(booking.checkInDate);
    const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);
    return hoursUntilCheckIn >= 24;
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            Manage and view all your hotel reservations
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            {[
              { value: "all", label: "All Bookings" },
              { value: "upcoming", label: "Upcoming" },
              { value: "past", label: "Past" },
              { value: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  filter === tab.value
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No bookings found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === "all"
                ? "Start exploring our rooms and make your first booking!"
                : `No ${filter} bookings at the moment.`}
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/rooms")}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
              >
                Browse Rooms
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="md:flex">
                  {/* Room Image */}
                  <div className="md:w-64 h-48 md:h-auto">
                    <img
                      src={booking.room.image}
                      alt={booking.room.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {booking.room.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {booking.room.type} • Capacity: {booking.room.capacity}{" "}
                          guests
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Check-in</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(booking.checkInDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Check-out</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(booking.checkOutDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Guests</p>
                        <p className="font-semibold text-gray-900">
                          {booking.guests}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Total Price</p>
                        <p className="font-semibold text-gray-900 text-lg">
                          ${booking.totalPrice}
                        </p>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">
                          Special Requests
                        </p>
                        <p className="text-sm text-gray-700">
                          {booking.specialRequests}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Booked on {formatDate(booking.createdAt)}
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigate(`/rooms/${booking.room._id}`)}
                          className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          View Room
                        </button>
                        {canCancelBooking(booking) && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={cancellingId === booking._id}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancellingId === booking._id
                              ? "Cancelling..."
                              : "Cancel Booking"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
