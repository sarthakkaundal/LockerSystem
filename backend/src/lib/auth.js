import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function authMiddleware(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    const token =
      header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
    if (!token) {
      if (required) return res.status(401).json({ error: "Sign in required." });
      req.user = null;
      return next();
    }
    try {
      req.user = verifyToken(token);
      next();
    } catch {
      return res.status(401).json({ error: "Session expired. Sign in again." });
    }
  };
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access only." });
  }
  next();
}
