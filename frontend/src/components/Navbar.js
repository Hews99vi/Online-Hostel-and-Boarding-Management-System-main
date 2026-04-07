import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Hotel, User, LogOut, ChevronUp, Shield, MessageCircle, Calendar } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const location = useLocation();

  const { logout, authUser } = useAuthStore();

  const firstName = (authUser?.name || "Guest").trim().split(/\s+/)[0];
  const emailCopy = authUser?.email || "Welcome back to LuxeStay";

  // For admin users, don't show regular nav links (they use Dashboard)
  const navLinks = authUser?.role === "admin" 
    ? []
    : [
        { name: "Home", href: "/" },
        { name: "Rooms", href: "/rooms" },
        { name: "Amenities", href: "/amenities" },
        { name: "Contact", href: "/contact" },
      ];

  const isLinkActive = (href) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const toggleDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to={authUser?.role === "admin" ? "/dashboard" : "/"} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold flex items-center justify-center">
              <Hotel className="w-6 h-6 text-foreground" />
            </div>
            <span className="text-2xl font-display font-bold text-primary-foreground">
              LuxeStay
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);

              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`relative overflow-hidden rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "text-primary-foreground"
                      : "text-primary-foreground/75 hover:text-primary-foreground"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>{link.name}</span>
                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-gold" />
                    )}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="nav-active-bg"
                      className="absolute inset-0 rounded-full border border-gold/30 bg-primary-foreground/10 shadow-gold"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/10 opacity-0 transition-opacity duration-200 hover:opacity-100" />
                </Link>
              );
            })}
            {authUser && authUser.role !== "admin" && (
              <Link
                to="/chat"
                className={`relative overflow-hidden rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isLinkActive("/chat")
                    ? "text-primary-foreground"
                    : "text-primary-foreground/75 hover:text-primary-foreground"
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat</span>
                  {isLinkActive("/chat") && (
                    <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-gold" />
                  )}
                </span>
                {isLinkActive("/chat") && (
                  <motion.span
                    layoutId="nav-active-bg"
                    className="absolute inset-0 rounded-full border border-gold/30 bg-primary-foreground/10 shadow-gold"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/10 opacity-0 transition-opacity duration-200 hover:opacity-100" />
              </Link>
            )}
            {authUser?.role === "admin" && (
              <Link
                to="/dashboard"
                className={`relative border-2 border-gold overflow-hidden rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 shadow-md ${
                  isLinkActive("/dashboard")
                    ? "text-primary-foreground shadow-gold"
                    : "text-primary-foreground/85 hover:text-primary-foreground"
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gold" />
                  <span>Dashboard</span>
                  {isLinkActive("/dashboard") && (
                    <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-gold" />
                  )}
                </span>
                {isLinkActive("/dashboard") && (
                  <motion.span
                    layoutId="nav-active-bg"
                    className="absolute inset-0 rounded-full border border-gold/50 bg-gradient-to-r from-gold/30 via-gold/15 to-gold/30"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {!isLinkActive("/dashboard") && (
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-gold/12 via-transparent to-gold/8 opacity-0 transition-opacity duration-200 hover:opacity-100" />
                )}
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {authUser ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  className="group relative flex items-center gap-3 rounded-full border border-primary-foreground/10 bg-primary-foreground/5 px-3 py-2 text-primary-foreground shadow-sm shadow-primary/10 transition duration-200 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-lg hover:shadow-gold/20"
                  onClick={toggleDropdown}
                >
                  <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-gold/60 ring-offset-2 ring-offset-primary/40">
                    <img
                      src={authUser.profilePicture || "/defaultProfilePic.jpg"}
                      className="h-full w-full object-cover"
                      alt="Profile"
                    />
                  </span>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold text-primary-foreground">
                      {firstName}
                    </span>
                    <span className="text-xs text-primary-foreground/70">
                      Member · LuxeStay
                    </span>
                  </div>
                  <ChevronUp
                    className={`ml-1 h-5 w-5 text-gold transition-transform duration-200 ${
                      profileDropdownOpen ? "rotate-0" : "rotate-180"
                    }`}
                  />
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-white/5 via-white/0 to-white/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-72"
                    >
                      <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl shadow-primary/20 ring-1 ring-primary/10">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-gold/12 to-transparent" />
                        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/15 blur-3xl" />

                        <div className="relative flex items-center gap-4 border-b border-primary/5 px-5 py-4">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-gold/30 blur-md" />
                            <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-gold/70 shadow-md shadow-gold/25">
                              <img
                                src={
                                  authUser.profilePicture ||
                                  "/defaultProfilePic.jpg"
                                }
                                className="h-full w-full object-cover"
                                alt="Profile"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-primary">
                              Welcome, {firstName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {emailCopy}
                            </p>
                            <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                              <span className="h-2 w-2 rounded-full bg-gold" />
                              Active Member
                            </span>
                          </div>
                        </div>

                        <div className="relative space-y-1 px-2 py-2">
                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-primary transition duration-150 hover:bg-gold"
                          >
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <User className="h-5 w-5" />
                            </span>
                            <span className="flex-1">View Profile</span>
                            <span className="text-xs uppercase tracking-wide text-muted-foreground/80 group-hover:text-primary">
                              Open
                            </span>
                          </Link>

                          {authUser?.role !== "admin" && (
                            <Link
                              to="/my-bookings"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-primary transition duration-150 hover:bg-gold"
                            >
                              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Calendar className="h-5 w-5" />
                              </span>
                              <span className="flex-1">My Bookings</span>
                              <span className="text-xs uppercase tracking-wide text-muted-foreground/80 group-hover:text-primary">
                                Open
                              </span>
                            </Link>
                          )}

                          {authUser?.role === "admin" ? (
                            <Link
                              to="/dashboard/chat"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-primary transition duration-150 hover:bg-gold"
                            >
                              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <MessageCircle className="h-5 w-5" />
                              </span>
                              <span className="flex-1">Admin Chat</span>
                              <span className="text-xs uppercase tracking-wide text-muted-foreground/80 group-hover:text-primary">
                                Open
                              </span>
                            </Link>
                          ) : (
                            <Link
                              to="/chat"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-primary transition duration-150 hover:bg-gold"
                            >
                              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <MessageCircle className="h-5 w-5" />
                              </span>
                              <span className="flex-1">Chat Support</span>
                              <span className="text-xs uppercase tracking-wide text-muted-foreground/80 group-hover:text-primary">
                                Open
                              </span>
                            </Link>
                          )}

                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              logout();
                            }}
                            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-primary transition duration-150 hover:bg-gold"
                          >
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <LogOut className="h-5 w-5" />
                            </span>
                            <span className="flex-1">Logout</span>
                            <span className="text-xs uppercase tracking-wide text-muted-foreground/80 group-hover:text-primary">
                              Exit
                            </span>
                          </button>
                        </div>

                        <div className="relative flex items-center justify-between border-t border-primary/5 px-5 py-3 text-xs text-muted-foreground">
                          <span>LuxeStay rewards synced</span>
                          <span className="rounded-full bg-cream-dark px-2.5 py-1 font-semibold text-primary">
                            Active
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="group relative px-6 py-2.5 rounded-full font-semibold text-sm text-primary-foreground border-2 border-primary-foreground/20 hover:border-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 overflow-hidden backdrop-blur-sm"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary-foreground/5 via-primary-foreground/10 to-primary-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <User className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  <span className="relative z-10">Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="group relative px-6 py-2.5 rounded-full font-semibold text-sm text-foreground bg-gradient-to-r from-gold via-gold to-gold-dark shadow-lg shadow-gold/30 hover:shadow-xl hover:shadow-gold/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <User className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10">Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-primary-foreground p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-primary-foreground/10"
            >
              <div className="px-4 py-6 space-y-1 bg-primary/50 backdrop-blur-sm">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                        isLinkActive(link.href)
                          ? "bg-primary-foreground/15 text-primary-foreground shadow-inner shadow-primary/20"
                          : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{link.name}</span>
                      {isLinkActive(link.href) && (
                        <span className="h-2 w-2 rounded-full bg-gold shadow-gold" />
                      )}
                    </Link>
                  </motion.div>
                ))}
                {authUser && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.1 }}
                  >
                    <Link
                      to={authUser.role === "admin" ? "/dashboard/chat" : "/chat"}
                      className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                        isLinkActive("/chat") || isLinkActive("/dashboard/chat")
                          ? "bg-primary-foreground/15 text-primary-foreground shadow-inner shadow-primary/20"
                          : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Chat
                      </span>
                      {(isLinkActive("/chat") || isLinkActive("/dashboard/chat")) && (
                        <span className="h-2 w-2 rounded-full bg-gold shadow-gold" />
                      )}
                    </Link>
                  </motion.div>
                )}
                <div className="pt-6 pb-2">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-foreground shadow-lg shadow-gold/20 transition-all duration-300 hover:bg-gold-dark hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      <User className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                      <span className="relative z-10">Login</span>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
