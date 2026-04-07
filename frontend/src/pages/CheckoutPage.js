import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { CreditCard, Lock, Calendar, User as UserIcon } from "lucide-react";
import { createPayment } from "../lib/paymentApi";
import { useAuthStore } from "../store/useAuthStore";

const CheckoutPage = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: "credit_card",
    cardHolderName: authUser?.name || "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  useEffect(() => {
    if (!authUser) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    if (!booking) {
      toast.error("No booking information found");
      navigate("/rooms");
      return;
    }
  }, [authUser, booking, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      // Format card number with spaces
      if (name === "cardNumber") {
        const formatted = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
        setFormData((prev) => ({ ...prev, [name]: formatted }));
      }
      // Format expiry date
      else if (name === "expiryDate") {
        let formatted = value.replace(/\D/g, "");
        if (formatted.length >= 2) {
          formatted = formatted.slice(0, 2) + "/" + formatted.slice(2, 4);
        }
        setFormData((prev) => ({ ...prev, [name]: formatted }));
      }
      // Format CVV
      else if (name === "cvv") {
        const formatted = value.replace(/\D/g, "").slice(0, 4);
        setFormData((prev) => ({ ...prev, [name]: formatted }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const validateForm = () => {
    if (!formData.cardHolderName) {
      toast.error("Card holder name is required");
      return false;
    }

    const cardNumber = formData.cardNumber.replace(/\s/g, "");
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      toast.error("Invalid card number");
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      toast.error("Invalid expiry date format (MM/YY)");
      return false;
    }

    if (formData.cvv.length < 3) {
      toast.error("Invalid CVV");
      return false;
    }

    if (!formData.billingAddress.street || !formData.billingAddress.city || 
        !formData.billingAddress.zipCode || !formData.billingAddress.country) {
      toast.error("Please complete billing address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const paymentData = {
        bookingId: booking._id,
        amount: booking.totalPrice,
        paymentMethod: formData.paymentMethod,
        cardDetails: {
          cardHolderName: formData.cardHolderName,
          cardNumber: formData.cardNumber.replace(/\s/g, ""),
          cardType: getCardType(formData.cardNumber),
        },
        billingAddress: formData.billingAddress,
      };

      const result = await createPayment(paymentData);

      if (result.payment.status === "completed") {
        toast.success("Payment successful!");
        navigate("/payment-success", { 
          state: { payment: result.payment, booking } 
        });
      } else {
        navigate("/payment-failure", { 
          state: { payment: result.payment, booking } 
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      
      if (error.response?.status === 402) {
        navigate("/payment-failure", { 
          state: { 
            payment: error.response.data.payment, 
            booking 
          } 
        });
      } else {
        toast.error(error.response?.data?.message || "Payment processing failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const getCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, "");
    if (/^4/.test(number)) return "Visa";
    if (/^5[1-5]/.test(number)) return "Mastercard";
    if (/^3[47]/.test(number)) return "American Express";
    if (/^6(?:011|5)/.test(number)) return "Discover";
    return "Unknown";
  };

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
          <p className="text-gray-600">Complete your booking payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: "credit_card" })}
                    className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      formData.paymentMethod === "credit_card"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Credit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: "debit_card" })}
                    className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      formData.paymentMethod === "debit_card"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Debit Card</span>
                  </button>
                </div>
              </div>

              {/* Card Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-600" />
                  Card Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Holder Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="cardHolderName"
                      value={formData.cardHolderName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  {formData.cardNumber && (
                    <p className="text-xs text-gray-500 mt-1">
                      Card Type: {getCardType(formData.cardNumber)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        maxLength="4"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="billingAddress.street"
                    value={formData.billingAddress.street}
                    onChange={handleChange}
                    placeholder="123 Main St"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="billingAddress.city"
                      value={formData.billingAddress.city}
                      onChange={handleChange}
                      placeholder="New York"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="billingAddress.state"
                      value={formData.billingAddress.state}
                      onChange={handleChange}
                      placeholder="NY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      name="billingAddress.zipCode"
                      value={formData.billingAddress.zipCode}
                      onChange={handleChange}
                      placeholder="10001"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="billingAddress.country"
                      value={formData.billingAddress.country}
                      onChange={handleChange}
                      placeholder="United States"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Pay ${booking.totalPrice}
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500">
                Your payment information is encrypted and secure
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-4">
                {booking.room && (
                  <>
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <img
                        src={booking.room.image}
                        alt={booking.room.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900">{booking.room.name}</h4>
                      <p className="text-sm text-gray-600">{booking.room.type}</p>
                    </div>
                  </>
                )}

                <div className="border-t border-gray-200 pt-4 space-y-2">
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
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Guests</span>
                    <span className="font-medium text-gray-900">{booking.guests}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span className="text-primary">${booking.totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
