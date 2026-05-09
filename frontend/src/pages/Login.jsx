import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import VaultaLogo from "../components/VaultaLogo";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, user } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError("Please enter your credentials.");
      return;
    }
    setSubmitting(true);
    try {
      await login(trimmed, password);
    } catch (err) {
      setError(err.message || "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await register(regName.trim(), regEmail.trim(), regPassword);
      setError("");
      toast.success("Registration successful! Please sign in with your new credentials.");
      setIsLogin(true);
      setEmail(regEmail);
      setPassword(regPassword);
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = (mode) => {
    if (mode === isLogin) return;
    setIsLogin(mode);
    setError("");
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50/40 focus:bg-white focus:ring-2 focus:ring-orange-400/40 focus:border-orange-300 transition-all text-sm text-gray-900 placeholder:text-gray-300 outline-none";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1.5";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse at top, #f8f9fb 0%, #f1f1f4 50%, #edeef1 100%)' }}>
      {/* Logo */}
      <div className="mb-6">
        <VaultaLogo size={30} />
      </div>

      {/* Auth card */}
      <div className="w-full max-w-[420px]">
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)] p-7 sm:p-9">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              {isLogin ? "Sign in" : "Create account"}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {isLogin ? "Enter your credentials to continue" : "Fill in your details to get started"}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg bg-gray-100/80 p-0.5 mb-6 relative">
            <button
              type="button"
              onClick={() => toggleMode(true)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 z-10 ${
                isLogin ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => toggleMode(false)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 z-10 ${
                !isLogin ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Register
            </button>
            <motion.div
              className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-white rounded-md shadow-sm pointer-events-none"
              initial={false}
              animate={{ left: isLogin ? "2px" : "calc(50%)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-2.5 rounded-lg border border-red-100 text-xs">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className={labelClass}>Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      disabled={submitting}
                      placeholder="you@university.edu"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className={labelClass}>Password</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClass} pr-9`}
                        disabled={submitting}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                        disabled={submitting}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-orange-500 text-white px-4 py-2.5 rounded-lg hover:bg-orange-600 active:bg-orange-700 transition-colors font-medium text-sm disabled:opacity-50 flex justify-center items-center shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-2.5 rounded-lg border border-red-100 text-xs">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="regName" className={labelClass}>Full name</label>
                    <input
                      id="regName"
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className={inputClass}
                      disabled={submitting}
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="regEmail" className={labelClass}>Email</label>
                    <input
                      id="regEmail"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className={inputClass}
                      disabled={submitting}
                      placeholder="you@university.edu"
                    />
                  </div>

                  <div>
                    <label htmlFor="regPassword" className={labelClass}>Password</label>
                    <div className="relative">
                      <input
                        id="regPassword"
                        type={showRegPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className={`${inputClass} pr-9`}
                        disabled={submitting}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                        disabled={submitting}
                      >
                        {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="regConfirmPassword" className={labelClass}>Confirm password</label>
                    <div className="relative">
                      <input
                        id="regConfirmPassword"
                        type={showRegConfirmPassword ? "text" : "password"}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className={`${inputClass} pr-9`}
                        disabled={submitting}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                        disabled={submitting}
                      >
                        {showRegConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm disabled:opacity-50 flex justify-center items-center"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Registering...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-gray-400 mt-5">
          {isLogin ? (
            <>Don't have an account?{" "}
              <button type="button" onClick={() => toggleMode(false)} className="text-orange-500 hover:text-orange-600 font-medium">Sign up</button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button type="button" onClick={() => toggleMode(true)} className="text-orange-500 hover:text-orange-600 font-medium">Sign in</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;
