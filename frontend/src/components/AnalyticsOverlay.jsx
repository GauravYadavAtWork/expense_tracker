import { useMemo, useState } from "react";
import { formatCurrency } from "../utils/formatters";

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getDayKey(date) {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfWeek(date) {
  const copy = startOfWeek(date);
  copy.setDate(copy.getDate() + 6);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function getWindow(mode, anchor) {
  const now = new Date();

  if (mode === "day") {
    const target = anchor ? new Date(anchor) : now;
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);
    return {
      start,
      end,
      label: target.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    };
  }

  if (mode === "week") {
    const target = anchor ? new Date(anchor) : now;
    const start = startOfWeek(target);
    const end = endOfWeek(target);
    return {
      start,
      end,
      label: `${start.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })} - ${end.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`,
    };
  }

  const monthValue = anchor || getMonthKey(now);
  const [year, month] = monthValue.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return {
    start,
    end,
    label: start.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
  };
}

function AnalyticsOverlay({ open, expenses, onClose }) {
  const [mode, setMode] = useState("month");
  const [monthAnchor, setMonthAnchor] = useState(getMonthKey(new Date()));
  const [weekAnchor, setWeekAnchor] = useState(getDayKey(new Date()));
  const [dayAnchor, setDayAnchor] = useState(getDayKey(new Date()));

  const activeAnchor =
    mode === "month" ? monthAnchor : mode === "week" ? weekAnchor : dayAnchor;

  const analytics = useMemo(() => {
    const { start, end, label } = getWindow(mode, activeAnchor);
    const filtered = expenses.filter((expense) => {
      const spentAt = new Date(expense.spentAt);
      return spentAt >= start && spentAt <= end;
    });

    const total = filtered.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const average = filtered.length ? total / filtered.length : 0;
    const categories = filtered.reduce((accumulator, expense) => {
      const key = expense.category || "Uncategorized";
      accumulator[key] = (accumulator[key] || 0) + Number(expense.amount || 0);
      return accumulator;
    }, {});

    return {
      label,
      total,
      average,
      count: filtered.length,
      categories: Object.entries(categories)
        .map(([category, value]) => ({ category, value }))
        .sort((left, right) => right.value - left.value),
    };
  }, [activeAnchor, expenses, mode]);

  if (!open) {
    return null;
  }

  const maxValue = analytics.categories[0]?.value || 1;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Detailed analytics">
      <div className="overlay__backdrop" onClick={onClose} />
      <section className="overlay__panel">
        <header className="overlay__header">
          <div>
            <span className="eyebrow">Detailed analytics</span>
            <h2>{analytics.label}</h2>
          </div>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="analytics-tabs">
          <button
            type="button"
            className={mode === "month" ? "is-active" : ""}
            onClick={() => setMode("month")}
          >
            Month
          </button>
          <button
            type="button"
            className={mode === "week" ? "is-active" : ""}
            onClick={() => setMode("week")}
          >
            Week
          </button>
          <button
            type="button"
            className={mode === "day" ? "is-active" : ""}
            onClick={() => setMode("day")}
          >
            Day
          </button>
        </div>

        <div className="analytics-filter">
          {mode === "month" ? (
            <input type="month" value={monthAnchor} onChange={(event) => setMonthAnchor(event.target.value)} />
          ) : null}
          {mode === "week" ? (
            <input type="date" value={weekAnchor} onChange={(event) => setWeekAnchor(event.target.value)} />
          ) : null}
          {mode === "day" ? (
            <input type="date" value={dayAnchor} onChange={(event) => setDayAnchor(event.target.value)} />
          ) : null}
        </div>

        <section className="analytics-stats">
          <article className="stat-card">
            <span>Total</span>
            <strong>{formatCurrency(analytics.total)}</strong>
          </article>
          <article className="stat-card">
            <span>Entries</span>
            <strong>{analytics.count}</strong>
          </article>
          <article className="stat-card">
            <span>Average</span>
            <strong>{formatCurrency(analytics.average)}</strong>
          </article>
        </section>

        <section className="analytics-breakdown">
          <div className="panel__header">
            <div>
              <span className="eyebrow">Category breakdown</span>
              <h3>Spending distribution</h3>
            </div>
          </div>

          {analytics.categories.length === 0 ? (
            <div className="empty-state">
              <h3>No analytics yet</h3>
              <p>No expenses fall inside this filter.</p>
            </div>
          ) : (
            <div className="bars">
              {analytics.categories.map((item) => (
                <article className="bar-row" key={item.category}>
                  <div className="bar-row__head">
                    <span>{item.category}</span>
                    <strong>{formatCurrency(item.value)}</strong>
                  </div>
                  <div className="bar-row__track">
                    <div
                      className="bar-row__fill"
                      style={{ width: `${Math.max((item.value / maxValue) * 100, 10)}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

export default AnalyticsOverlay;
