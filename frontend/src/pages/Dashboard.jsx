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
        { title: "Total Lockers", value: String(stats.total) },
        { title: "Available Now", value: String(stats.available) },
        { title: "Occupied", value: String(stats.occupied) },
        { title: "Under Maintenance", value: String(stats.maintenance) },
      ]
    : [];

  return (
    <section className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Live counts and your current booking (refreshes every minute).
        </p>
      </div>

      {error ? (
        <div
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {loading && !stats ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
            {statCards.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
              >
                <p className="text-sm font-medium text-slate-500">{item.title}</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  {item.value}
                </h2>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Quick Reserve
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Book a free locker when you need short-term storage.
                  </p>
                </div>

                <Link
                  to="/reserve"
                  className="inline-flex justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
                >
                  Reserve Now
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Open inventory</p>
                  <h4 className="mt-2 text-lg font-semibold text-slate-900">
                    {stats ? `${stats.available} units` : "—"}
                  </h4>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">In use</p>
                  <h4 className="mt-2 text-lg font-semibold text-slate-900">
                    {stats ? `${stats.occupied} bookings` : "—"}
                  </h4>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Service</p>
                  <h4 className="mt-2 text-lg font-semibold text-slate-900">
                    {stats ? `${stats.maintenance} in maintenance` : "—"}
                  </h4>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xl font-semibold text-slate-900">Active Booking</h3>
              <p className="mt-1 text-sm text-slate-500">
                Pulled from the server for your account.
              </p>

              {active ? (
                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Locker ID</p>
                  <h4 className="mt-2 text-2xl font-bold text-slate-900">
                    {active.lockerCode}
                  </h4>

                  <p className="mt-4 text-sm text-slate-500">Location</p>
                  <p className="mt-1 font-medium text-slate-800">{active.location}</p>

                  <p className="mt-4 text-sm text-slate-500">Time Remaining</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {formatRemaining(active.endsAt)}
                  </p>

                  <Link
                    to="/my-locker"
                    className="mt-4 inline-block text-sm font-semibold text-sky-600 hover:text-sky-700"
                  >
                    Open My Locker →
                  </Link>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
                  No active booking.{" "}
                  <Link to="/reserve" className="font-semibold text-sky-600">
                    Reserve a locker
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">Recent Activity</h3>
            <p className="mt-1 text-sm text-slate-500">
              Latest events from the booking log.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-sm text-slate-500">
                    <th className="pb-2 font-medium">Locker</th>
                    <th className="pb-2 font-medium">Event</th>
                    <th className="pb-2 font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-3 text-sm text-slate-500"
                      >
                        No activity yet.
                      </td>
                    </tr>
                  ) : (
                    activity.map((item) => (
                      <tr key={item.id} className="rounded-xl bg-slate-50">
                        <td className="rounded-l-xl px-4 py-3 font-medium text-slate-900">
                          {item.locker}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {formatActionLabel(item.action)}
                          {item.details ? (
                            <span className="mt-0.5 block text-xs text-slate-500">
                              {item.details}
                            </span>
                          ) : null}
                        </td>
                        <td className="rounded-r-xl px-4 py-3 text-sm text-slate-600">
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
