import { motion } from "framer-motion";
import {
  Utensils,
  Dumbbell,
  Waves,
  Car,
  Wifi,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: <Utensils className="w-6 h-6" />,
    title: "Fine Dining",
    description:
      "World-class restaurants serving international and local cuisines",
  },
  {
    icon: <Waves className="w-6 h-6" />,
    title: "Infinity Pool",
    description: "Stunning rooftop pool with panoramic city views",
  },
  {
    icon: <Dumbbell className="w-6 h-6" />,
    title: "Fitness Center",
    description: "State-of-the-art gym with personal trainers available",
  },
  {
    icon: <Car className="w-6 h-6" />,
    title: "Valet Parking",
    description: "Complimentary valet parking for all guests",
  },
  {
    icon: <Wifi className="w-6 h-6" />,
    title: "High-Speed WiFi",
    description: "Free ultra-fast internet throughout the property",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "24/7 Security",
    description: "Round-the-clock security for your peace of mind",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Room Service",
    description: "24-hour in-room dining with extensive menu options",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Spa & Wellness",
    description: "Rejuvenating spa treatments and wellness programs",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-primary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full bg-gold/20 text-gold text-sm font-medium mb-4"
          >
            Amenities
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-4"
          >
            World-Class Facilities
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-primary-foreground/70 max-w-2xl mx-auto"
          >
            Indulge in our premium amenities designed to enhance every aspect of
            your stay
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group p-6 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/10 hover:border-gold/30 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-gold/20 flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-primary-foreground/60 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
