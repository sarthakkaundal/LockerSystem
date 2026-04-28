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
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Booking History</h1>
      </div>

      {error && <div className="alert alert-error" style={{ margin: '16px' }}>{error}</div>}

      <div className="panel" style={{ flex: 1, borderBottom: 'none', borderRight: 'none' }}>
        <div className="panel-header">
          <span>Transaction Log</span>
          {history.length > 0 && (
            <input 
              type="text" 
              placeholder="Search..." 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="form-input"
              style={{ width: "200px", height: "24px", padding: "2px 6px" }}
            />
          )}
        </div>
        
        {loading ? (
           <div style={{ padding: "16px" }}><div className="skeleton skeleton-row"></div></div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-desc">No records found.</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ borderTop: "none" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Resource ID</th>
                  <th>Location</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                </tr>
              </thead>
              <tbody>
                {history.filter(h => 
                  h.lockerCode.toLowerCase().includes(filter.toLowerCase()) || 
                  h.location.toLowerCase().includes(filter.toLowerCase())
                ).map((booking) => (
                  <tr key={booking.id}>
                    <td style={{ fontWeight: 600 }}>{booking.lockerCode}</td>
                    <td>{booking.location}</td>
                    <td>{new Date(booking.startedAt).toLocaleString()}</td>
                    <td>{new Date(booking.endedAt).toLocaleString()}</td>
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
    </div>
  );
}
