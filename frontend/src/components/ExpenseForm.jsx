import { useState } from "react";

const initialForm = {
  amount: "",
  category: "Food",
  spentAt: new Date().toISOString().slice(0, 10),
  notes: "",
};

function ExpenseForm({ busy, categoryOptions, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const result = await onSubmit(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setForm(initialForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <span className="eyebrow">Add expense</span>
          <h2>New expense</h2>
        </div>
      </div>

      <form className="expense-form" onSubmit={handleSubmit}>
        <label>
          <span>Money</span>
          <input
            type="number"
            min="0"
            step="0.01"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
          />
        </label>

        <label>
          <span>Category</span>
          <select name="category" value={form.category} onChange={handleChange}>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Date</span>
          <input type="date" name="spentAt" value={form.spentAt} onChange={handleChange} />
        </label>

        <label>
          <span>Description</span>
          <textarea
            rows="5"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Optional note"
          />
        </label>

        {error ? <p className="form-message form-message--error">{error}</p> : null}

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "Saving..." : "Add expense"}
        </button>
      </form>
    </section>
  );
}

export default ExpenseForm;
