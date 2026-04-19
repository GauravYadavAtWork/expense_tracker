import { formatCurrency, formatDate } from "../utils/formatters";

function ExpenseList({ expenses, loading }) {
  if (loading) {
    return <div className="empty-state">Loading expenses...</div>;
  }

  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <h3>No expenses yet</h3>
        <p>Add your first expense from the panel on the left.</p>
      </div>
    );
  }

  return (
    <div className="expense-list">
      {expenses.map((expense) => (
        <article className="expense-row" key={expense.id}>
          <div className="expense-row__meta">
            <strong>{expense.category}</strong>
            <span>{formatDate(expense.spentAt)}</span>
          </div>
          <div className="expense-row__amount">{formatCurrency(expense.amount)}</div>
          <p className="expense-row__notes">{expense.notes || "No description"}</p>
        </article>
      ))}
    </div>
  );
}

export default ExpenseList;
