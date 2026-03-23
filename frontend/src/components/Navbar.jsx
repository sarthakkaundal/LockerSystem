import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `rounded-lg px-2 py-1 transition hover:text-sky-400 ${
    isActive ? "text-sky-400" : ""
  }`;

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-slate-900 px-4 py-3 text-white shadow-md sm:px-8 sm:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="text-lg font-bold tracking-wide sm:text-xl"
          onClick={() => setOpen(false)}
        >
          LockerSystem
        </Link>

        <button
          type="button"
          className="inline-flex rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-white sm:hidden"
          aria-expanded={open}
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>

        <div
          className={`${
            open ? "flex" : "hidden"
          } absolute left-0 right-0 top-[56px] z-20 flex-col gap-1 border-b border-slate-800 bg-slate-900 px-4 py-3 sm:static sm:flex sm:flex-row sm:items-center sm:border-0 sm:bg-transparent sm:py-0`}
        >
          {!isAuthenticated ? (
            <NavLink to="/" className={linkClass} onClick={() => setOpen(false)} end>
              Login
            </NavLink>
          ) : null}
          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/lockers"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                Lockers
              </NavLink>
              <NavLink
                to="/reserve"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                Reserve
              </NavLink>
              <NavLink
                to="/my-locker"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                My Locker
              </NavLink>
              {user?.role === "ADMIN" ? (
                <NavLink
                  to="/admin"
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  Admin
                </NavLink>
              ) : null}
            </>
          ) : (
            <>
              <NavLink
                to="/lockers"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                Lockers
              </NavLink>
            </>
          )}
          {isAuthenticated ? (
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-800 pt-2 sm:mt-0 sm:ml-4 sm:flex-row sm:items-center sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
              <span className="truncate text-xs text-slate-400 sm:max-w-[140px]">
                {user?.email}
              </span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-left text-sm font-medium hover:bg-slate-700 sm:text-center"
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
