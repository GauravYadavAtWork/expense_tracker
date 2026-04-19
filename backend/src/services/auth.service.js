const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const ApiError = require("../utils/api-error");
const { generateToken } = require("../utils/token");

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function registerUser(payload) {
  const existingUser = await User.findByEmail(payload.email);
  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);

  let user;
  try {
    user = await User.createUser({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Email is already registered");
    }

    throw error;
  }

  const token = generateToken({ sub: user.id, email: user.email });

  return {
    user: sanitizeUser(user),
    token,
  };
}

async function loginUser(payload) {
  const user = await User.findByEmail(payload.email);
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(payload.password, user.password);
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken({ sub: user.id, email: user.email });

  return {
    user: sanitizeUser(user),
    token,
  };
}

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return sanitizeUser(user);
}

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};
