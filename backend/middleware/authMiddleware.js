const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = "secretkey";

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = await User.findById(decoded.id).select("-password");
    // next();
    // console.log(process.env.JWT_SECRET);
    console.log("1 ->");
    console.log(JWT_SECRET);
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log("2 ->");
    console.log("Role" + decoded.role);
    
    // If admin login, set user role directly
    if (decoded.role === "admin") {
      req.user = { role: "admin" };
    } else {
      req.user = await User.findById(decoded.id).select("-password");
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

// Ensure only admins can access
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied, admin only" });
  }
  next();
};
