import { useCallback, useEffect, useState } from "react";
import { api, apiText } from "../api/client";

const logActionClass = (action) => {
  if (action === "RELEASED" || action === "FORCE_RELEASED" || action === "MAINTENANCE_OFF")
    return "border-emerald-500/30 bg-emerald-500/20 text-emerald-300";
  if (action === "BOOKED" || action === "EXTENDED") return "border-blue-500/30 bg-blue-500/20 text-blue-300";
  if (action === "MAINTENANCE_ON") return "border-rose-500/30 bg-rose-500/20 text-rose-300";
  if (action === "EXPIRED") return "border-amber-500/30 bg-amber-500/20 text-amber-300";
  return "border-slate-500/30 bg-slate-500/20 text-slate-300";
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
    <section className="relative w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-600">
          Command Center
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Telemetry, audit trails, and overrides.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      ) : null}

      {formError ? (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {formError}
        </div>
      ) : null}

      {loading && !overview ? (
        <div className="h-[500px] w-full animate-pulse rounded-3xl bg-slate-800/50"></div>
      ) : (
        <>
          <div className="grid gap-4 flex-wrap grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4">
            {counts ? (
              <>
                <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Fleet Size</p>
                  <h2 className="mt-2 text-3xl font-black text-white">{counts.total}</h2>
                </div>
                <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Active</p>
                  <h2 className="mt-2 text-3xl font-black text-white">{counts.occupied}</h2>
                </div>
                <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Standby</p>
                  <h2 className="mt-2 text-3xl font-black text-white">{counts.available}</h2>
                </div>
                <div className="rounded-3xl border border-rose-500/10 bg-slate-900/40 p-6 backdrop-blur-md">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-rose-400/70">Flagged</p>
                  <h2 className="mt-2 text-3xl font-black text-rose-400">{counts.maintenance}</h2>
                </div>
              </>
            ) : null}
          </div>

          {overview ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:grid-rows-1 items-start">
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Metrics</h3>
                  <p className="text-xs text-slate-400 tracking-wide">Historical volume breakdown.</p>
                </div>
                
                <div className="mt-6 space-y-4 flex-1 flex flex-col justify-end">
                    <div className="flex justify-between items-end border-b border-white/5 pb-2">
                        <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Active Tasks</span>
                        <span className="text-2xl font-black text-white tabular-nums">{overview.bookings.active}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/5 pb-2">
                        <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Completed Sessions</span>
                        <span className="text-2xl font-black text-white tabular-nums">{overview.bookings.completed}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Total Audits (24H)</span>
                        <span className="text-2xl font-black text-white tabular-nums">{overview.eventsLast24h}</span>
                    </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl h-full">
                <h3 className="text-xl font-bold text-white mb-2">Load Balancing</h3>
                <p className="text-xs text-slate-400 tracking-wide mb-6">Zone saturation visualization.</p>
                
                <ul className="space-y-5">
                  {(overview.byLocation ?? []).map((row) => {
                    const pct = row.total > 0 ? Math.round((row.occupied / row.total) * 100) : 0;
                    return (
                      <li key={row.location}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold text-white tracking-wide">
                            {row.location}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                            {row.occupied}/{row.total} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-emerald-400 to-indigo-500`}
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

          <div className="mt-6 grid gap-6 xl:grid-cols-3 xl:grid-rows-1">
            <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Event Log</h3>
                  <p className="text-xs text-slate-400">Security trace route.</p>
                </div>
                <button
                  type="button"
                  onClick={exportCsv}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white/10 shrink-0"
                >
                  Export CSV
                </button>
              </div>

              <div className="flex-1 overflow-x-auto min-h-[400px]">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="pb-3 pl-4 font-medium uppercase tracking-wider text-[10px]">Timestamp</th>
                      <th className="pb-3 px-4 font-medium uppercase tracking-wider text-[10px]">Locker</th>
                      <th className="pb-3 px-4 font-medium uppercase tracking-wider text-[10px]">Trace</th>
                      <th className="pb-3 pr-4 font-medium uppercase tracking-wider text-[10px]">Actor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500">
                          No audit rows mapping.
                        </td>
                      </tr>
                    ) : (
                      logs.map((item) => (
                        <tr key={item.id} className="transition-colors hover:bg-white/5">
                          <td className="py-3 pl-4 text-xs font-medium text-slate-500">
                            {new Date(item.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm font-black text-white">
                            {item.lockerCode}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block rounded-md border px-2 py-1 text-[10px] font-bold tracking-wider ${logActionClass(
                                item.action
                              )}`}
                            >
                              {item.action}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-xs font-medium text-slate-400">
                            {item.actorEmail ?? "SYSTEM"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-6 h-full">
              <div className="flex-1 rounded-3xl border border-rose-500/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden bg-gradient-to-br from-transparent to-rose-900/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[50px]"></div>

                <h3 className="text-xl font-bold text-rose-100 mb-1 tracking-tight">Maintenance Ops</h3>
                <p className="text-xs text-rose-200/50 mb-6 font-medium">Hardware triage lock.</p>

                <div className="space-y-3 relative z-10">
                  <input
                    type="text"
                    value={maintenanceCode}
                    onChange={(e) => setMaintenanceCode(e.target.value)}
                    placeholder="Bay ID (e.g. L-103)"
                    className="w-full rounded-xl border border-rose-500/20 bg-slate-950/80 px-4 py-3 text-sm font-bold text-rose-100 placeholder-rose-500/30 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                  <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => submitMaintenance(true)}
                        className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-rose-800 px-4 py-3 text-[11px] font-black uppercase text-white shadow-lg shadow-rose-900/50 hover:scale-[1.02] disabled:opacity-50 transition-all"
                      >
                        Lock
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => submitMaintenance(false)}
                        className="flex-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[11px] font-black uppercase text-rose-400 hover:bg-rose-500/20 disabled:opacity-50 transition-colors"
                      >
                        Unlock
                      </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 rounded-3xl border border-amber-500/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden bg-gradient-to-br from-transparent to-amber-900/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px]"></div>

                <h3 className="text-xl font-bold text-amber-100 mb-1 tracking-tight">Manual Purge</h3>
                <p className="text-xs text-amber-200/50 mb-6 font-medium">Force bypass reservation constraints.</p>

                <div className="space-y-3 relative z-10">
                  <input
                    type="text"
                    value={forceCode}
                    onChange={(e) => setForceCode(e.target.value)}
                    placeholder="Target Locker Code"
                    className="w-full rounded-xl border border-amber-500/20 bg-slate-950/80 px-4 py-3 text-sm font-bold text-amber-100 placeholder-amber-500/30 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={submitForceRelease}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3 text-xs font-black uppercase text-white shadow-lg shadow-amber-900/50 hover:scale-[1.02] disabled:opacity-50 transition-all"
                  >
                    Execute Purge
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
