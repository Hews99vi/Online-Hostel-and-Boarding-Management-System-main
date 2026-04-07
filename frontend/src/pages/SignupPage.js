import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Hotel,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.name.trim()) return toast.error("Full Name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid Email format");
    if (!formData.phone.trim()) return toast.error("Phone Number is required");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (formData.password !== formData.confirmPassword)
      return toast.error("Passwords do not match");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) signup(formData);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Hotel className="w-8 h-8 text-gold" />
            <span className="font-display text-2xl text-primary">LuxeStay</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-display text-3xl text-foreground mb-2">
              Create Account
            </h2>
            <p className="text-muted-foreground">
              Join us and experience luxury hospitality
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="fullName">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full pl-10 border rounded-xl h-12 bg-secondary/50 focus:ring-2 focus:ring-gold outline-none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 border rounded-xl h-12 bg-secondary/50 focus:ring-2 focus:ring-gold outline-none"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full pl-10 border rounded-xl h-12 bg-secondary/50 focus:ring-2 focus:ring-gold outline-none"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="w-full pl-10 border rounded-xl h-12 bg-secondary/50 focus:ring-2 focus:ring-gold outline-none"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="w-full pl-10 border rounded-xl h-12 bg-secondary/50 focus:ring-2 focus:ring-gold outline-none"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 rounded border-border text-gold focus:ring-gold"
                required
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <Link to="/terms" className="text-gold hover:text-gold-dark">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-gold hover:text-gold-dark">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSigningUp}
              className="w-full mt-6 bg-gold text-foreground px-6 py-3 rounded-lg font-medium shadow-lg shadow-gold/20 hover:bg-gold-dark hover:shadow-xl hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-gold hover:text-gold-dark font-semibold transition-colors"
            >
              Login
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-primary/90 to-primary/70" />
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Hotel className="w-16 h-16 text-gold mb-6" />
            <h1 className="font-display text-4xl md:text-5xl text-primary-foreground mb-4">
              Join LuxeStay
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-md">
              Create your account today and unlock exclusive member benefits,
              special rates, and personalized experiences.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold text-sm">✓</span>
                </div>
                <div>
                  <p className="text-primary-foreground font-medium">
                    Member Discounts
                  </p>
                  <p className="text-primary-foreground/60 text-sm">
                    Up to 20% off
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold text-sm">✓</span>
                </div>
                <div>
                  <p className="text-primary-foreground font-medium">
                    Priority Booking
                  </p>
                  <p className="text-primary-foreground/60 text-sm">
                    Early access
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold text-sm">✓</span>
                </div>
                <div>
                  <p className="text-primary-foreground font-medium">
                    Free Upgrades
                  </p>
                  <p className="text-primary-foreground/60 text-sm">
                    When available
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold text-sm">✓</span>
                </div>
                <div>
                  <p className="text-primary-foreground font-medium">
                    Reward Points
                  </p>
                  <p className="text-primary-foreground/60 text-sm">
                    Earn on every stay
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
