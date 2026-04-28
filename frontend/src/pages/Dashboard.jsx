import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const [s, a] = await Promise.all([
        api("/api/stats"),
        api("/api/activity?limit=12"),
      ]);
      setStats(s);
      setActivity(a.activity ?? []);
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">System Dashboard</h1>
      </div>

      {error ? <div className="alert alert-error" style={{ margin: '16px' }}>{error}</div> : null}

      <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ flex: 1, minWidth: '200px', padding: '16px', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
           <p className="form-label" style={{ textTransform: 'uppercase' }}>Total Capacity</p>
           <h2 style={{ fontSize: '24px', fontWeight: '400', color: 'var(--primary-color)' }}>{loading ? "-" : stats?.total ?? "-"}</h2>
        </div>
        <div style={{ flex: 1, minWidth: '200px', padding: '16px', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
           <p className="form-label" style={{ textTransform: 'uppercase' }}>Available Units</p>
           <h2 style={{ fontSize: '24px', fontWeight: '400', color: 'var(--success-color)' }}>{loading ? "-" : stats?.available ?? "-"}</h2>
        </div>
        <div style={{ flex: 1, minWidth: '200px', padding: '16px', backgroundColor: 'var(--bg-surface)' }}>
           <p className="form-label" style={{ textTransform: 'uppercase' }}>Active Assignments</p>
           <h2 style={{ fontSize: '24px', fontWeight: '400', color: 'var(--warning-color)' }}>{loading ? "-" : stats?.occupied ?? "-"}</h2>
        </div>
      </div>

      <div className="panel" style={{ flex: 1, borderBottom: 'none', borderRight: 'none' }}>
        <div className="panel-header">
          Recent Audit Log
        </div>
        {loading && activity.length === 0 ? (
           <div style={{ padding: '16px' }}><div className="skeleton skeleton-row"></div></div>
        ) : activity.length === 0 ? (
          <div className="empty-state"><p className="empty-state-desc">No records found.</p></div>
        ) : (
          <div className="table-wrapper" style={{ borderTop: 'none' }}>
             <table className="table">
                <thead>
                   <tr>
                      <th>Action Type</th>
                      <th>Resource ID</th>
                      <th>Description</th>
                      <th>Timestamp</th>
                   </tr>
                </thead>
                <tbody>
                   {activity.map((item) => (
                      <tr key={item.id}>
                         <td><span className={`status-badge ${item.action === 'BOOKED' ? 'status-occupied' : item.action === 'RELEASED' ? 'status-maintenance' : 'status-available'}`}>{item.action}</span></td>
                         <td style={{ fontWeight: 600 }}>{item.locker}</td>
                         <td>{item.details}</td>
                         <td>{new Date(item.at).toLocaleString()}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
}
