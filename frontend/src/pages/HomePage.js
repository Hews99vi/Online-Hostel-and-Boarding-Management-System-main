import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Hotel, Users, Calendar, MessageCircle, TrendingUp, Settings, Plus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import HeroSection from "../components/HeroSection";
import RoomsSection from "../components/RoomsSection";
import FeaturesSection from "../components/FeaturesSection";
import TestimonialsSection from "../components/TestimonialsSection";

const HomePage = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  // Admin Home Page
  if (authUser?.role === "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Admin Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center"
          >
            <h1 className="text-4xl font-display font-bold text-slate-900 mb-3">
              Welcome to Admin Portal
            </h1>
            <p className="text-lg text-slate-600">
              Manage your hotel operations efficiently
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
          >
            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-3">
                <Hotel className="w-7 h-7 text-blue-500" />
                <span className="text-xs font-semibold text-slate-500 uppercase">Rooms</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">Total Rooms</h3>
              <p className="text-sm text-slate-600">Manage your properties</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border-l-4 border-emerald-500">
              <div className="flex items-center justify-between mb-3">
                <Calendar className="w-7 h-7 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-500 uppercase">Bookings</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">Reservations</h3>
              <p className="text-sm text-slate-600">View all bookings</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border-l-4 border-violet-500">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-7 h-7 text-violet-500" />
                <span className="text-xs font-semibold text-slate-500 uppercase">Users</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">Manage Users</h3>
              <p className="text-sm text-slate-600">User management</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border-l-4 border-amber-500">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-7 h-7 text-amber-500" />
                <span className="text-xs font-semibold text-slate-500 uppercase">Reports</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">Analytics</h3>
              <p className="text-sm text-slate-600">View insights</p>
            </div>
          </motion.div>

          {/* Admin Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-5">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Dashboard Card */}
              <div
                onClick={() => navigate("/dashboard")}
                className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <Settings className="w-10 h-10 text-white mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Dashboard</h3>
                <p className="text-blue-50 text-sm mb-3">Access full admin dashboard</p>
                <span className="text-white text-sm font-semibold inline-flex items-center group-hover:translate-x-1 transition-transform">Go to Dashboard →</span>
              </div>

              {/* Add Room Card */}
              <div
                onClick={() => navigate("/dashboard/rooms/new")}
                className="group bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <Plus className="w-10 h-10 text-white mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Add New Room</h3>
                <p className="text-emerald-50 text-sm mb-3">Create a new room listing</p>
                <span className="text-white text-sm font-semibold inline-flex items-center group-hover:translate-x-1 transition-transform">Add Room →</span>
              </div>

              {/* Bookings Card */}
              <div
                onClick={() => navigate("/dashboard/bookings")}
                className="group bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <Calendar className="w-10 h-10 text-white mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Manage Bookings</h3>
                <p className="text-violet-50 text-sm mb-3">View and manage reservations</p>
                <span className="text-white text-sm font-semibold inline-flex items-center group-hover:translate-x-1 transition-transform">View Bookings →</span>
              </div>

              {/* Users Card */}
              <div
                onClick={() => navigate("/dashboard/users")}
                className="group bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-6 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <Users className="w-10 h-10 text-white mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
                <p className="text-rose-50 text-sm mb-3">Manage user accounts</p>
                <span className="text-white text-sm font-semibold inline-flex items-center group-hover:translate-x-1 transition-transform">Manage Users →</span>
              </div>

              {/* Chat Card */}
              <div
                onClick={() => navigate("/dashboard/chat")}
                className="group bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <MessageCircle className="w-10 h-10 text-white mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">User Chats</h3>
                <p className="text-indigo-50 text-sm mb-3">Support conversations</p>
                <span className="text-white text-sm font-semibold inline-flex items-center group-hover:translate-x-1 transition-transform">Open Chats →</span>
              </div>

              {/* Reports Card */}
              <div
                onClick={() => navigate("/dashboard/reports")}
                className="group bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <TrendingUp className="w-10 h-10 text-white mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Reports & Analytics</h3>
                <p className="text-amber-50 text-sm mb-3">View business insights</p>
                <span className="text-white text-sm font-semibold inline-flex items-center group-hover:translate-x-1 transition-transform">View Reports →</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Regular User Home Page
  return (
    <div className="min-h-screen">
      <main>
        <HeroSection />
        <RoomsSection />
        <FeaturesSection />
        <TestimonialsSection />
      </main>
    </div>
  );
};

export default HomePage;
