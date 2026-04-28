import { useCallback, useEffect, useState } from "react";
import { api, apiText } from "../api/client";

export default function Admin() {
  const [overview, setOverview] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [lockerCodeInput, setLockerCodeInput] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

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

  const toggleMaintenanceMode = async (status) => {
    if (!lockerCodeInput) {
      setFormError("Please enter a locker code.");
      return;
    }
    setBusy(true);
    setFormError("");
    setActionSuccess("");
    try {
      await api("/api/admin/lockers/maintenance", {
        method: "POST",
        body: { code: lockerCodeInput, maintenance: status },
      });
      setActionSuccess(`Locker ${lockerCodeInput} maintenance set to ${status ? "ON" : "OFF"}`);
      load();
    } catch (e) {
      setFormError(e.message || "Failed to update maintenance mode.");
    } finally {
      setBusy(false);
    }
  };

  const forceRelease = async () => {
    if (!lockerCodeInput) {
      setFormError("Please enter a locker code.");
      return;
    }
    if (!window.confirm(`Force release locker ${lockerCodeInput}?`)) return;
    setBusy(true);
    setFormError("");
    setActionSuccess("");
    try {
      await api("/api/admin/bookings/force-release", {
        method: "POST",
        body: { lockerCode: lockerCodeInput },
      });
      setActionSuccess(`Locker ${lockerCodeInput} was force released.`);
      load();
    } catch (e) {
      setFormError(e.message || "Failed to force release.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "16px" }}>
        <h1 className="page-title" style={{ fontSize: "32px", fontWeight: 500, letterSpacing: "-1px" }}>
          Admin Dashboard
        </h1>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {formError ? <div className="alert alert-error">{formError}</div> : null}

      {loading && !overview ? (
        <div className="skeleton skeleton-card" style={{ height: '400px' }}></div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* Real Locker Stats */}
          <div style={{ border: "2px solid var(--border-color)", padding: "16px", backgroundColor: "var(--bg-surface)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 500, marginBottom: "16px" }}>System Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div style={{ padding: "16px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-app)" }}>
                 <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px" }}>Total Lockers</p>
                 <h2 style={{ fontSize: "32px", fontWeight: "600" }}>{overview?.lockerCounts?.total || 0}</h2>
              </div>
              <div style={{ padding: "16px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-app)" }}>
                 <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px" }}>Occupied</p>
                 <h2 style={{ fontSize: "32px", fontWeight: "600" }}>{overview?.lockerCounts?.occupied || 0}</h2>
              </div>
              <div style={{ padding: "16px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-app)" }}>
                 <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px" }}>Available</p>
                 <h2 style={{ fontSize: "32px", fontWeight: "600", color: "var(--success-text)" }}>{overview?.lockerCounts?.available || 0}</h2>
              </div>
              <div style={{ padding: "16px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-app)" }}>
                 <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px" }}>Maintenance</p>
                 <h2 style={{ fontSize: "32px", fontWeight: "600", color: "var(--error-text)" }}>{overview?.lockerCounts?.maintenance || 0}</h2>
              </div>
            </div>
            
            {overview?.byLocation && overview.byLocation.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "12px" }}>By Location</h4>
                <div className="flex flex-col gap-2">
                  {overview.byLocation.map(loc => (
                    <div key={loc.location} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ width: "80px", fontSize: "14px", fontWeight: 500 }}>{loc.location}</span>
                      <div style={{ flex: 1, height: "8px", backgroundColor: "var(--border-color)", borderRadius: "4px", overflow: "hidden", display: "flex" }}>
                        <div style={{ width: `${(loc.occupied / loc.total) * 100}%`, backgroundColor: "var(--text-main)" }}></div>
                        <div style={{ width: `${(loc.available / loc.total) * 100}%`, backgroundColor: "var(--success-text)" }}></div>
                        <div style={{ width: `${(loc.maintenance / loc.total) * 100}%`, backgroundColor: "var(--error-text)" }}></div>
                      </div>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{loc.total} total</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Logs Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 style={{ fontSize: "18px", fontWeight: 500 }}>Recent Logs</h3>
              <input 
                type="text" 
                placeholder="Search user, locker, or action..."
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                style={{ padding: "6px 12px", border: "1px solid var(--border-color)", fontSize: "14px", width: "250px" }}
              />
            </div>
            <div style={{ border: "2px solid var(--border-color)", backgroundColor: "var(--bg-surface)", overflowX: "auto", maxHeight: "400px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                    <th style={{ padding: "12px 16px", borderRight: "1px solid var(--border-color)", fontWeight: "600" }}>User</th>
                    <th style={{ padding: "12px 16px", borderRight: "1px solid var(--border-color)", fontWeight: "600" }}>Locker</th>
                    <th style={{ padding: "12px 16px", borderRight: "1px solid var(--border-color)", fontWeight: "600" }}>Action</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600" }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.filter(log => 
                      (log.actorEmail || "U_SYS").toLowerCase().includes(logSearch.toLowerCase()) ||
                      log.lockerCode.toLowerCase().includes(logSearch.toLowerCase()) ||
                      log.action.toLowerCase().includes(logSearch.toLowerCase())
                    ).slice(0, 20).map((log, i, arr) => (
                      <tr key={log.id} style={{ borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--border-color)" }}>
                        <td style={{ padding: "12px 16px", borderRight: "1px solid var(--border-color)" }}>{log.actorEmail?.split('@')[0] || "U_SYS"}</td>
                        <td style={{ padding: "12px 16px", borderRight: "1px solid var(--border-color)" }}>{log.lockerCode}</td>
                        <td style={{ padding: "12px 16px", borderRight: "1px solid var(--border-color)", textTransform: "capitalize" }}>{(log.action.toLowerCase())}</td>
                        <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                      </tr>
                    ))
                  ) : (
                      <tr>
                          <td style={{ padding: "12px 16px", borderRight: "1px solid var(--border-color)" }}>U1</td>
                          <td style={{ padding: "12px 16px", borderRight: "1px solid var(--border-color)" }}>LA</td>
                          <td style={{ padding: "12px 16px", borderRight: "1px solid var(--border-color)" }}>Reserved</td>
                          <td style={{ padding: "12px 16px" }}>10:00</td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-4 mt-2">
            
            {actionSuccess && <div className="alert alert-success" style={{ backgroundColor: "var(--success-text)", color: "#fff", padding: "12px" }}>{actionSuccess}</div>}

            <div style={{ border: "2px solid var(--border-color)", padding: "16px", backgroundColor: "var(--bg-surface)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 500, marginBottom: "16px" }}>Locker Management</h3>
              <div className="flex items-center gap-4 flex-wrap">
                 <input 
                   type="text" 
                   placeholder="Locker Code (e.g. A1)"
                   value={lockerCodeInput}
                   onChange={e => setLockerCodeInput(e.target.value)}
                   style={{ padding: "8px 12px", border: "2px solid var(--border-color)", outline: "none", fontSize: "16px", width: "200px" }}
                 />
                 <div className="flex items-center gap-2">
                   <span style={{ fontSize: "14px", fontWeight: "500" }}>Maintenance:</span>
                   <button 
                      disabled={busy}
                      onClick={() => toggleMaintenanceMode(true)}
                      className="btn"
                      style={{ padding: "6px 16px", border: "2px solid var(--text-main)", backgroundColor: "transparent", color: "var(--text-main)", fontWeight: "bold" }}
                   >
                      ON
                   </button>
                   <button 
                      disabled={busy}
                      onClick={() => toggleMaintenanceMode(false)}
                      className="btn"
                      style={{ padding: "6px 16px", border: "2px solid var(--text-main)", backgroundColor: "transparent", color: "var(--text-main)", fontWeight: "bold" }}
                   >
                      OFF
                   </button>
                 </div>
                 <button 
                    disabled={busy}
                    onClick={forceRelease}
                    className="btn"
                    style={{ padding: "6px 16px", backgroundColor: "var(--error-text)", color: "#fff", border: "2px solid var(--error-text)", fontWeight: "bold" }}
                 >
                    Force Release
                 </button>
              </div>
            </div>

            <div className="flex justify-start">
              <button
                 onClick={exportCsv}
                 className="btn"
                 style={{ border: "2px solid var(--text-main)", backgroundColor: "transparent", color: "var(--text-main)", fontWeight: "600", fontSize: "16px", padding: "10px 24px" }}
              >
                 Export CSV
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
