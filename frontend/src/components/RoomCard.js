import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Users,
  Maximize,
  Wifi,
  Wind,
  Coffee,
  Tv,
  Bath,
  Utensils,
  GlassWater,
  Droplets,
  Mountain,
  Laptop,
  Shirt,
  Phone,
  Bed,
  UtensilsCrossed,
  DoorOpen,
} from "lucide-react";
import { getRoomReviews } from "../lib/reviewApi";

const RoomCard = ({
  image,
  name,
  type,
  price,
  capacity,
  size,
  amenities = [],
  index,
  _id,
  id,
}) => {
  const roomId = id || _id;
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let isActive = true;

    const fetchReviews = async () => {
      if (!roomId) return;
      try {
        const data = await getRoomReviews(roomId);
        if (isActive) setReviews(data);
      } catch (error) {
        if (isActive) setReviews([]);
      }
    };

    fetchReviews();

    return () => {
      isActive = false;
    };
  }, [roomId]);

  const amenityIcons = {
    wifi: <Wifi className="w-4 h-4" />,
    "air conditioning": <Wind className="w-4 h-4" />,
    ac: <Wind className="w-4 h-4" />,
    breakfast: <Utensils className="w-4 h-4" />,
    "mini bar": <GlassWater className="w-4 h-4" />,
    tv: <Tv className="w-4 h-4" />,
    television: <Tv className="w-4 h-4" />,
    balcony: <DoorOpen className="w-4 h-4" />,
    "coffee maker": <Coffee className="w-4 h-4" />,
    coffee: <Coffee className="w-4 h-4" />,
    jacuzzi: <Droplets className="w-4 h-4" />,
    butler: <Users className="w-4 h-4" />,
    "garden access": <Mountain className="w-4 h-4" />,
    "work desk": <Laptop className="w-4 h-4" />,
    "bathroom amenities": <Bath className="w-4 h-4" />,
    "hair dryer": <Wind className="w-4 h-4" />,
    towels: <Shirt className="w-4 h-4" />,
    telephone: <Phone className="w-4 h-4" />,
    "room service": <UtensilsCrossed className="w-4 h-4" />,
    "king bed": <Bed className="w-4 h-4" />,
    "queen bed": <Bed className="w-4 h-4" />,
  };

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? Number(
          (
            reviews.reduce(
              (sum, review) => sum + (Number(review.rating) || 0),
              0,
            ) / totalReviews
          ).toFixed(1),
        )
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group bg-card rounded-2xl overflow-hidden shadow-elegant hover:shadow-lg transition-all duration-500"
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Type Badge */}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gold/90 text-foreground text-sm font-medium">
          {type}
        </div>

        {/* Rating */}
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm flex items-center gap-1">
          <Star className="w-4 h-4 fill-gold text-gold" />
          <span className="text-sm font-medium">
            {averageRating.toFixed(1)}
          </span>
        </div>

        {/* Quick Book Button */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <button className="w-full bg-gold text-foreground px-6 py-3 rounded-lg font-medium hover:bg-gold-dark transition-colors">
            Book Now
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-display font-semibold mb-2 group-hover:text-gold transition-colors">
          {name}
        </h3>

        {/* Room Info */}
        <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{capacity} Guests</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            <span>{size} m²</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-2 mb-4">
          {amenities.slice(0, 3).map((amenity, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground"
              title={amenity}
            >
              {amenityIcons[amenity.toLowerCase()] || (
                <Wifi className="w-4 h-4" />
              )}
            </div>
          ))}
          {amenities.length > 3 && (
            <span className="text-sm text-muted-foreground">
              +{amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Price */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-display font-bold text-gold">
                LKR {price}
              </span>
              <span className="text-muted-foreground text-sm"> / night</span>
            </div>
          </div>

          <div className="mt-4">
            <button className="w-full inline-flex items-center justify-center border-2 border-primary bg-white text-foreground px-3 py-2 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;
