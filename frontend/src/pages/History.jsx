import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await api("/api/bookings/history");
      setHistory(data.history || []);
    } catch (e) {
      setError(e.message || "Could not load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Booking History</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="skeleton skeleton-row" style={{ height: "400px" }}></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="flex items-center justify-between" style={{ padding: "16px", borderBottom: "1px solid var(--border-color)", backgroundColor: "var(--bg-surface)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 600 }}>Past Bookings</h3>
            {history.length > 0 && (
              <input 
                type="text" 
                placeholder="Search locker or location..." 
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{ padding: "8px 12px", border: "1px solid var(--border-color)", fontSize: "14px", width: "250px" }}
              />
            )}
          </div>
          
          {history.length === 0 ? (
            <div style={{ padding: "16px" }}>
              <p style={{ color: "var(--text-muted)" }}>No booking history found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-app)", borderBottom: "1px solid var(--border-color)" }}>
                    <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: "14px" }}>Locker ID</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: "14px" }}>Location</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: "14px" }}>Start Time</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, fontSize: "14px" }}>End Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history.filter(h => 
                    h.lockerCode.toLowerCase().includes(filter.toLowerCase()) || 
                    h.location.toLowerCase().includes(filter.toLowerCase())
                  ).map((booking) => (
                    <tr key={booking.id} style={{ borderBottom: "1px solid var(--border-color)", backgroundColor: "var(--bg-surface)" }}>
                      <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 500 }}>
                        {booking.lockerCode}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                        {booking.location}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "14px", color: "var(--text-muted)" }}>
                        {new Date(booking.startedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "14px", color: "var(--text-muted)" }}>
                        {new Date(booking.endedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                    </tr>
                  ))}
                  {history.filter(h => 
                    h.lockerCode.toLowerCase().includes(filter.toLowerCase()) || 
                    h.location.toLowerCase().includes(filter.toLowerCase())
                  ).length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)" }}>
                        No results found for "{filter}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
