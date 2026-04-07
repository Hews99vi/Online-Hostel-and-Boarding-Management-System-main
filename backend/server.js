const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

const connectDB = require("./lib/db.js");
const { setupSocket } = require("./lib/socket.js");

// Import Routes
const authRoutes = require("./routes/authRoute.js");
const userRoutes = require("./routes/userRoute.js");
const roomRoutes = require("./routes/roomRoute.js");
const bookingRoutes = require("./routes/bookingRoute.js");
const chatRoutes = require("./routes/chatRoute.js");
const paymentRoutes = require("./routes/paymentRoute.js");
const reportsRoutes = require("./routes/reportsRoute.js");
const reviewRoutes = require("./routes/reviewRoute.js");

dotenv.config();

// Read allowed origins from env (comma-separated).
// If not provided, default to local dev + docker local.
const allowedOrigins = (process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost", "http://localhost:3000"]
)
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Setup Socket.IO
setupSocket(io);

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// Express CORS for API routes
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Health check (useful for AWS + CI/CD)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/reviews", reviewRoutes);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
