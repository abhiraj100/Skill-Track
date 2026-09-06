import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("Authentication required");
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("User no longer exists");
    }

    next();
  } catch (error) {
    res.status(401);
    next(new Error("Invalid or expired token"));
  }
};

export const adminOnly = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    return next(Object.assign(new Error("Admin access required"), { statusCode: 403 }));
  }
  next();
};
