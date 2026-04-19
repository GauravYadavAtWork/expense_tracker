const Expense = require("../models/expense.model");

async function createExpense(userId, payload) {
  const expense = await Expense.createExpense({
    userId,
    title: payload.title,
    amount: payload.amount,
    category: payload.category,
    spentAt: payload.spentAt,
    notes: payload.notes,
  });

  return expense;
}

async function getExpenses(userId, query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const offset = (page - 1) * limit;
  const sortBy = query.sortBy || "spentAt";
  const order = query.order === "asc" ? "asc" : "desc";

  const { items, total } = await Expense.listExpenses({
    userId,
    category: query.category || "",
    startDate: query.startDate || null,
    endDate: query.endDate || null,
    sortBy,
    order,
    limit,
    offset,
  });

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

module.exports = {
  createExpense,
  getExpenses,
};
