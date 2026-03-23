import { useCallback, useEffect, useState } from "react";
import { api, apiText } from "../api/client";

const logActionClass = (action) => {
  if (action === "RELEASED" || action === "FORCE_RELEASED" || action === "MAINTENANCE_OFF")
    return "bg-emerald-100 text-emerald-800";
  if (action === "BOOKED" || action === "EXTENDED") return "bg-sky-100 text-sky-800";
  if (action === "MAINTENANCE_ON") return "bg-rose-100 text-rose-800";
  if (action === "EXPIRED") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-800";
};

export default function Admin() {
  const [overview, setOverview] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [maintenanceCode, setMaintenanceCode] = useState("");
  const [forceCode, setForceCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const [o, l] = await Promise.all([
        api("/api/admin/overview"),
        api("/api/admin/logs?limit=80"),
      ]);
      setOverview(o);
      setLogs(l.logs ?? []);
    } catch (e) {
      setError(e.message || "Could not load admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = async () => {
    setFormError("");
    try {
      const csv = await apiText("/api/admin/logs/export");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `locker-logs-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setFormError(e.message || "Export failed.");
    }
  };

  const submitMaintenance = async (maintenance) => {
    setFormError("");
    const code = maintenanceCode.trim();
    if (!code) {
      setFormError("Enter a locker code (e.g. L-103).");
      return;
    }
    setBusy(true);
    try {
      await api("/api/admin/lockers/maintenance", {
        method: "POST",
        body: { code, maintenance },
      });
      setMaintenanceCode("");
      await load();
    } catch (e) {
      setFormError(e.message || "Maintenance update failed.");
    } finally {
      setBusy(false);
    }
  };

  const submitForceRelease = async () => {
    setFormError("");
    const code = forceCode.trim();
    if (!code) {
      setFormError("Enter locker code to force release.");
      return;
    }
    setBusy(true);
    try {
      await api("/api/admin/bookings/force-release", {
        method: "POST",
        body: { lockerCode: code },
      });
      setForceCode("");
      await load();
    } catch (e) {
      setFormError(e.message || "Force release failed.");
    } finally {
      setBusy(false);
    }
  };

  const counts = overview?.lockerCounts;

  return (
    <section className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Admin Panel</h1>
        <p className="mt-2 text-sm text-slate-600">
          Analytics, logs, maintenance, and overrides backed by the API.
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

      {formError ? (
        <div
          className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          role="alert"
        >
          {formError}
        </div>
      ) : null}

      {loading && !overview ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
            {counts ? (
              <>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm font-medium text-slate-500">Total Lockers</p>
                  <h2 className="mt-3 text-3xl font-bold text-slate-900">
                    {counts.total}
                  </h2>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm font-medium text-slate-500">Occupied</p>
                  <h2 className="mt-3 text-3xl font-bold text-slate-900">
                    {counts.occupied}
                  </h2>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm font-medium text-slate-500">Available</p>
                  <h2 className="mt-3 text-3xl font-bold text-slate-900">
                    {counts.available}
                  </h2>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm font-medium text-slate-500">Maintenance</p>
                  <h2 className="mt-3 text-3xl font-bold text-slate-900">
                    {counts.maintenance}
                  </h2>
                </div>
              </>
            ) : null}
          </div>

          {overview ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Bookings</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Active vs completed (all time).
                </p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Active</dt>
                    <dd className="font-semibold text-slate-900">
                      {overview.bookings.active}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Completed</dt>
                    <dd className="font-semibold text-slate-900">
                      {overview.bookings.completed}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Log events (24h)</dt>
                    <dd className="font-semibold text-slate-900">
                      {overview.eventsLast24h}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">
                  Utilization by location
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Share of lockers occupied (visual bar).
                </p>
                <ul className="mt-4 space-y-4">
                  {(overview.byLocation ?? []).map((row) => {
                    const pct =
                      row.total > 0 ? Math.round((row.occupied / row.total) * 100) : 0;
                    return (
                      <li key={row.location}>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-800">
                            {row.location}
                          </span>
                          <span className="text-slate-500">
                            {row.occupied}/{row.total} in use ({pct}%)
                          </span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-slate-900 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ) : null}

          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Locker Logs</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Recent actions (newest first).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={exportCsv}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Export CSV
                </button>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="pb-2 font-medium">Time</th>
                      <th className="pb-2 font-medium">Locker</th>
                      <th className="pb-2 font-medium">Action</th>
                      <th className="pb-2 font-medium">Actor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-slate-500">
                          No log entries.
                        </td>
                      </tr>
                    ) : (
                      logs.map((item) => (
                        <tr key={item.id} className="bg-slate-50">
                          <td className="rounded-l-lg px-3 py-2 text-slate-600 whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleString()}
                          </td>
                          <td className="px-3 py-2 font-medium text-slate-900">
                            {item.lockerCode}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${logActionClass(
                                item.action
                              )}`}
                            >
                              {item.action}
                            </span>
                          </td>
                          <td className="rounded-r-lg px-3 py-2 text-slate-600">
                            {item.actorEmail ?? "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">
                  Maintenance Control
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Toggle maintenance when a bay is out of service.
                </p>

                <div className="mt-5 space-y-3">
                  <input
                    type="text"
                    value={maintenanceCode}
                    onChange={(e) => setMaintenanceCode(e.target.value)}
                    placeholder="e.g. L-103"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
                  />

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => submitMaintenance(true)}
                    className="w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                  >
                    Mark maintenance
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => submitMaintenance(false)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    Return to available
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Manual Override</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Force-complete an active booking for a locker code.
                </p>

                <div className="mt-5 space-y-3">
                  <input
                    type="text"
                    value={forceCode}
                    onChange={(e) => setForceCode(e.target.value)}
                    placeholder="Locker code"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={submitForceRelease}
                    className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    Force release locker
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
