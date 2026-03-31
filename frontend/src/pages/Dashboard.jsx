import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

function formatRemaining(endsAtIso) {
  const end = new Date(endsAtIso).getTime();
  const now = Date.now();
  const ms = Math.max(0, end - now);
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h <= 0) return `${min}m`;
  return `${h}h ${min}m`;
}

function formatActionLabel(action) {
  const map = {
    BOOKED: "Booked",
    RELEASED: "Released",
    EXTENDED: "Extended",
    EXPIRED: "Expired",
    MAINTENANCE_ON: "Maintenance on",
    MAINTENANCE_OFF: "Back in service",
    FORCE_RELEASED: "Force released",
  };
  return map[action] || action;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const [s, a, b] = await Promise.all([
        api("/api/stats"),
        api("/api/activity?limit=12"),
        api("/api/bookings/active"),
      ]);
      setStats(s);
      setActivity(a.activity ?? []);
      setActive(b.booking);
    } catch (e) {
      setError(e.message || "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const statCards = stats
    ? [
        { title: "Total Units", value: String(stats.total) },
        { title: "Available Now", value: String(stats.available) },
        { title: "Occupied", value: String(stats.occupied) },
        { title: "Maintenance", value: String(stats.maintenance) },
      ]
    : [];

  return (
    <section className="relative w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Live overview. Real-time locker metrics.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      ) : null}

      {loading && !stats ? (
        <div className="flex animate-pulse space-x-4">
          <div className="h-4 w-1/4 rounded bg-slate-800"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-all hover:-translate-y-1 hover:bg-slate-800/50"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {item.title}
                </p>
                <h2 className="mt-2 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                  {item.value}
                </h2>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl lg:col-span-2 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>
                
              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Quick Reserve</h3>
                  <p className="text-sm text-slate-400">
                    Book a free locker when you need short-term storage.
                  </p>
                </div>
                <Link
                  to="/reserve"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40"
                >
                  Reserve Now
                </Link>
              </div>

              <div className="relative z-10 mt-8 grid gap-4 grid-cols-2 md:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                  <p className="text-xs text-slate-400">Open inventory</p>
                  <h4 className="mt-1 text-lg font-bold text-white">
                    {stats ? `${stats.available} units` : "—"}
                  </h4>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                  <p className="text-xs text-slate-400">In use</p>
                  <h4 className="mt-1 text-lg font-bold text-white">
                    {stats ? `${stats.occupied} bookings` : "—"}
                  </h4>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 border border-white/5 col-span-2 md:col-span-1">
                  <p className="text-xs text-slate-400">Service</p>
                  <h4 className="mt-1 text-lg font-bold text-white">
                    {stats ? `${stats.maintenance} down` : "—"}
                  </h4>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl flex flex-col">
              <h3 className="text-xl font-bold text-white">Active Booking</h3>
              <p className="text-sm text-slate-400 mb-6">
                Pulled from the server for your account.
              </p>

              {active ? (
                <div className="flex-1 rounded-2xl bg-white/5 p-5 border border-white/5">
                  <p className="text-xs uppercase text-indigo-300 font-semibold mb-1">Locker ID</p>
                  <h4 className="text-3xl font-black text-white">
                    {active.lockerCode}
                  </h4>

                  <div className="mt-6 flex justify-between items-end">
                    <div>
                        <p className="text-xs text-slate-400">Location</p>
                        <p className="font-medium text-slate-200">{active.location}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400">Remaining</p>
                        <p className="font-bold text-indigo-400 text-lg">
                            {formatRemaining(active.endsAt)}
                        </p>
                    </div>
                  </div>

                  <Link
                    to="/my-locker"
                    className="mt-6 inline-block w-full text-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    Manage Locker
                  </Link>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-800/20 p-6 text-center">
                  <p className="text-sm text-slate-400 mb-3">No active booking.</p>
                  <Link to="/reserve" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Reserve a locker &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="pb-3 pl-4 font-medium uppercase tracking-wider text-xs">Locker</th>
                    <th className="pb-3 px-4 font-medium uppercase tracking-wider text-xs">Event</th>
                    <th className="pb-3 pr-4 font-medium uppercase tracking-wider text-xs text-right">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activity.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-500">
                        No activity recorded yet.
                      </td>
                    </tr>
                  ) : (
                    activity.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-white/5">
                        <td className="py-3 pl-4 font-semibold text-white">
                          {item.locker}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-indigo-300">{formatActionLabel(item.action)}</span>
                          {item.details ? (
                            <span className="block text-[11px] text-slate-500 mt-0.5">
                              {item.details}
                            </span>
                          ) : null}
                        </td>
                        <td className="py-3 pr-4 text-slate-400 text-right">
                          {new Date(item.at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
