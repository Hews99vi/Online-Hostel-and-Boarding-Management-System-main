import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Lock, CreditCard, Shield, CheckCircle } from "lucide-react";
import { createPaymentIntent, confirmPayment } from "../lib/paymentApi";
import { useAuthStore } from "../store/useAuthStore";

// Initialize Stripe
const stripePromise = loadStripe("pk_test_51RysdWHFZzyupWUp5Cj4MUZ0u7haEC10uOCRDzAkdhQGKF5gv1KWKube1SuJc3mGMTWPvbXxhTL3vW3LZxh6o7Kc00e0K8Jp98");

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
  hidePostalCode: false,
};

const CheckoutForm = ({ booking, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentId, setPaymentId] = useState("");

  useEffect(() => {
    // Create payment intent when component mounts
    const initializePayment = async () => {
      try {
        console.log("Creating payment intent for booking:", booking._id);
        const response = await createPaymentIntent(booking._id);
        console.log("Payment intent created:", response);
        setClientSecret(response.clientSecret);
        setPaymentId(response.paymentId);
        toast.success("Payment initialized successfully!");
      } catch (error) {
        console.error("Error initializing payment:", error);
        console.error("Error response:", error.response);
        toast.error(error.response?.data?.message || "Failed to initialize payment. Please try again.");
      }
    };

    if (booking?._id) {
      initializePayment();
    } else {
      console.error("No booking ID found");
      toast.error("Booking information is missing");
    }
  }, [booking?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: booking.user?.name || "Guest",
          },
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // Confirm payment in our backend
        const result = await confirmPayment(paymentIntent.id, paymentId);
        toast.success("Payment successful!");
        onSuccess(result.payment);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Security Badge */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-900">Secure Payment</p>
          <p className="text-xs text-green-700">Your payment information is encrypted and secure</p>
        </div>
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Card Information
        </label>
        <div className="border-2 border-gray-300 rounded-lg p-4 hover:border-primary transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Test card: 4242 4242 4242 4242 | Exp: Any future date | CVV: Any 3 digits
        </p>
      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200">
        <div className="text-center">
          <Lock className="w-6 h-6 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-600">SSL Encrypted</p>
        </div>
        <div className="text-center">
          <Shield className="w-6 h-6 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-600">PCI Compliant</p>
        </div>
        <div className="text-center">
          <CheckCircle className="w-6 h-6 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-600">Money Back</p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        className="w-full bg-gradient-to-r from-primary to-primary/80 text-white py-4 rounded-lg font-semibold text-lg hover:from-primary/90 hover:to-primary/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing...
          </>
        ) : !clientSecret ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Initializing Payment...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay ${booking.totalPrice}
          </>
        )}
      </button>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>Stripe loaded: {stripe ? '✓' : '✗'}</p>
          <p>Client Secret: {clientSecret ? '✓' : '✗'}</p>
          <p>Payment ID: {paymentId ? '✓' : '✗'}</p>
        </div>
      )}

      <p className="text-xs text-center text-gray-500">
        By confirming your payment, you agree to our terms and conditions
      </p>
    </form>
  );
};

const StripeCheckoutPage = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;

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

  const handlePaymentSuccess = (payment) => {
    navigate("/payment-success", {
      state: { payment, booking },
    });
  };

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Secure payment powered by Stripe</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <Elements stripe={stripePromise}>
                <CheckoutForm booking={booking} onSuccess={handlePaymentSuccess} />
              </Elements>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-4">
                {booking.room && (
                  <>
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <img
                        src={booking.room.image || booking.room.images?.[0]}
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

                <div className="border-t border-gray-200 pt-4 space-y-3">
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
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nights</span>
                    <span className="font-medium text-gray-900">
                      {Math.ceil(
                        (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Room Price</span>
                    <span className="text-gray-900">${booking.room?.price || 0}/night</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="text-gray-900">$0</span>
                  </div>
                </div>

                <div className="border-t-2 border-gray-300 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-primary text-2xl">${booking.totalPrice}</span>
                  </div>
                </div>

                {/* Refund Policy */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-xs text-blue-900 font-medium mb-1">Cancellation Policy</p>
                  <p className="text-xs text-blue-700">
                    Free cancellation within 24 hours of booking. After that, cancellation fees
                    may apply.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckoutPage;
