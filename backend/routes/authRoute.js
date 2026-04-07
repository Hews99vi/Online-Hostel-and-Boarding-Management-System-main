const express = require("express");
const {
  signup,
  login,
  logout,
  checkAuth,
  getSocketToken,
} = require("../controllers/authController.js");
const { protectRoute } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check", protectRoute, checkAuth);
router.get("/socket-token", protectRoute, getSocketToken);

module.exports = router;
