import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Hotel, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Hotel className="w-16 h-16 text-gold mb-6" />
            <h1 className="font-display text-4xl md:text-5xl text-primary-foreground mb-4">
              Welcome Back
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-md">
              Experience luxury like never before. Sign in to access your
              bookings and exclusive offers.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
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
              Login
            </h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-gold hover:text-gold-dark transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-6 bg-gold text-foreground px-6 py-3 rounded-lg font-medium shadow-lg shadow-gold/20 hover:bg-gold-dark hover:shadow-xl hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-gold hover:text-gold-dark font-semibold transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
