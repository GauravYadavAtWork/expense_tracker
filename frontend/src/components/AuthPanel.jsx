import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const initialForms = {
  login: { email: "", password: "" },
  register: { name: "", email: "", password: "" },
};

function AuthPanel({ mode, busy, onSubmit }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForms[mode]);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const result = await onSubmit(mode, form);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    navigate("/dashboard", { replace: true });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <main className="auth-page">
      <div className="login-layout">
        <section className="login-brand">
          <div className="login-brand-pattern" />
          <div className="login-brand-inner">
            <div className="login-brand-top">
              <span className="login-logo-mark">ET</span>
            </div>
            <p className="eyebrow">Expense tracker</p>
            <h1 className="login-brand-title">Track spending with the same calm UI system.</h1>
            <p className="login-brand-copy">
              Minimal auth, clear dashboard panels, monthly analytics, and a dark mode using the
              same palette language as your reference app.
            </p>
            <ul className="login-brand-list">
              <li>Simple login and register flow</li>
              <li>Quick add with category, date, and optional note</li>
              <li>Month, week, and day analytics overlay</li>
            </ul>
          </div>
        </section>

        <section className="login-main">
          <div className="login-card">
            <div className="login-card-header">
              <p className="eyebrow">{mode === "login" ? "Welcome back" : "Create account"}</p>
              <h2 className="login-title">{mode === "login" ? "Log in" : "Register"}</h2>
              <p className="login-subtitle">
                {mode === "login"
                  ? "Use your account to enter the dashboard."
                  : "Create an account to start recording expenses."}
              </p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              {mode === "register" ? (
                <div className="field">
                  <label>
                    <span>Name</span>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </label>
                </div>
              ) : null}

              <div className="field">
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </label>
              </div>

              <div className="field">
                <label>
                  <span>Password</span>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                </label>
              </div>

              {error ? <p className="form-message form-message--error">{error}</p> : null}

              <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
                {busy ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
              </button>
            </form>

            <p className="login-switch">
              {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
              <Link to={mode === "login" ? "/register" : "/login"}>
                {mode === "login" ? "Register" : "Log in"}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AuthPanel;
