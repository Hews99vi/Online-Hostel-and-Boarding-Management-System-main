import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import RoomCard from "../components/RoomCard";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { getRooms } from "../lib/roomApi";
import toast from "react-hot-toast";

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    q: "",
    type: "",
    minPrice: "",
    maxPrice: "",
    capacity: "",
    available: false,
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchRooms = useCallback(async (currentFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build params object, excluding empty values
      const params = {};
      Object.keys(currentFilters).forEach((key) => {
        if (currentFilters[key] !== "" && currentFilters[key] !== false) {
          params[key] = currentFilters[key];
        }
      });

      const data = await getRooms(params);
      setRooms(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRooms(filters);
    }, 400);

    return () => clearTimeout(timer);
  }, [filters, fetchRooms]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      q: "",
      type: "",
      minPrice: "",
      maxPrice: "",
      capacity: "",
      available: false,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== false
  );

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold mb-4"
          >
            Our Rooms & Suites
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Discover the perfect accommodation for your stay
          </motion.p>
        </div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 bg-card rounded-xl p-6 border border-border"
        >
          {/* Search and Toggle Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={filters.q}
                onChange={(e) => handleFilterChange("q", e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            {/* Toggle Advanced Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-background border border-border hover:bg-card transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border"
            >
              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Room Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="">All Types</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Min Price (LKR)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Price (LKR)
                </label>
                <input
                  type="number"
                  placeholder="100000"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Capacity (Guests)
                </label>
                <select
                  value={filters.capacity}
                  onChange={(e) =>
                    handleFilterChange("capacity", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="">Any</option>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>

              {/* Available Only */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={filters.available}
                  onChange={(e) =>
                    handleFilterChange("available", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-border text-gold focus:ring-gold"
                />
                <label htmlFor="available" className="text-sm font-medium">
                  Available only
                </label>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear all
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading rooms...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-red-500/10 rounded-xl border border-red-500/20 p-8"
          >
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={() => fetchRooms(filters)}
              className="px-6 py-3 bg-gold text-foreground rounded-lg hover:bg-gold/90 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Room Grid */}
        {!loading && !error && rooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room, index) => (
              <Link key={room.id || room._id} to={`/rooms/${room.id || room._id}`}>
                <RoomCard {...room} index={index} />
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && rooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-2xl font-bold mb-2">No rooms found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters to see more results
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gold text-foreground rounded-lg hover:bg-gold/90 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RoomsPage;
