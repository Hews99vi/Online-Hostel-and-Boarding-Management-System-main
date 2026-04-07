import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { CreditCard, Calendar, Download, Filter } from "lucide-react";
import { getUserPayments } from "../lib/paymentApi";
import { useAuthStore } from "../store/useAuthStore";

const PaymentHistoryPage = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, completed, failed, refunded

  useEffect(() => {
    if (!authUser) {
      navigate("/login");
      return;
    }
    fetchPayments();
  }, [authUser, navigate]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getUserPayments();
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFilteredPayments = () => {
    return payments.filter((payment) => {
      if (filter === "all") return true;
      return payment.status === filter;
    });
  };

  const downloadReceipt = (payment, booking) => {
    const receiptContent = `
=====================================
      LUXESTAY HOTEL RECEIPT
=====================================

Transaction ID: ${payment.transactionId || "N/A"}
Date: ${payment.paymentDate ? new Date(payment.paymentDate).toLocaleString() : "N/A"}

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
Card: ${payment.cardDetails?.cardType || "N/A"} **** ${payment.cardDetails?.cardLastFour || "****"}
Status: ${payment.status.toUpperCase()}

=====================================
    Thank you for choosing LuxeStay!
=====================================
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${payment.transactionId || payment._id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const calculateTotalSpent = () => {
    return payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const filteredPayments = getFilteredPayments();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment History</h1>
          <p className="text-gray-600">
            View all your transactions and download receipts
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Payments</p>
                <p className="text-3xl font-bold text-gray-900">{payments.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-green-600">
                  ${calculateTotalSpent()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Successful</p>
                <p className="text-3xl font-bold text-gray-900">
                  {payments.filter((p) => p.status === "completed").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200 bg-white rounded-t-xl shadow-md">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex space-x-8">
              {[
                { value: "all", label: "All Payments" },
                { value: "completed", label: "Completed" },
                { value: "failed", label: "Failed" },
                { value: "refunded", label: "Refunded" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    filter === tab.value
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {tab.value === "all"
                      ? payments.length
                      : payments.filter((p) => p.status === tab.value).length}
                  </span>
                </button>
              ))}
            </div>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-b-xl shadow-md">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === "all"
                ? "You haven't made any payments yet."
                : `No ${filter} payments found.`}
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
            {filteredPayments.map((payment) => (
              <div
                key={payment._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1)}
                        </span>
                        {payment.transactionId && (
                          <span className="text-xs text-gray-500 font-mono">
                            ID: {payment.transactionId}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {payment.paymentDate
                          ? formatDate(payment.paymentDate)
                          : formatDate(payment.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${payment.amount}
                      </p>
                      {payment.refundAmount > 0 && (
                        <p className="text-sm text-purple-600">
                          Refunded: ${payment.refundAmount}
                        </p>
                      )}
                    </div>
                  </div>

                  {payment.booking && (
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex gap-4">
                        {payment.booking.room && (
                          <>
                            <img
                              src={payment.booking.room.image}
                              alt={payment.booking.room.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {payment.booking.room.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {payment.booking.room.type}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>
                                  Check-in:{" "}
                                  {new Date(
                                    payment.booking.checkInDate
                                  ).toLocaleDateString()}
                                </span>
                                <span>•</span>
                                <span>
                                  Check-out:{" "}
                                  {new Date(
                                    payment.booking.checkOutDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-4 mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        {payment.paymentMethod.replace("_", " ").toUpperCase()}
                      </span>
                      {payment.cardDetails && (
                        <>
                          <span>•</span>
                          <span>
                            {payment.cardDetails.cardType} ****{" "}
                            {payment.cardDetails.cardLastFour}
                          </span>
                        </>
                      )}
                    </div>
                    {payment.status === "completed" && payment.booking && (
                      <button
                        onClick={() => downloadReceipt(payment, payment.booking)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download Receipt
                      </button>
                    )}
                  </div>

                  {payment.failureReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                      <p className="text-sm text-red-700">
                        <span className="font-semibold">Failure Reason:</span>{" "}
                        {payment.failureReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
