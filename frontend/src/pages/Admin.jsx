import { useCallback, useEffect, useState } from "react";
import { api, apiText } from "../api/client";

export default function Admin() {
  const [overview, setOverview] = useState(null);
  const [logs, setLogs] = useState([]);
  const [lockers, setLockers] = useState([]);
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
      const [o, l, lockResp] = await Promise.all([
        api("/api/admin/overview"),
        api("/api/admin/logs?limit=80"),
        api("/api/lockers"),
      ]);
      setOverview(o);
      setLogs(l.logs ?? []);
      setLockers(lockResp.lockers ?? []);
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
        body: { code: lockerCodeInput.toUpperCase(), maintenance: status },
      });
      setActionSuccess(`Resource ${lockerCodeInput} maintenance set to ${status ? "ON" : "OFF"}`);
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
    if (!window.confirm(`Force release resource ${lockerCodeInput}?`)) return;
    setBusy(true);
    setFormError("");
    setActionSuccess("");
    try {
      await api("/api/admin/bookings/force-release", {
        method: "POST",
        body: { lockerCode: lockerCodeInput.toUpperCase() },
      });
      setActionSuccess(`Resource ${lockerCodeInput} was force released.`);
      load();
    } catch (e) {
      setFormError(e.message || "Failed to force release.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">System Administration</h1>
      </div>

      {error && <div className="alert alert-error" style={{ margin: "16px 16px 0 16px" }}>{error}</div>}
      {formError && <div className="alert alert-error" style={{ margin: "16px 16px 0 16px" }}>{formError}</div>}
      {actionSuccess && <div className="alert alert-success" style={{ margin: "16px 16px 0 16px" }}>{actionSuccess}</div>}

      {/* Top Stats Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ flex: 1, minWidth: '200px', padding: '12px 16px', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
           <p className="form-label" style={{ textTransform: 'uppercase', marginBottom: '2px' }}>Total Capacity</p>
           <h2 style={{ fontSize: '20px', fontWeight: '400' }}>{overview?.lockerCounts?.total || 0}</h2>
        </div>
        <div style={{ flex: 1, minWidth: '200px', padding: '12px 16px', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
           <p className="form-label" style={{ textTransform: 'uppercase', marginBottom: '2px' }}>Available Units</p>
           <h2 style={{ fontSize: '20px', fontWeight: '400', color: 'var(--success-color)' }}>{overview?.lockerCounts?.available || 0}</h2>
        </div>
        <div style={{ flex: 1, minWidth: '200px', padding: '12px 16px', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
           <p className="form-label" style={{ textTransform: 'uppercase', marginBottom: '2px' }}>Active Assignments</p>
           <h2 style={{ fontSize: '20px', fontWeight: '400', color: 'var(--warning-color)' }}>{overview?.lockerCounts?.occupied || 0}</h2>
        </div>
        <div style={{ flex: 1, minWidth: '200px', padding: '12px 16px', backgroundColor: 'var(--bg-surface)' }}>
           <p className="form-label" style={{ textTransform: 'uppercase', marginBottom: '2px' }}>Maintenance</p>
           <h2 style={{ fontSize: '20px', fontWeight: '400', color: 'var(--text-muted)' }}>{overview?.lockerCounts?.maintenance || 0}</h2>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {/* Resource Status Grid */}
        <div className="panel" style={{ flex: 2, minWidth: '320px', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="panel-header">
             <span>Resource Map</span>
             <div style={{ display: "flex", gap: "12px", fontSize: "11px", fontWeight: "normal" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "8px", height: "8px", backgroundColor: "var(--success-color)" }}></div> Available</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "8px", height: "8px", backgroundColor: "var(--warning-color)" }}></div> Occupied</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "8px", height: "8px", backgroundColor: "var(--border-color)" }}></div> Maint</span>
             </div>
          </div>
          <div className="panel-body" style={{ backgroundColor: '#f2f2f2', padding: '8px' }}>
             {loading ? <div className="skeleton skeleton-row"></div> : (
               <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                 {lockers.map((l) => {
                    let bgColor = "var(--border-color)";
                    let color = "var(--text-main)";
                    if (l.status === "AVAILABLE") {
                      bgColor = "var(--success-color)";
                      color = "#fff";
                    } else if (l.status === "OCCUPIED") {
                      bgColor = "var(--warning-color)";
                      color = "#fff";
                    }
                    return (
                      <div 
                        key={l.code}
                        onClick={() => setLockerCodeInput(l.code)}
                        style={{ 
                           width: "36px", height: "36px", backgroundColor: bgColor, color: color, 
                           display: "flex", alignItems: "center", justifyContent: "center", 
                           fontSize: "11px", fontWeight: "600", cursor: "pointer", 
                           border: "1px solid rgba(0,0,0,0.1)", borderRadius: "2px"
                        }}
                        title={`${l.code} - ${l.status}`}
                      >
                         {l.code}
                      </div>
                    )
                 })}
               </div>
             )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="panel" style={{ flex: 1, minWidth: '250px', borderRight: 'none', borderBottom: '1px solid var(--border-color)' }}>
          <div className="panel-header">Administrative Actions</div>
          <div className="panel-body">
            <div className="form-group">
               <label className="form-label">Resource ID</label>
               <input 
                 type="text" 
                 className="form-input" 
                 value={lockerCodeInput} 
                 onChange={e => setLockerCodeInput(e.target.value)} 
                 placeholder="e.g. A1"
               />
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
               <button className="btn btn-secondary flex-1" onClick={() => toggleMaintenanceMode(true)} disabled={busy || loading}>Maint ON</button>
               <button className="btn btn-secondary flex-1" onClick={() => toggleMaintenanceMode(false)} disabled={busy || loading}>Maint OFF</button>
            </div>
            
            <button className="btn btn-primary btn-full" onClick={forceRelease} disabled={busy || loading} style={{ backgroundColor: 'var(--error-color)', borderColor: 'var(--error-color)' }}>
               Force Release
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="panel" style={{ borderRight: 'none', borderBottom: 'none', flex: 1 }}>
        <div className="panel-header">
           <span>System Audit Logs</span>
           <div style={{ display: "flex", gap: "8px" }}>
             <input 
               type="text" 
               className="form-input" 
               style={{ width: "200px", height: "24px", padding: "2px 6px" }} 
               placeholder="Filter records..."
               value={logSearch}
               onChange={e => setLogSearch(e.target.value)}
             />
             <button className="btn btn-primary" style={{ padding: "2px 8px", fontSize: "11px" }} onClick={exportCsv}>
                Export CSV
             </button>
           </div>
        </div>
        
        <div className="table-wrapper" style={{ borderTop: 'none' }}>
           <table className="table">
              <thead>
                 <tr>
                    <th>User ID</th>
                    <th>Resource</th>
                    <th>Action</th>
                    <th>Timestamp</th>
                    <th>Details</th>
                 </tr>
              </thead>
              <tbody>
                 {loading ? (
                    <tr><td colSpan="5"><div className="skeleton skeleton-row"></div></td></tr>
                 ) : logs.length === 0 ? (
                    <tr><td colSpan="5" className="text-center" style={{ padding: '24px' }}>No records found.</td></tr>
                 ) : (
                    logs.filter(log => 
                      (log.actorEmail || "System").toLowerCase().includes(logSearch.toLowerCase()) ||
                      log.lockerCode.toLowerCase().includes(logSearch.toLowerCase()) ||
                      log.action.toLowerCase().includes(logSearch.toLowerCase())
                    ).map(log => (
                       <tr key={log.id}>
                          <td style={{ fontWeight: 600 }}>{log.actorEmail || "System"}</td>
                          <td>{log.lockerCode}</td>
                          <td><span className={`status-badge ${log.action === 'BOOKED' ? 'status-occupied' : log.action === 'RELEASED' ? 'status-maintenance' : 'status-available'}`}>{log.action}</span></td>
                          <td>{new Date(log.createdAt).toLocaleString()}</td>
                          <td>{log.details || "-"}</td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>
      </div>
      
    </div>
  );
}
