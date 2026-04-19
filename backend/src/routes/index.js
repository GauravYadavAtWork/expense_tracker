const express = require("express");
const authRoutes = require("./auth.routes");
const expenseRoutes = require("./expense.routes");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    message: "Expense tracker API is running",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/expenses", expenseRoutes);

module.exports = router;
