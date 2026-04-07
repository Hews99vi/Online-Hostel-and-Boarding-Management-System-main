import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Users, Search } from "lucide-react";
import toast from "react-hot-toast";

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    checkInDate: "",
    checkOutDate: "",
    guests: "1",
  });

  const handleSearch = () => {
    // Validate dates
    if (!searchData.checkInDate || !searchData.checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    const checkIn = new Date(searchData.checkInDate);
    const checkOut = new Date(searchData.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      toast.error("Check-in date cannot be in the past");
      return;
    }

    if (checkOut <= checkIn) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    // Navigate to rooms page with search parameters
    const params = new URLSearchParams({
      checkIn: searchData.checkInDate,
      checkOut: searchData.checkOutDate,
      guests: searchData.guests,
    });

    navigate(`/rooms?${params.toString()}`);
    toast.success("Searching available rooms...");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-hero-gradient" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-gold/20 text-gold text-sm font-medium mb-6 border border-gold/30">
              ✨ Experience Luxury Redefined
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl font-display font-bold text-primary-foreground mb-6 leading-tight"
          >
            Discover Your Perfect
            <span className="block text-gradient-gold">Luxury Escape</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl text-primary-foreground/70 mb-12 max-w-2xl mx-auto"
          >
            Immerse yourself in unparalleled comfort and elegance. From stunning
            suites to world-class amenities, your dream stay awaits.
          </motion.p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-card/95 backdrop-blur-lg rounded-2xl p-6 shadow-lg max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Check In */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold" />
                  Check In
                </label>
                <input
                  type="date"
                  value={searchData.checkInDate}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      checkInDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                />
              </div>

              {/* Check Out */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold" />
                  Check Out
                </label>
                <input
                  type="date"
                  value={searchData.checkOutDate}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      checkOutDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                />
              </div>

              {/* Guests */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-gold" />
                  Guests
                </label>
                <select
                  value={searchData.guests}
                  onChange={(e) =>
                    setSearchData({ ...searchData, guests: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="w-full mt-6 bg-gold text-foreground px-6 py-3 rounded-lg font-medium shadow-lg shadow-gold/20 hover:bg-gold-dark hover:shadow-xl hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              <div className="absolute" />
              <Search className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10">Search Available Rooms</span>
            </button>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex justify-center gap-12 mt-16 flex-wrap"
        >
          {[
            { value: "50+", label: "Luxury Rooms" },
            { value: "30+", label: "Happy Guests" },
            { value: "4.7", label: "Rating" },
            { value: "24/7", label: "Support" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-gold">
                {stat.value}
              </div>
              <div className="text-sm text-primary-foreground/60">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
