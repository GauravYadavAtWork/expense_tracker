const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/user.model");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");

const requireAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authorization token is required");
  }

  const token = authHeader.split(" ")[1];

  let decoded;

  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (_error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    throw new ApiError(401, "User linked to token no longer exists");
  }

  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  next();
});

module.exports = {
  requireAuth,
};
