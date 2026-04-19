const express = require("express");
const authController = require("../controllers/auth.controller");
const asyncHandler = require("../utils/async-handler");
const validateRequest = require("../middlewares/validate.middleware");
const { requireAuth } = require("../middlewares/auth.middleware");
const { registerValidator, loginValidator } = require("../validators/auth.validator");

const router = express.Router();

router.post("/register", registerValidator, validateRequest, asyncHandler(authController.register));
router.post("/login", loginValidator, validateRequest, asyncHandler(authController.login));
router.get("/me", requireAuth, asyncHandler(authController.me));

module.exports = router;
