const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Middleware to protect routes

const protectedUserMiddleware = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    
    if (token && token.startsWith("Bearer ")) {
      token = token.split(" ")[1]; // extract token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // store use info without password
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } else {
      return res.status(401).json({ message: "Not Authorized, no token" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Token Failed", error: error.message });
  }
};

const protectAdminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); 
  } else {
    return res.status(403).json({ message: "Access denied, admin only" });
  }
};

module.exports = { protectedUserMiddleware, protectAdminMiddleware };
