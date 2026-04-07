const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("jwt-luxestay", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log("Error in signup", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create and send token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    await res.cookie("jwt-luxestay", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ message: "Logged in Successfully" });
  } catch (error) {
    console.error("Error in login", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("jwt-luxestay");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.checkAuth = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Error in Check Auth", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getSocketToken = async (req, res) => {
  try {
    // Return the JWT token from the cookie for socket authentication
    const token = req.cookies["jwt-luxestay"];
    if (!token) {
      return res.status(401).json({ message: "No authentication token" });
    }
    res.json({ token });
  } catch (error) {
    console.error("Error in getSocketToken", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
