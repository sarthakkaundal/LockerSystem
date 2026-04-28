import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
      // Actually if they want total active bookings across system we should get it from stats, 
      // but for now we'll just mock or use stats.occupied for Active Bookings count if possible.
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
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      {error ? (
        <div className="alert alert-error">
          {error}
        </div>
      ) : null}

      {loading && !stats ? (
        <div className="skeleton skeleton-row" style={{ height: '300px' }}></div>
      ) : (
        <>
          <div className="grid grid-cols-3 mb-4">
            <div className="card" style={{ alignItems: "center", textAlign: "center" }}>
              <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Total Lockers</p>
              <h2 style={{ fontSize: "48px", fontWeight: "400" }}>{stats?.total ?? "-"}</h2>
            </div>
            <div className="card" style={{ alignItems: "center", textAlign: "center" }}>
              <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Available Lockers</p>
              <h2 style={{ fontSize: "48px", fontWeight: "400" }}>{stats?.available ?? "-"}</h2>
            </div>
            <div className="card" style={{ alignItems: "center", textAlign: "center" }}>
              <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Active Bookings</p>
              <h2 style={{ fontSize: "48px", fontWeight: "400" }}>{stats?.occupied ?? "-"}</h2>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px", borderBottom: "1px solid var(--border-color)", backgroundColor: "var(--bg-surface)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600 }}>Recent Activity Log</h3>
            </div>
            
            {activity.length === 0 ? (
              <div style={{ padding: "16px" }}>
                <p style={{ color: 'var(--text-muted)' }}>No recent activity.</p>
              </div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {activity.map((item, i) => (
                  <li key={item.id} style={{ 
                    padding: "12px 16px", 
                    borderBottom: i === activity.length - 1 ? "none" : "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    <div style={{ flex: 1, fontSize: "14px" }}>
                      <strong>{item.action}</strong> locker <strong>{item.locker}</strong> <span style={{ color: "var(--text-muted)", marginLeft: "4px" }}>- {item.details}</span>
                    </div>
                    <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                      ({new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
