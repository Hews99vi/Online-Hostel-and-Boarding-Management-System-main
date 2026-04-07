import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";

// Importing pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import ContactPage from "./pages/ContactPage";
import AmenitiesPage from "./pages/AmenitiesPage";
import DashboardPage from "./pages/DashboardPage";
import RoomsPage from "./pages/RoomsPage";
import RoomDetailsPage from "./pages/RoomDetailsPage";
import AdminCreateRoomPage from "./pages/AdminCreateRoomPage";
import AdminEditRoomPage from "./pages/AdminEditRoomPage";
import AdminChatPage from "./pages/AdminChatPage";
import UserChatPage from "./pages/UserChatPage";
import AdminBookingsManagementPage from "./pages/AdminBookingsManagementPage";
import AdminUsersManagementPage from "./pages/AdminUsersManagementPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import CheckoutPage from "./pages/CheckoutPage";
import StripeCheckoutPage from "./pages/StripeCheckoutPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentFailurePage from "./pages/PaymentFailurePage";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import MyBookingsPage from "./pages/MyBookingsPage";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });
  console.log("User Role:", authUser?.role);
  console.log("Is Admin?", authUser?.role === "admin");

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Routes>
        {/* Routes with Navbar and Footer */}
        <Route element={<Layout />}>
          <Route 
            path="/" 
            element={
              authUser?.role === "admin" ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <HomePage />
              )
            } 
          />
          <Route path="/amenities" element={<AmenitiesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:id" element={<RoomDetailsPage />} />
          <Route
            path="/dashboard"
            element={
              authUser?.role === "admin" ? (
                <DashboardPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/dashboard/rooms/new"
            element={
              authUser?.role === "admin" ? (
                <AdminCreateRoomPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/dashboard/rooms/:id/edit"
            element={
              authUser?.role === "admin" ? (
                <AdminEditRoomPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/dashboard/bookings"
            element={
              authUser?.role === "admin" ? (
                <AdminBookingsManagementPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/dashboard/users"
            element={
              authUser?.role === "admin" ? (
                <AdminUsersManagementPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/dashboard/chat"
            element={
              authUser?.role === "admin" ? (
                <AdminChatPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/dashboard/reports"
            element={
              authUser?.role === "admin" ? (
                <AdminReportsPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/chat"
            element={authUser ? <UserChatPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/checkout"
            element={authUser ? <CheckoutPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/stripe-checkout"
            element={authUser ? <StripeCheckoutPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/payment-success"
            element={authUser ? <PaymentSuccessPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/payment-failure"
            element={authUser ? <PaymentFailurePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/payment-history"
            element={authUser ? <PaymentHistoryPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/my-bookings"
            element={authUser ? <MyBookingsPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/profile"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
          />
        </Route>

        {/* Routes without Navbar and Footer */}
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to="/" />}
        />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
