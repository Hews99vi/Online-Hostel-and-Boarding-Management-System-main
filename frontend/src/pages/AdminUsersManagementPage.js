import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getAllUsers, deleteUser, getUserStats } from "../lib/adminApi";
import { format } from "date-fns";
import { Users, UserCheck, UserPlus, Shield, Search, Trash2, Calendar } from "lucide-react";

const AdminUsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getUserStats(),
      ]);
      setUsers(usersData || []);
      setStats(statsData || null);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error.response?.data?.message || "Failed to fetch user data");
      setUsers([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteUser(userId);
      toast.success("User deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    }
  };

  const filteredUsers = (users || []).filter((user) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user._id?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Decorative Background Element */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 text-lg">Manage all users and their permissions</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">New This Month</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.newUsersThisMonth}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Administrators</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.admins}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center"
                    >
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No users found</p>
                      <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.name}
                              className="h-12 w-12 rounded-full ring-2 ring-gray-200"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-200">
                              <span className="text-white font-bold text-lg">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                              </span>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{user.name || "Unknown User"}</div>
                            <div className="text-xs text-gray-500">{user.phone || "No phone"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 ring-2 ring-purple-200"
                              : "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 ring-2 ring-blue-200"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <><Shield className="w-3 h-3 mr-1 inline" /> Admin</>
                          ) : (
                            <><Users className="w-3 h-3 mr-1 inline" /> User</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {format(new Date(user.createdAt), "MMM dd, yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {user._id.slice(-8)}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {user.role === "admin" ? (
                          <span className="text-xs text-gray-400 italic">Protected</span>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all font-medium text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredUsers.length}</span> of{" "}
                <span className="font-semibold text-gray-900">{users.length}</span> users
              </div>
              <div className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminUsersManagementPage;
