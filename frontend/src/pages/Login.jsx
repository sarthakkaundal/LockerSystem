import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from;

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    let target = "/dashboard";
    if (user.role === "ADMIN") target = "/admin";
    else if (from && from !== "/" && from !== "/admin") target = from;
    navigate(target, { replace: true });
  }, [isAuthenticated, user, from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError("Enter your university email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await login(trimmed, password);
    } catch (err) {
      setError(err.message || "Sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <div className="page-header center">
          <h1 className="page-title">Smart Campus</h1>
          <p className="page-subtitle">
            Demo: student@university.edu / password123
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {error ? (
            <div className="alert alert-error">
              {error}
            </div>
          ) : null}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              University Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="form-input"
              disabled={submitting}
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="form-input"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-full"
          >
            {submitting ? "Signing in…" : "Access System"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
