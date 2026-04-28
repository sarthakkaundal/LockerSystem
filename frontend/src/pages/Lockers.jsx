import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

function Lockers() {
  const navigate = useNavigate();
  const [lockers, setLockers] = useState([]);
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allLocations, setAllLocations] = useState([]);

  useEffect(() => {
    api("/api/lockers")
      .then((d) => {
        const set = new Set((d.lockers ?? []).map((l) => l.location));
        setAllLocations([...set].sort());
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (locationFilter !== "all") params.set("location", locationFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const q = params.toString();
      const data = await api(`/api/lockers${q ? `?${q}` : ""}`);
      setLockers(data.lockers ?? []);
    } catch (e) {
      setError(e.message || "Could not load lockers.");
      setLockers([]);
    } finally {
      setLoading(false);
    }
  }, [locationFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = lockers.filter(l => 
    l.id.toLowerCase().includes(search.toLowerCase()) || 
    l.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
        <h1 className="page-title" style={{ fontSize: "20px" }}>Locker Booking Page</h1>
      </div>

      {error ? (
        <div className="alert alert-error">
          {error}
        </div>
      ) : null}

      <div style={{ border: "1px solid var(--border-color)", borderBottom: "none", backgroundColor: "var(--bg-surface)", padding: "16px" }}>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="form-group mb-0 flex-1">
            <input 
              type="text" 
              placeholder="SEARCH LOCKERS (e.g., by location or ID) 🔍"
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderRadius: "2px", textTransform: "uppercase", fontSize: "12px" }}
            />
          </div>

          <div className="flex gap-2 items-center flex-1 sm:justify-end">
            <span style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>Filter By:</span>
            <div className="flex flex-col gap-2">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="form-input"
                style={{ padding: "6px 12px", borderRadius: "2px", height: "32px", fontSize: "12px", textTransform: "uppercase" }}
              >
                <option value="all">LOCATION (select building/area)</option>
                {allLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
                style={{ padding: "6px 12px", borderRadius: "2px", height: "32px", fontSize: "12px", textTransform: "uppercase" }}
              >
                <option value="all">STATUS (Available / Occupied)</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ border: "1px solid var(--border-color)", padding: "16px", backgroundColor: "var(--bg-app)" }}>
        {loading ? (
          <div className="grid grid-cols-4 gap-3">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton" style={{ height: "140px" }}></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
            {filtered.map((locker) => (
              <div 
                key={locker.id} 
                style={{ 
                  border: locker.status === "Available" ? "2px solid var(--success-color)" : "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-surface)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  aspectRatio: "4/3",
                  position: "relative"
                }}
              >
                {locker.status === "Available" && (
                  <span style={{ position: "absolute", top: "8px", right: "8px", color: "var(--success-color)", fontWeight: "bold" }}>✓</span>
                )}
                <div>
                  <h3 style={{ fontSize: "32px", fontWeight: "600", marginBottom: "4px" }}>
                    {locker.id}
                  </h3>
                  <p style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: "600", color: locker.status === "Available" ? "var(--success-color)" : "var(--text-muted)" }}>
                    STATUS: {locker.status.toUpperCase()}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={locker.status !== "Available"}
                  onClick={() =>
                    locker.status === "Available" &&
                    navigate(`/reserve?locker=${encodeURIComponent(locker.id)}`)
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: locker.status === "Available" ? "2px solid var(--text-main)" : "2px solid var(--border-color)",
                    backgroundColor: locker.status === "Available" ? "transparent" : "var(--bg-app)",
                    color: locker.status === "Available" ? "var(--text-main)" : "var(--text-muted)",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    cursor: locker.status === "Available" ? "pointer" : "not-allowed",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  RESERVE
                  {locker.status !== "Available" && (
                     <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "100%", height: "2px", backgroundColor: "var(--border-color)", transform: "rotate(-15deg)", position: "absolute" }}></div>
                        <div style={{ width: "100%", height: "2px", backgroundColor: "var(--border-color)", transform: "rotate(15deg)", position: "absolute" }}></div>
                     </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && !error ? (
          <div className="empty-state mt-4">
            <p className="empty-state-desc" style={{ marginBottom: 0 }}>No lockers match these filters.</p>
          </div>
        ) : null}
      </div>

      <div style={{ border: "1px solid var(--border-color)", borderTop: "none", padding: "8px", textAlign: "center", backgroundColor: "var(--bg-surface)" }}>
         <span style={{ fontSize: "14px", fontWeight: "500" }}>Previous / <u>1</u> 2 3 / Next</span>
      </div>

    </div>
  );
}

export default Lockers;
