const { body, query } = require("express-validator");

const createExpenseValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 120 })
    .withMessage("Title must not exceed 120 characters"),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than zero")
    .toFloat(),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ max: 60 })
    .withMessage("Category must not exceed 60 characters"),
  body("spentAt")
    .optional()
    .isISO8601()
    .withMessage("spentAt must be a valid ISO 8601 date")
    .toDate(),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),
];

const listExpensesValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
  query("category")
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage("category must not exceed 60 characters"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("startDate must be a valid ISO 8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("endDate must be a valid ISO 8601 date"),
  query("sortBy")
    .optional()
    .isIn(["spentAt", "amount", "category", "createdAt"])
    .withMessage("sortBy must be one of spentAt, amount, category, or createdAt"),
  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("order must be either asc or desc"),
];

module.exports = {
  createExpenseValidator,
  listExpensesValidator,
};
