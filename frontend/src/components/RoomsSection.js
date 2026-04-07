import { motion } from "framer-motion";
import RoomCard from "./RoomCard";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getRooms } from "../lib/roomApi";

const RoomsSection = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await getRooms({});
        // Limit to 4 rooms
        setRooms(data.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
        // Keep empty array on error
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full bg-gold/10 text-gold text-sm font-medium mb-4"
          >
            Our Rooms
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold mb-4"
          >
            Exceptional Accommodations
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Choose from our carefully curated selection of rooms and suites,
            each designed to provide the ultimate comfort and luxury experience.
          </motion.p>
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading rooms...</p>
            </div>
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rooms.map((room, index) => (
              <Link
                key={room.id || room._id}
                to={`/rooms/${room.id || room._id}`}
              >
                <RoomCard {...room} index={index} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No rooms available</p>
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/rooms"
            className="inline-flex items-center border-2 border-primary bg-white text-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors"
          >
            View All Rooms
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default RoomsSection;
