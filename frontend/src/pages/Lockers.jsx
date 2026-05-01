import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/client";
import { Search, MapPin } from "lucide-react";

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm font-medium">
          {error}
        </div>
      ) : null}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search lockers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow placeholder:text-gray-400"
          />
        </div>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
        >
          <option value="all">All Locations</option>
          {allLocations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </div>

      {/* Results */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-lg border border-gray-200 p-5 h-40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-lg border border-gray-200 py-16 text-center">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No lockers found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.04 } }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filtered.map((locker) => {
              const isAvail = locker.status === "Available";
              const statusConfig = isAvail 
                ? { dot: "bg-green-500", badge: "bg-green-50 text-green-700 border-green-200", label: "Available" }
                : locker.status === "Maintenance" 
                  ? { dot: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Maintenance" }
                  : { dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200", label: "Occupied" };

              return (
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                  key={locker.id} 
                  className={`group bg-white rounded-lg border transition-all duration-200 p-5 flex flex-col cursor-pointer ${
                    isAvail 
                      ? 'border-gray-200 hover:border-orange-300 hover:shadow-md' 
                      : 'border-gray-200 opacity-75'
                  }`}
                  onClick={() => isAvail && navigate(`/reserve?locker=${encodeURIComponent(locker.id)}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-lg font-bold text-gray-900">{locker.id}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-semibold ${statusConfig.badge}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></div>
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {locker.location}
                  </p>
                  
                  <button
                    disabled={!isAvail}
                    className={`mt-auto w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      isAvail 
                        ? "bg-orange-500 text-white hover:bg-orange-600" 
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isAvail ? "Assign Locker" : "Unavailable"}
                  </button>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Lockers;
