const express = require("express");
const expenseController = require("../controllers/expense.controller");
const asyncHandler = require("../utils/async-handler");
const validateRequest = require("../middlewares/validate.middleware");
const { requireAuth } = require("../middlewares/auth.middleware");
const { createExpenseValidator, listExpensesValidator } = require("../validators/expense.validator");

const router = express.Router();

router.use(requireAuth);
router.get("/", listExpensesValidator, validateRequest, asyncHandler(expenseController.list));
router.post("/", createExpenseValidator, validateRequest, asyncHandler(expenseController.create));

module.exports = router;
