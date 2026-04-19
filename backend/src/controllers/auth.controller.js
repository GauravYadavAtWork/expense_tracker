const authService = require("../services/auth.service");

async function register(req, res) {
  const result = await authService.registerUser(req.body);

  res.status(201).json({
    message: "User registered successfully",
    data: result,
  });
}

async function login(req, res) {
  const result = await authService.loginUser(req.body);

  res.status(200).json({
    message: "Login successful",
    data: result,
  });
}

async function me(req, res) {
  const user = await authService.getProfile(req.user.id);

  res.status(200).json({
    message: "Profile fetched successfully",
    data: user,
  });
}

module.exports = {
  register,
  login,
  me,
};
