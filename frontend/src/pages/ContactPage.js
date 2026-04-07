import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Address",
    details: ["123 Luxury Avenue", "Colombo 03, Sri Lanka"],
  },
  {
    icon: Phone,
    title: "Phone",
    details: ["+94 11 234 5678", "+94 77 123 4567"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["info@luxestay.com", "reservations@luxestay.com"],
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["24/7 Front Desk", "Restaurant: 6AM - 11PM"],
  },
];

const ContactPage = () => {
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
              Get In Touch
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Have questions or ready to book your stay? Our team is here to
              help you plan your perfect getaway.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    Send Us a Message
                  </h2>
                  <p className="text-muted-foreground">
                    We'll respond within 24 hours
                  </p>
                </div>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      className="w-full pl-4 text-sm border rounded-xl h-12 bg-background focus:ring-2 focus:ring-gold outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="w-full pl-4 text-sm border rounded-xl h-12 bg-background focus:ring-2 focus:ring-gold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      className="w-full pl-4 text-sm border rounded-xl h-12 bg-background focus:ring-2 focus:ring-gold outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject">Subject</label>
                    <input
                      placeholder="Reservation Inquiry"
                      required
                      className="w-full pl-4 text-sm border rounded-xl h-12 bg-background focus:ring-2 focus:ring-gold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message">Message</label>
                  <textarea
                    placeholder="Tell us about your inquiry..."
                    rows={6}
                    required
                    className="resize-none w-full px-4 py-3 text-sm border rounded-xl bg-secondary/50 focus:ring-2 focus:ring-gold outline-none"
                  />
                </div>

                <button className="w-full mt-6 bg-gold text-foreground px-6 py-3 rounded-lg font-medium shadow-lg shadow-gold/20 hover:bg-gold-dark hover:shadow-xl hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden">
                  Send Message
                </button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  Contact Information
                </h2>
                <p className="text-muted-foreground">
                  Reach out to us through any of these channels. We're always
                  ready to assist you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-card rounded-xl p-6 border border-border"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                      <info.icon className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {info.title}
                    </h3>
                    {info.details.map((detail, i) => (
                      <p key={i} className="text-muted-foreground text-sm">
                        {detail}
                      </p>
                    ))}
                  </motion.div>
                ))}
              </div>

              {/* Map Placeholder */}
              <div className="bg-card rounded-2xl overflow-hidden border border-border h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gold mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Interactive map coming soon
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
