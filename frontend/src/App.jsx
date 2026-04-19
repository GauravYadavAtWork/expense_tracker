import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  createExpense,
  getExpenses,
  getProfile,
  loginUser,
  registerUser,
  setAuthToken,
} from "./api/client";
import AnalyticsOverlay from "./components/AnalyticsOverlay";
import AuthPanel from "./components/AuthPanel";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Toast from "./components/Toast";
import { formatCurrency, formatLongDate, groupTotal } from "./utils/formatters";

const AUTH_STORAGE_KEY = "expense-tracker-auth";
const THEME_STORAGE_KEY = "expense-tracker-theme";
const CATEGORY_OPTIONS = ["Food", "Miscellaneous", "Transport", "Shopping", "Bills", "Health"];
const THEME_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "dark", label: "Dark" },
  { value: "sunrise", label: "Sunrise" },
  { value: "forest", label: "Forest" },
  { value: "midnight-bloom", label: "Midnight Bloom" },
  { value: "harbor", label: "Harbor" },
];

function getCurrentTheme() {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return THEME_OPTIONS.some((option) => option.value === stored) ? stored : "default";
}

function getMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
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

function getAnalyticsWindow(mode, anchor) {
  const now = new Date();

  if (mode === "day") {
    const target = anchor ? new Date(anchor) : now;
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);
    return { start, end, label: formatLongDate(target) };
  }

  if (mode === "week") {
    const target = anchor ? new Date(anchor) : now;
    const start = startOfWeek(target);
    const end = endOfWeek(target);
    return {
      start,
      end,
      label: `${formatLongDate(start)} to ${formatLongDate(end)}`,
    };
  }

  const monthValue = anchor || getMonthKey(now);
  const [year, month] = monthValue.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return {
    start,
    end,
    label: start.toLocaleString("en-IN", { month: "long", year: "numeric" }),
  };
}

function buildAnalytics(expenses, mode, anchor) {
  const { start, end, label } = getAnalyticsWindow(mode, anchor);
  const filtered = expenses.filter((expense) => {
    const spentAt = new Date(expense.spentAt);
    return spentAt >= start && spentAt <= end;
  });

  const total = groupTotal(filtered);
  const average = filtered.length ? total / filtered.length : 0;
  const categories = filtered.reduce((accumulator, expense) => {
    const key = expense.category || "Uncategorized";
    accumulator[key] = (accumulator[key] || 0) + Number(expense.amount || 0);
    return accumulator;
  }, {});

  const categoryEntries = Object.entries(categories)
    .map(([category, value]) => ({ category, value }))
    .sort((left, right) => right.value - left.value);

  return {
    label,
    total,
    average,
    count: filtered.length,
    categories: categoryEntries,
  };
}

function App() {
  const [theme, setTheme] = useState(() => getCurrentTheme());
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [expenseBusy, setExpenseBusy] = useState(false);
  const [toast, setToast] = useState({ message: "", tone: "success" });
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (parsed.token && parsed.user) {
        setToken(parsed.token);
        setUser(parsed.user);
        setAuthToken(parsed.token);
      }
    } catch (_error) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setAuthToken("");
      return;
    }

    setAuthToken(token);
    void loadExpenses(token);
  }, [token]);

  useEffect(() => {
    if (!toast.message) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setToast({ message: "", tone: "success" });
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [toast]);

  async function loadExpenses(activeToken = token) {
    if (!activeToken) {
      return;
    }

    setListLoading(true);
    setListError("");

    try {
      const data = await getExpenses({
        page: 1,
        limit: 100,
        sortBy: "spentAt",
        order: "desc",
      });
      setExpenses(data.items);
    } catch (error) {
      setListError(error.response?.data?.message || "Unable to load expenses");
    } finally {
      setListLoading(false);
    }
  }

  async function persistSession(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
  }

  async function handleAuthSubmit(mode, form) {
    setAuthBusy(true);

    try {
      const action = mode === "login" ? loginUser : registerUser;
      const result = await action(form);
      const profile = mode === "login" ? await getProfile().catch(() => result.user) : result.user;
      await persistSession(result.token, profile);
      setToast({
        message: mode === "login" ? "Logged in successfully" : "Account created successfully",
        tone: "success",
      });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error.response?.data?.message || "Authentication failed",
      };
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleExpenseSubmit(form) {
    setExpenseBusy(true);

    try {
      await createExpense({
        title: `${form.category} expense`,
        amount: Number(form.amount),
        category: form.category,
        notes: form.notes || "",
        spentAt: form.spentAt ? new Date(form.spentAt).toISOString() : undefined,
      });
      await loadExpenses();
      setToast({ message: "Expense added", tone: "success" });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error.response?.data?.message || "Unable to save expense",
      };
    } finally {
      setExpenseBusy(false);
    }
  }

  function handleLogout() {
    setToken("");
    setUser(null);
    setExpenses([]);
    setListError("");
    setAnalyticsOpen(false);
    setAuthToken("");
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  const monthAnalytics = useMemo(
    () => buildAnalytics(expenses, "month", getMonthKey(new Date())),
    [expenses]
  );

  return (
    <div className="app-shell">
      <Routes>
        <Route
          path="/"
          element={<Navigate to={token && user ? "/dashboard" : "/login"} replace />}
        />
        <Route
          path="/login"
          element={
            token && user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthPanel
                mode="login"
                busy={authBusy}
                onSubmit={handleAuthSubmit}
              />
            )
          }
        />
        <Route
          path="/register"
          element={
            token && user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthPanel
                mode="register"
                busy={authBusy}
                onSubmit={handleAuthSubmit}
              />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            token && user ? (
              <DashboardPage
                user={user}
                theme={theme}
                themeOptions={THEME_OPTIONS}
                onThemeChange={setTheme}
                onLogout={handleLogout}
                expenses={expenses}
                loading={listLoading}
                error={listError}
                onExpenseSubmit={handleExpenseSubmit}
                expenseBusy={expenseBusy}
                analytics={monthAnalytics}
                onOpenAnalytics={() => setAnalyticsOpen(true)}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AnalyticsOverlay
        open={analyticsOpen}
        expenses={expenses}
        onClose={() => setAnalyticsOpen(false)}
      />

      <Toast
        tone={toast.tone}
        message={toast.message}
        onDismiss={() => setToast({ message: "", tone: "success" })}
      />
    </div>
  );
}

function DashboardPage({
  user,
  theme,
  themeOptions,
  onThemeChange,
  onLogout,
  expenses,
  loading,
  error,
  onExpenseSubmit,
  expenseBusy,
  analytics,
  onOpenAnalytics,
}) {
  const recentExpenses = expenses.slice(0, 12);
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "add", label: "Add Expense" },
    { id: "analytics", label: "Analytics" },
    { id: "activity", label: "Recent Activity" },
    { id: "settings", label: "Settings" },
  ];

  function handleTabChange(nextTab) {
    setActiveTab(nextTab);
    setMobileNavOpen(false);
  }

  return (
    <main className="app-shell-with-sidebar">
      <header className="app-topbar">
        <div className="app-topbar-left">
          <button
            type="button"
            className="hamburger-btn"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            ☰
          </button>
          <div className="app-logo-mark">ET</div>
          <div>
            <p className="app-topbar-title">Expense Tracker</p>
            <p className="app-topbar-sub app-topbar-sub--desktop">{user.email}</p>
            <p className="app-topbar-sub app-topbar-sub--mobile">{user.name}</p>
          </div>
        </div>

        <div className="app-topbar-right">
          <div className="pill app-user-pill">
            <span className="pill-dot" />
            {user.name}
          </div>
          <button type="button" className="btn btn-ghost" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <div className="shell-body">
        {mobileNavOpen ? (
          <button
            type="button"
            className="mobile-sidebar-backdrop"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}

        <aside className={`shell-sidebar ${mobileNavOpen ? "shell-sidebar--open" : ""}`}>
          <div className="shell-sidebar__header">
            <p className="eyebrow">Navigation</p>
            <button
              type="button"
              className="btn btn-ghost shell-sidebar__close"
              onClick={() => setMobileNavOpen(false)}
            >
              Close
            </button>
          </div>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`shell-nav-btn ${activeTab === tab.id ? "shell-nav-btn-active" : ""}`}
              onClick={() => {
                if (tab.id === "analytics") {
                  onOpenAnalytics();
                }
                handleTabChange(tab.id);
              }}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        <section className="shell-main">
          <div className="app-container dashboard-page">
            {activeTab === "overview" ? (
              <>
                <section className="dashboard-hero">
                  <button type="button" className="dashboard-hero-card" onClick={onOpenAnalytics}>
                    <p className="eyebrow">This month</p>
                    <strong>{formatCurrency(analytics.total)}</strong>
                    <p>{analytics.count} expenses recorded</p>
                    <span className="analytics-link">Open detailed analytics</span>
                  </button>
                </section>

                <section className="dashboard-grid">
                  <ExpenseForm
                    busy={expenseBusy}
                    categoryOptions={CATEGORY_OPTIONS}
                    onSubmit={onExpenseSubmit}
                  />

                  <section className="panel">
                    <div className="panel__header">
                      <div>
                        <p className="eyebrow">Recent expenses</p>
                        <h2>Latest activity</h2>
                      </div>
                    </div>
                    {error ? <p className="form-message form-message--error">{error}</p> : null}
                    <ExpenseList expenses={recentExpenses} loading={loading} />
                  </section>
                </section>
              </>
            ) : null}

            {activeTab === "add" ? (
              <section className="panel panel--single">
                <div className="panel__header">
                  <div>
                    <p className="eyebrow">Add expense</p>
                    <h2>Record a new expense</h2>
                  </div>
                </div>
                <ExpenseForm
                  busy={expenseBusy}
                  categoryOptions={CATEGORY_OPTIONS}
                  onSubmit={onExpenseSubmit}
                />
              </section>
            ) : null}

            {activeTab === "analytics" ? (
              <section className="panel panel--single">
                <div className="panel__header">
                  <div>
                    <p className="eyebrow">Analytics</p>
                    <h2>Monthly snapshot</h2>
                  </div>
                </div>
                <button type="button" className="dashboard-hero-card" onClick={onOpenAnalytics}>
                  <p className="eyebrow">This month</p>
                  <strong>{formatCurrency(analytics.total)}</strong>
                  <p>{analytics.count} expenses recorded</p>
                  <span className="analytics-link">Open detailed analytics</span>
                </button>
              </section>
            ) : null}

            {activeTab === "activity" ? (
              <section className="panel panel--single">
                <div className="panel__header">
                  <div>
                    <p className="eyebrow">Recent expenses</p>
                    <h2>Latest activity</h2>
                  </div>
                </div>
                {error ? <p className="form-message form-message--error">{error}</p> : null}
                <ExpenseList expenses={recentExpenses} loading={loading} />
              </section>
            ) : null}

            {activeTab === "settings" ? (
              <section className="panel panel--single">
                <div className="panel__header">
                  <div>
                    <p className="eyebrow">Settings</p>
                    <h2>Appearance</h2>
                  </div>
                </div>
                <div className="settings-row">
                  <label className="theme-select">
                    <span className="theme-select__label">Theme</span>
                    <select value={theme} onChange={(event) => onThemeChange(event.target.value)}>
                      {themeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
