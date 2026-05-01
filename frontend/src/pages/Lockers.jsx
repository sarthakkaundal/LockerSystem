import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-full space-y-4 sm:space-y-6"
    >


      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm border border-red-100">
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
         <input 
            type="text" 
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 sm:flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
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
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center"
          >
            <div className="bg-slate-100 rounded-full p-4 mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-slate-500 font-medium">No records found.</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {filtered.map((locker) => {
               const isAvail = locker.status === "Available";
               const badgeClass = isAvail 
                 ? "bg-green-100 text-green-700" 
                 : locker.status === "Maintenance" 
                   ? "bg-yellow-100 text-yellow-700" 
                   : "bg-red-100 text-red-700";

               return (
                 <motion.div 
                   variants={{
                     hidden: { opacity: 0, y: 20 },
                     show: { opacity: 1, y: 0 }
                   }}
                   whileHover={{ y: -4 }}
                   key={locker.id} 
                   className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 cursor-pointer overflow-hidden relative"
                   onClick={() => isAvail && navigate(`/reserve?locker=${encodeURIComponent(locker.id)}`)}
                 >
                   {/* Background Highlight for available items on hover */}
                   {isAvail && <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />}
                   
                   <div className="flex justify-between items-start mb-2 relative z-10">
                      <span className="text-lg sm:text-xl font-bold text-slate-800">{locker.id}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${badgeClass}`}>
                        {isAvail ? <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> : 
                         locker.status === "Maintenance" ? <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div> :
                         <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
                        {locker.status}
                      </span>
                   </div>
                   
                   <div className="flex-1 relative z-10 pb-8">
                     <p className="text-sm text-slate-500">{locker.location}</p>
                     
                     <div className="absolute bottom-0 left-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                     {locker.status === "Available" ? (
                       <p className="text-xs text-slate-400 mb-2">Click to reserve this unit for a designated duration.</p>
                     ) : locker.status === "Maintenance" ? (
                       <p className="text-xs text-slate-400 mb-2">This unit is under maintenance.</p>
                     ) : (
                       <p className="text-xs text-slate-400 mb-2">This unit is occupied.</p>
                     )}
                     </div>
                   </div>
                   
                   <motion.button
                     whileTap={isAvail ? { scale: 0.95 } : {}}
                     disabled={!isAvail}
                     className={`relative z-10 w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                       isAvail 
                         ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-sm hover:shadow-md" 
                         : "bg-slate-100 text-slate-400 cursor-not-allowed"
                     }`}
                   >
                     {isAvail ? "Assign Locker" : "Locked"}
                   </motion.button>
                 </motion.div>
               )
            })}
          </motion.div>
        )}
      </div>

    </motion.div>
  );
}

export default Lockers;
