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
    <section className="flex min-h-[80vh] items-center justify-center">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/20 blur-[80px]"></div>
        <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-purple-500/20 blur-[80px]"></div>

        <div className="relative z-10">
          <h1 className="mb-2 text-center text-3xl font-extrabold tracking-tight text-white">
            Smart Campus
          </h1>
          <p className="mb-8 text-center text-sm text-slate-400">
            Sign in below. Demo:{" "}
            <span className="font-mono text-indigo-300">student@university.edu</span> /{" "}
            <span className="font-mono text-indigo-300">password123</span>
          </p>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300">
                {error}
              </div>
            ) : null}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                University Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 py-3 font-semibold"
            >
              {submitting ? "Signing in…" : "Access System"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Login;
