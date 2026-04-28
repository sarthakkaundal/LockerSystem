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
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Resource Allocation</h1>
      </div>

      {error ? (
        <div className="alert alert-error" style={{ margin: "16px" }}>
          {error}
        </div>
      ) : null}

      <div style={{ padding: "12px 16px", backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
         <input 
            type="text" 
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ width: "200px" }}
         />
         <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="form-input"
            style={{ width: "150px" }}
         >
            <option value="all">All Locations</option>
            {allLocations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
         </select>
         <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input"
            style={{ width: "150px" }}
         >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
         </select>
      </div>

      <div style={{ flex: 1, backgroundColor: "var(--bg-app)" }}>
        {loading ? (
          <div style={{ padding: "16px" }}><div className="skeleton skeleton-row"></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-desc">No records found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-auto">
            {filtered.map((locker) => {
               const isAvail = locker.status === "Available";
               const badgeClass = isAvail ? "status-available" : locker.status === "Maintenance" ? "status-maintenance" : "status-occupied";

               return (
                 <div key={locker.id} style={{ padding: "16px", display: "flex", flexDirection: "column", border: "1px solid transparent" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span style={{ fontSize: "16px", fontWeight: 600 }}>{locker.id}</span>
                      <span className={`status-badge ${badgeClass}`}>{locker.status}</span>
                   </div>
                   <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px", flex: 1 }}>{locker.location}</p>
                   
                   <button
                     disabled={!isAvail}
                     onClick={() => navigate(`/reserve?locker=${encodeURIComponent(locker.id)}`)}
                     className={isAvail ? "btn btn-primary btn-full" : "btn btn-secondary btn-full"}
                   >
                     {isAvail ? "Assign" : "Locked"}
                   </button>
                 </div>
               )
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default Lockers;
