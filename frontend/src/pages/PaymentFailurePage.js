import React, { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { XCircle, AlertTriangle, Home, CreditCard, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

const PaymentFailurePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { payment, booking } = location.state || {};

  useEffect(() => {
    if (!payment || !booking) {
      navigate("/");
    }
  }, [payment, booking, navigate]);

  const handleRetryPayment = () => {
    navigate("/checkout", { state: { booking } });
  };

  if (!payment || !booking) {
    return null;
  }

  const failureReason = payment.failureReason || "Payment was declined by your bank";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Failure Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 px-8 py-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white mb-6"
            >
              <XCircle className="w-16 h-16 text-red-500" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2">Payment Failed</h1>
            <p className="text-red-100 text-lg">
              We couldn't process your payment
            </p>
          </div>

          {/* Failure Details */}
          <div className="px-8 py-8 space-y-6">
            {/* Error Message */}
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-red-800">
                    Payment Processing Error
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {failureReason}
                  </p>
                </div>
              </div>
            </div>

            {/* Common Reasons */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Common Reasons for Payment Failure
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-3"></span>
                  <span>Insufficient funds in your account</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-3"></span>
                  <span>Incorrect card details (number, expiry, or CVV)</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-3"></span>
                  <span>Card expired or blocked by your bank</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-3"></span>
                  <span>Transaction limit exceeded</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-3"></span>
                  <span>Network connectivity issues</span>
                </li>
              </ul>
            </div>

            {/* Booking Details (Still Reserved) */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Booking is Still Reserved
              </h3>
              
              {booking.room && (
                <div className="flex gap-4 mb-4">
                  <img
                    src={booking.room.image}
                    alt={booking.room.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{booking.room.name}</h4>
                    <p className="text-sm text-gray-600">{booking.room.type}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t border-blue-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium text-gray-900">
                    {new Date(booking.checkInDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium text-gray-900">
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                  <span className="font-semibold text-gray-900">Total Amount</span>
                  <span className="font-bold text-lg text-gray-900">
                    ${booking.totalPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* What to Do Next */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-yellow-800">
                    What to do next?
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please check your card details and try again, or use a different payment method. 
                    If the problem persists, contact your bank or try another card.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={handleRetryPayment}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg font-semibold hover:from-primary/90 hover:to-primary/70 transition-all shadow-lg shadow-primary/30"
              >
                <RefreshCcw className="w-5 h-5" />
                Retry Payment
              </button>
              <Link
                to="/rooms"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                Choose Different Room
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
            </div>

            {/* Support */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Need help?{" "}
                <Link to="/contact" className="text-primary font-semibold hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailurePage;
