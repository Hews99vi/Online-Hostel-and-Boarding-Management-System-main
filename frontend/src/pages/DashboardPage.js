import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, CheckCircle, XCircle, Users, Calendar, MessageCircle, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { getRooms, deleteRoom } from "../lib/roomApi";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      setError(err.message || "Failed to load rooms");
      toast.error(err.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleDelete = async (id, roomName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${roomName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteRoom(id);
      toast.success("Room deleted successfully!");
      fetchRooms(); // Refetch rooms
    } catch (err) {
      toast.error(err.message || "Failed to delete room");
    }
  };

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-display font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your hotel rooms and bookings
          </p>
        </motion.div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate("/dashboard/bookings")}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl border border-blue-400/20 p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-white/80 text-sm font-semibold">Manage</div>
            </div>
            <h3 className="text-white text-xl font-display font-bold mb-1">
              Bookings
            </h3>
            <p className="text-white/70 text-sm">View and manage reservations</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate("/dashboard/users")}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl border border-green-400/20 p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-white/80 text-sm font-semibold">Manage</div>
            </div>
            <h3 className="text-white text-xl font-display font-bold mb-1">
              Users
            </h3>
            <p className="text-white/70 text-sm">Manage user accounts</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate("/dashboard/chat")}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl border border-purple-400/20 p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-white/80 text-sm font-semibold">Open</div>
            </div>
            <h3 className="text-white text-xl font-display font-bold mb-1">
              Chat
            </h3>
            <p className="text-white/70 text-sm">Support and messaging</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate("/dashboard/reports")}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl border border-orange-400/20 p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-white/80 text-sm font-semibold">View</div>
            </div>
            <h3 className="text-white text-xl font-display font-bold mb-1">
              Reports
            </h3>
            <p className="text-white/70 text-sm">Analytics and insights</p>
          </motion.div>
        </div>

        {/* Rooms Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          {/* Section Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold">
              Rooms Management
            </h2>
            <button
              onClick={() => navigate("/dashboard/rooms/new")}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-foreground rounded-lg hover:bg-gold/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Room
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading rooms...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchRooms}
                className="px-4 py-2 bg-gold text-foreground rounded-lg hover:bg-gold/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Rooms Table */}
          {!loading && !error && rooms.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Price</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Capacity
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Available
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr
                      key={room._id}
                      className="border-b border-border hover:bg-background/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{room.name}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-3 py-1 bg-gold/10 text-gold rounded-full text-sm">
                          {room.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">LKR {room.price.toLocaleString()}</td>
                      <td className="py-3 px-4">{room.capacity} guests</td>
                      <td className="py-3 px-4">
                        {room.available ? (
                          <span className="flex items-center gap-1 text-green-500">
                            <CheckCircle className="w-4 h-4" />
                            Available
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-500">
                            <XCircle className="w-4 h-4" />
                            Unavailable
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(`/dashboard/rooms/${room._id}/edit`)
                            }
                            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(room._id, room.name)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && rooms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No rooms found. Add your first room to get started!
              </p>
              <button
                onClick={() => navigate("/dashboard/rooms/new")}
                className="px-4 py-2 bg-gold text-foreground rounded-lg hover:bg-gold/90 transition-colors"
              >
                Add New Room
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
