const expenseService = require("../services/expense.service");

async function create(req, res) {
  const expense = await expenseService.createExpense(req.user.id, req.body);

  res.status(201).json({
    message: "Expense created successfully",
    data: expense,
  });
}

async function list(req, res) {
  const expenses = await expenseService.getExpenses(req.user.id, req.query);

  res.status(200).json({
    message: "Expenses fetched successfully",
    data: expenses,
  });
}

module.exports = {
  create,
  list,
};
