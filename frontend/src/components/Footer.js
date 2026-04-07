import { Link } from "react-router-dom";
import {
  Hotel,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";

const Footer = () => {
  const today = new Date();
  const socialLinks = [
    { Icon: Facebook, href: "https://www.facebook.com", label: "Facebook" },
    { Icon: Instagram, href: "https://www.instagram.com", label: "Instagram" },
    { Icon: Twitter, href: "https://www.twitter.com", label: "Twitter" },
    { Icon: Youtube, href: "https://www.youtube.com", label: "YouTube" },
  ];

  const quickLinks = [
    { label: "About Us", to: "/" },
    { label: "Our Rooms", to: "/" },
    { label: "Amenities", to: "/amenities" },
    { label: "Gallery", to: "/" },
    { label: "Contact", to: "/contact" },
  ];

  const serviceLinks = [
    { label: "Room Booking", to: "/amenities" },
    { label: "Restaurant", to: "/amenities" },
    { label: "Spa & Wellness", to: "/amenities" },
    { label: "Events", to: "/amenities" },
    { label: "Airport Transfer", to: "/amenities" },
  ];

  const policyLinks = [
    { label: "Privacy Policy", to: "/" },
    { label: "Terms of Service", to: "/" },
    { label: "Cookie Policy", to: "/" },
  ];
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-primary-foreground/70 mb-6">
              Get exclusive offers, travel tips, and updates delivered to your
              inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
              <button className="bg-gold text-foreground px-4 py-2 rounded-lg font-medium shadow-lg shadow-gold/20 hover:bg-gold-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden">
                <span className="relative z-10">Subscribe</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gold flex items-center justify-center">
                <Hotel className="w-6 h-6 text-foreground" />
              </div>
              <span className="text-2xl font-display font-bold">LuxeStay</span>
            </Link>
            <p className="text-primary-foreground/70 mb-6">
              Experience luxury redefined. Your perfect escape awaits at
              LuxeStay, where every moment is crafted for excellence.
            </p>
            <div className="flex gap-4">
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-foreground transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-primary-foreground/70 hover:text-gold transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Services</h4>
            <ul className="space-y-3">
              {serviceLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-primary-foreground/70 hover:text-gold transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-primary-foreground/70">
                  2 Sir Chittampalam A Gardiner Mawatha, Colombo 00200, Sri
                  Lanka
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-primary-foreground/70">
                  +94 112 492 492
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-primary-foreground/70">
                  info@luxestay.com
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/60 text-sm">
              &copy; {today.getFullYear()} LuxeStay. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              {policyLinks.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="text-primary-foreground/60 hover:text-gold transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
