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
    <div className="p-6 bg-slate-50 min-h-full space-y-6">


      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm border border-red-100">
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-wrap gap-4 items-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
         <input 
            type="text" 
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
         />
         <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow appearance-none"
         >
            <option value="all">All Locations</option>
            {allLocations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
         </select>
         <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow appearance-none"
         >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
         </select>
      </div>

      <div>
        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-slate-200 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                  <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="bg-slate-100 rounded-full p-4 mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-slate-500 font-medium">No records found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((locker) => {
               const isAvail = locker.status === "Available";
               const badgeClass = isAvail 
                 ? "bg-emerald-100 text-emerald-800" 
                 : locker.status === "Maintenance" 
                   ? "bg-slate-100 text-slate-600" 
                   : "bg-red-100 text-red-800";

               return (
                 <div key={locker.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-lg font-bold text-slate-800">{locker.id}</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${badgeClass}`}>
                        {locker.status}
                      </span>
                   </div>
                   <p className="text-sm text-slate-500 mb-6 flex-1">{locker.location}</p>
                   
                   <button
                     disabled={!isAvail}
                     onClick={() => navigate(`/reserve?locker=${encodeURIComponent(locker.id)}`)}
                     className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                       isAvail 
                         ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md" 
                         : "bg-slate-100 text-slate-400 cursor-not-allowed"
                     }`}
                   >
                     {isAvail ? "Assign Locker" : "Locked"}
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
