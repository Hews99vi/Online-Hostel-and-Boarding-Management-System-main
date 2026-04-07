import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { getRandomUserReviews } from "../lib/reviewApi";

const TestimonialsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getRandomUserReviews(3);
        setReviews(data);
      } catch (err) {
        setError(err.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const getAvatarUrl = (name = "Guest", profilePicture) =>
    profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F4E9D7&color=111827&size=96`;

  return (
    <section className="py-24 bg-cream-dark">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full bg-gold/10 text-gold text-sm font-medium mb-4"
          >
            Testimonials
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold mb-4"
          >
            What Our Guests Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Discover why thousands of guests choose us for their luxury stay
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading && (
            <div className="col-span-full text-center text-muted-foreground">
              Loading reviews...
            </div>
          )}

          {!loading && error && (
            <div className="col-span-full text-center text-red-500">
              {error}
            </div>
          )}

          {!loading && !error && reviews.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground">
              No reviews yet.
            </div>
          )}

          {!loading &&
            !error &&
            reviews.map((review, index) => {
              const name = review?.user?.name || "Guest";
              const avatar = getAvatarUrl(name, review?.user?.profilePicture);
              const subtitle = review?.room?.name
                ? `Stayed in ${review.room.name}`
                : "Recent guest";

              return (
                <motion.div
                  key={review._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative bg-card rounded-2xl p-8 shadow-elegant"
                >
                  <div className="absolute -top-4 left-8">
                    <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                      <Quote className="w-5 h-5 text-foreground" />
                    </div>
                  </div>

                  <div className="flex gap-1 mb-4 pt-4">
                    {Array.from({ length: review.rating || 0 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>

                  <p className="text-muted-foreground mb-6 italic">
                    "{review.comment || "No comment provided."}"
                  </p>

                  <div className="flex items-center gap-4">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">{name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {subtitle}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
