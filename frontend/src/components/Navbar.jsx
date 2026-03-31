import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `relative rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
      isActive
        ? "text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        : "text-slate-400 hover:text-white hover:bg-white/5"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
          onClick={() => setOpen(false)}
        >
          LockerSystem
        </Link>

        <button
          type="button"
          className="inline-flex rounded-xl border border-white/10 bg-white/5 p-2 text-white sm:hidden transition hover:bg-white/10"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        <div
          className={`${
            open ? "flex" : "hidden"
          } absolute left-0 right-0 top-[73px] z-20 flex-col gap-2 border-b border-white/10 bg-slate-950/95 p-4 backdrop-blur-xl sm:static sm:flex sm:flex-row sm:items-center sm:border-0 sm:bg-transparent sm:p-0`}
        >
          {!isAuthenticated ? (
            <NavLink to="/" className={linkClass} onClick={() => setOpen(false)} end>
              Login
            </NavLink>
          ) : null}

          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>Dashboard</NavLink>
              <NavLink to="/lockers" className={linkClass} onClick={() => setOpen(false)}>Lockers</NavLink>
              <NavLink to="/reserve" className={linkClass} onClick={() => setOpen(false)}>Reserve</NavLink>
              <NavLink to="/my-locker" className={linkClass} onClick={() => setOpen(false)}>My Locker</NavLink>
              {user?.role === "ADMIN" ? (
                <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>Admin</NavLink>
              ) : null}
            </>
          ) : (
            <>
              <NavLink to="/lockers" className={linkClass} onClick={() => setOpen(false)}>Lockers</NavLink>
            </>
          )}

          {isAuthenticated ? (
            <div className="mt-4 flex flex-col items-start gap-4 border-t border-white/10 pt-4 sm:ml-4 sm:mt-0 sm:flex-row sm:items-center sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                {user?.email}
              </span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/50 border border-transparent"
              >
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
