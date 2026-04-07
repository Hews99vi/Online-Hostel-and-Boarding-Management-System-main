import { motion } from "framer-motion";
import {
  Waves,
  Dumbbell,
  UtensilsCrossed,
  Wifi,
  Car,
  Sparkles,
  Wine,
  ShowerHead,
  Leaf,
  Music,
  Clock,
  Shield,
} from "lucide-react";

const amenities = [
  {
    icon: Waves,
    title: "Infinity Pool",
    description:
      "Stunning rooftop infinity pool with panoramic city views, heated year-round for your comfort.",
  },
  {
    icon: Dumbbell,
    title: "Fitness Center",
    description:
      "State-of-the-art gym equipped with premium machines, free weights, and personal training sessions.",
  },
  {
    icon: UtensilsCrossed,
    title: "Fine Dining",
    description:
      "Award-winning restaurant serving international cuisine prepared by our Michelin-starred chef.",
  },
  {
    icon: Sparkles,
    title: "Luxury Spa",
    description:
      "Full-service spa offering massages, facials, body treatments, and wellness therapies.",
  },
  {
    icon: Wine,
    title: "Rooftop Bar",
    description:
      "Exclusive bar with signature cocktails, premium wines, and breathtaking sunset views.",
  },
  {
    icon: ShowerHead,
    title: "Steam & Sauna",
    description:
      "Relax in our traditional Finnish sauna or rejuvenating steam room facilities.",
  },
  {
    icon: Wifi,
    title: "High-Speed WiFi",
    description:
      "Complimentary ultra-fast internet access throughout the entire property.",
  },
  {
    icon: Car,
    title: "Valet Parking",
    description:
      "Convenient valet parking service with 24-hour security surveillance.",
  },
  {
    icon: Leaf,
    title: "Garden Lounge",
    description:
      "Tranquil garden space perfect for relaxation, reading, or quiet conversations.",
  },
  {
    icon: Music,
    title: "Live Entertainment",
    description:
      "Nightly live music performances featuring jazz, classical, and contemporary artists.",
  },
  {
    icon: Clock,
    title: "24/7 Concierge",
    description:
      "Round-the-clock concierge service to assist with reservations, tours, and special requests.",
  },
  {
    icon: Shield,
    title: "Premium Security",
    description:
      "Advanced security systems with 24-hour staff ensuring your safety and privacy.",
  },
];

const AmenitiesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-primary">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <span className="inline-block px-4 py-2 bg-gold/20 text-gold rounded-full text-sm font-medium mb-6">
              World-Class Facilities
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              Our Amenities
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Discover the exceptional facilities and services that make
              LuxeStay the ultimate destination for luxury and comfort.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Amenities Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {amenities.map((amenity, index) => (
              <motion.div
                key={amenity.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group bg-card rounded-2xl p-8 shadow-elegant hover:shadow-lg transition-all duration-300 border border-border"
              >
                <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                  <amenity.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                  {amenity.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {amenity.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-6">
              Experience Luxury Living
            </h2>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Book your stay today and enjoy complimentary access to all our
              premium amenities.
            </p>
            <motion.a
              href="/rooms"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-8 py-4 bg-gold text-foreground font-semibold rounded-lg shadow-gold hover:bg-gold-dark transition-colors"
            >
              View Our Rooms
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AmenitiesPage;
