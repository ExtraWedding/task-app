import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'


const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_token";

export default async function authMiddleware(req, res, next) {
  // GRAB THE BEARER TOKEN FORM AUTHORIZATION HEADER
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided, token missing" });
  }

  const token = authHeader.split(" ")[1];
  // VERIFY & ATTACH USER OBJECT
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}