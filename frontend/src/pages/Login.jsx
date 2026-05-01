import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import vaultaLogo from "../assets/logos/vaulta_logo.png";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, user } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

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
      alert("Registration successful! Please sign in with your new credentials.");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-4xl w-full relative min-h-[660px] md:h-[660px] flex">
        
        {/* Container for the sliding panels */}
        <div className="absolute inset-0 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:block">
          
          {/* Form Panel (Slides right on Register) */}
          <div 
            className={`w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white absolute top-0 h-full z-10 transition-transform duration-700 ease-in-out ${
              !isLogin ? 'md:translate-x-full' : 'md:translate-x-0'
            }`}
          >
            <div className="mb-6 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                {isLogin ? "Welcome back" : "Create an account"}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {isLogin ? "Sign in to access your dashboard" : "Sign up to get started with Vaulta"}
              </p>
            </div>

            {/* Toggle System (Always visible for easy switching) */}
            <div className="flex rounded-lg bg-slate-100 p-1 mb-8 relative">
              <button
                type="button"
                onClick={() => toggleMode(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 z-10 ${
                  isLogin ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => toggleMode(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 z-10 ${
                  !isLogin ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Register
              </button>
              <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-md shadow-sm pointer-events-none"
                initial={false}
                animate={{ left: isLogin ? "4px" : "calc(50% + 0px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>

            <div className="relative overflow-visible flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <form onSubmit={handleLoginSubmit} noValidate className="space-y-5">
                      {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 text-sm">
                          {error}
                        </div>
                      )}

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Email address
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-slate-900"
                          disabled={submitting}
                          placeholder="you@example.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 pr-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-slate-900"
                            disabled={submitting}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            disabled={submitting}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-md transition-all duration-200 font-medium disabled:opacity-70 flex justify-center items-center"
                      >
                        {submitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                          </>
                        ) : (
                          "Sign in"
                        )}
                      </button>
                      
                      <div className="pt-4 mt-4 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-500">
                          Demo account: <span className="font-medium text-slate-700">student@university.edu</span> / <span className="font-medium text-slate-700">password123</span>
                        </p>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4">
                      {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 text-sm">
                          {error}
                        </div>
                      )}

                      <div>
                        <label htmlFor="regName" className="block text-sm font-medium text-slate-700 mb-1">
                          Full Name
                        </label>
                        <input
                          id="regName"
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-slate-900"
                          disabled={submitting}
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label htmlFor="regEmail" className="block text-sm font-medium text-slate-700 mb-1">
                          Email address
                        </label>
                        <input
                          id="regEmail"
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-slate-900"
                          disabled={submitting}
                          placeholder="you@example.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="regPassword" className="block text-sm font-medium text-slate-700 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="regPassword"
                            type={showRegPassword ? "text" : "password"}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full px-4 py-2 pr-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-slate-900"
                            disabled={submitting}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            disabled={submitting}
                          >
                            {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="regConfirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            id="regConfirmPassword"
                            type={showRegPassword ? "text" : "password"}
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 pr-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-slate-900"
                            disabled={submitting}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-md transition-all duration-200 font-medium disabled:opacity-70 flex justify-center items-center"
                      >
                        {submitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Registering...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Branding Panel (Slides left on Register) */}
          <div 
            className={`hidden md:flex w-1/2 bg-slate-950 p-12 text-white items-center justify-center flex-col text-center absolute top-0 h-full z-20 left-1/2 transition-transform duration-700 ease-in-out ${
              !isLogin ? '-translate-x-full' : 'translate-x-0'
            }`}
          >
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-white opacity-10 blur-2xl pointer-events-none"></div>
            {/* Centered Logo */}
            <div className="z-10 mb-8 flex flex-col items-center">
              <img src={vaultaLogo} alt="Vaulta Logo" className="h-20 drop-shadow-2xl" />
            </div>
            
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="branding-login"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="z-10 flex flex-col items-center"
                >
                  <h2 className="text-4xl font-bold mb-6 text-white">Welcome to Vaulta</h2>
                  <p className="text-slate-300 text-lg max-w-md mb-10">
                    Your secure digital locker system. Store, manage, and access your assets with enterprise-grade security.
                  </p>
                  <p className="text-sm text-slate-400 mb-4">Don't have an account?</p>
                  <button 
                    type="button"
                    onClick={() => toggleMode(false)}
                    className="px-8 py-2 rounded-full border border-slate-700 text-slate-300 hover:bg-white hover:text-slate-900 hover:border-white transition-all duration-300 font-medium"
                  >
                    Sign Up
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="branding-register"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="z-10 flex flex-col items-center"
                >
                  <h2 className="text-4xl font-bold mb-6 text-white">Hello, Friend!</h2>
                  <p className="text-slate-300 text-lg max-w-md mb-10">
                    Enter your personal details and start your journey with Vaulta today.
                  </p>
                  <p className="text-sm text-slate-400 mb-4">Already have an account?</p>
                  <button 
                    type="button"
                    onClick={() => toggleMode(true)}
                    className="px-8 py-2 rounded-full border border-slate-700 text-slate-300 hover:bg-white hover:text-slate-900 hover:border-white transition-all duration-300 font-medium"
                  >
                    Sign In
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
