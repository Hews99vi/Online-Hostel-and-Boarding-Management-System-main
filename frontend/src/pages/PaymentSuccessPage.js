import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle, Download, Home, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { payment, booking } = location.state || {};
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!payment || !booking) {
      navigate("/");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/my-bookings");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [payment, booking, navigate]);

  const handleDownloadReceipt = () => {
    // Create a simple receipt
    const receiptContent = `
=====================================
      LUXESTAY HOTEL RECEIPT
=====================================

Transaction ID: ${payment.transactionId}
Date: ${new Date(payment.paymentDate).toLocaleString()}

Guest Information:
Name: ${booking.guestName}
Email: ${booking.guestEmail}
Phone: ${booking.guestPhone}

Booking Details:
Room: ${booking.room.name}
Type: ${booking.room.type}
Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}
Check-out: ${new Date(booking.checkOutDate).toLocaleDateString()}
Guests: ${booking.guests}

Payment Information:
Amount Paid: $${payment.amount}
Payment Method: ${payment.paymentMethod.replace("_", " ").toUpperCase()}
Card: ${payment.cardDetails?.cardType} **** ${payment.cardDetails?.cardLastFour}
Status: ${payment.status.toUpperCase()}

=====================================
    Thank you for choosing LuxeStay!
=====================================
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${payment.transactionId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (!payment || !booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white mb-6"
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-green-100 text-lg">
              Your booking has been confirmed
            </p>
          </div>

          {/* Payment Details */}
          <div className="px-8 py-8 space-y-6">
            {/* Transaction Info */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Transaction Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {payment.transactionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(payment.paymentDate).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-semibold text-gray-900">
                    {payment.cardDetails?.cardType} **** {payment.cardDetails?.cardLastFour}
                  </span>
                </div>
                <div className="flex justify-between text-lg pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Amount Paid</span>
                  <span className="font-bold text-green-600 text-xl">
                    ${payment.amount}
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Booking Summary
              </h3>
              
              {booking.room && (
                <div className="flex gap-4 mb-4">
                  <img
                    src={booking.room.image}
                    alt={booking.room.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{booking.room.name}</h4>
                    <p className="text-sm text-gray-600">{booking.room.type}</p>
                    <p className="text-sm text-gray-600">
                      Capacity: {booking.room.capacity} guests
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Guest Name</span>
                  <span className="font-medium text-gray-900">{booking.guestName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium text-gray-900">
                    {new Date(booking.checkInDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium text-gray-900">
                    {new Date(booking.checkOutDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Number of Guests</span>
                  <span className="font-medium text-gray-900">{booking.guests}</span>
                </div>
              </div>
            </div>

            {/* Confirmation Message */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex">
                <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    A confirmation email has been sent to{" "}
                    <span className="font-semibold">{booking.guestEmail}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={handleDownloadReceipt}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Receipt
              </button>
              <Link
                to="/my-bookings"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                View My Bookings
              </Link>
            </div>

            <div className="text-center pt-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-4 h-4" />
                Return to Home
              </Link>
              <p className="text-xs text-gray-500 mt-2">
                Redirecting to your bookings in {countdown} seconds...
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;
