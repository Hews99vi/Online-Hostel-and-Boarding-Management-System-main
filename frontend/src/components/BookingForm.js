import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { createBooking, checkAvailability } from "../lib/bookingApi";
import { useAuthStore } from "../store/useAuthStore";

const BookingForm = ({ room, onBookingSuccess }) => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);

  const [formData, setFormData] = useState({
    checkInDate: "",
    checkOutDate: "",
    guests: 1,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    specialRequests: "",
  });

  const [totalPrice, setTotalPrice] = useState(0);
  const [nights, setNights] = useState(0);

  // Sync form data with authUser when it becomes available
  useEffect(() => {
    if (authUser) {
      setFormData((prev) => ({
        ...prev,
        guestName: prev.guestName || authUser.name || "",
        guestEmail: prev.guestEmail || authUser.email || "",
        guestPhone: prev.guestPhone || authUser.phone || "",
      }));
    }
  }, [authUser]);

  // Calculate price when dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const nightsCount = Math.ceil(
        (checkOut - checkIn) / (1000 * 60 * 60 * 24),
      );

      if (nightsCount > 0) {
        setNights(nightsCount);
        setTotalPrice(nightsCount * room.price);
      } else {
        setNights(0);
        setTotalPrice(0);
      }
    }
  }, [formData.checkInDate, formData.checkOutDate, room.price]);

  // Check availability when dates change
  useEffect(() => {
    const checkDates = async () => {
      if (formData.checkInDate && formData.checkOutDate) {
        setCheckingAvailability(true);
        try {
          const result = await checkAvailability(
            room._id,
            formData.checkInDate,
            formData.checkOutDate,
          );
          setIsAvailable(result.available);
          if (!result.available) {
            toast.error("Room is not available for selected dates");
          }
        } catch (error) {
          console.error("Error checking availability:", error);
          // If it's an auth error, notify user to login
          if (error.response?.status === 401) {
            toast.error("Please login to check availability");
            setIsAvailable(null);
          } else {
            toast.error("Unable to check availability. Please try again.");
            setIsAvailable(null);
          }
        } finally {
          setCheckingAvailability(false);
        }
      }
    };

    const debounceTimer = setTimeout(checkDates, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.checkInDate, formData.checkOutDate, room._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!authUser) {
      toast.error("Please login to make a booking");
      return;
    }

    if (!formData.checkInDate || !formData.checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (isAvailable === false) {
      toast.error("Room is not available for selected dates");
      return;
    }

    if (formData.guests > room.capacity) {
      toast.error(`Maximum capacity is ${room.capacity} guests`);
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        roomId: room._id,
        ...formData,
      };

      const result = await createBooking(bookingData);
      toast.success("Booking created! Proceeding to payment...");

      // Navigate to Stripe checkout with booking data
      navigate("/stripe-checkout", { state: { booking: result.booking } });
    } catch (error) {
      console.error("Booking error:", error);
      if (error.response?.data?.conflict) {
        toast.error("Room is already booked for these dates");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to create booking",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Get today's date for min date validation
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 lg:sticky lg:top-24">
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-3xl font-bold text-gray-900">
              ${room.price}
            </span>
            <span className="text-gray-600 ml-1">/ night</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Check-in Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in Date
          </label>
          <input
            type="date"
            name="checkInDate"
            value={formData.checkInDate}
            onChange={handleChange}
            min={today}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-out Date
          </label>
          <input
            type="date"
            name="checkOutDate"
            value={formData.checkOutDate}
            onChange={handleChange}
            min={formData.checkInDate || today}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Availability Status */}
        {checkingAvailability && (
          <div className="text-sm text-gray-600">Checking availability...</div>
        )}
        {!checkingAvailability && isAvailable !== null && (
          <div
            className={`text-sm font-medium ${
              isAvailable ? "text-green-600" : "text-red-600"
            }`}
          >
            {isAvailable ? "✓ Available" : "✗ Not available"}
          </div>
        )}

        {/* Number of Guests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Guests
          </label>
          <input
            type="number"
            name="guests"
            value={formData.guests}
            onChange={handleChange}
            min="1"
            max={room.capacity}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum capacity: {room.capacity} guests
          </p>
        </div>

        {/* Guest Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guest Name
          </label>
          <input
            type="text"
            name="guestName"
            value={formData.guestName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Guest Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guest Email
          </label>
          <input
            type="email"
            name="guestEmail"
            value={formData.guestEmail}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Guest Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guest Phone
          </label>
          <input
            type="tel"
            name="guestPhone"
            value={formData.guestPhone}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requests (Optional)
          </label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Any special requirements..."
          />
        </div>

        {/* Price Summary */}
        {nights > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                ${room.price} × {nights} night{nights > 1 ? "s" : ""}
              </span>
              <span>${totalPrice}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>${totalPrice}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || checkingAvailability || isAvailable === false}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Book Now"}
        </button>

        {!authUser && (
          <p className="text-xs text-center text-gray-500">
            Please login to make a booking
          </p>
        )}
      </form>
    </div>
  );
};

export default BookingForm;
