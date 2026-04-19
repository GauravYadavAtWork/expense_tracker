const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    spentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ userId: 1, spentAt: -1 });
expenseSchema.index({ userId: 1, category: 1 });

const Expense = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);

function mapExpense(document) {
  return {
    id: document._id.toString(),
    userId: document.userId.toString(),
    title: document.title,
    amount: Number(document.amount),
    category: document.category,
    spentAt: document.spentAt,
    notes: document.notes,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

async function createExpense({ userId, title, amount, category, spentAt, notes }) {
  const expense = await Expense.create({
    userId,
    title,
    amount,
    category,
    spentAt: spentAt || undefined,
    notes: notes || "",
  });

  return mapExpense(expense);
}

async function listExpenses({ userId, category, startDate, endDate, sortBy, order, limit, offset }) {
  const filters = {
    userId,
  };

  if (category) {
    filters.category = category;
  }

  if (startDate) {
    filters.spentAt = {
      ...filters.spentAt,
      $gte: new Date(startDate),
    };
  }

  if (endDate) {
    filters.spentAt = {
      ...filters.spentAt,
      $lte: new Date(endDate),
    };
  }

  const allowedSortColumns = {
    spentAt: "spentAt",
    amount: "amount",
    category: "category",
    createdAt: "createdAt",
  };

  const sortColumn = allowedSortColumns[sortBy] || "spentAt";
  const sortDirection = order === "asc" ? 1 : -1;

  const [itemDocs, total] = await Promise.all([
    Expense.find(filters)
      .sort({ [sortColumn]: sortDirection })
      .skip(offset)
      .limit(limit),
    Expense.countDocuments(filters),
  ]);

  return {
    items: itemDocs.map(mapExpense),
    total,
  };
}

module.exports = {
  createExpense,
  listExpenses,
};
