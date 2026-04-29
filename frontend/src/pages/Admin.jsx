import { useCallback, useEffect, useState } from "react";
import { api, apiText } from "../api/client";
import toast from "react-hot-toast";

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
    
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-slate-800">Force release resource {lockerCodeInput}?</p>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              executeForceRelease();
            }}
            className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Confirm
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const executeForceRelease = async () => {
    setBusy(true);
    setFormError("");
    setActionSuccess("");
    try {
      await api("/api/admin/bookings/force-release", {
        method: "POST",
        body: { lockerCode: lockerCodeInput.toUpperCase() },
      });
      toast.success(`Resource ${lockerCodeInput} was force released.`);
      setActionSuccess(`Resource ${lockerCodeInput} was force released.`);
      load();
    } catch (e) {
      toast.error(e.message || "Failed to force release.");
      setFormError(e.message || "Failed to force release.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-full space-y-6 sm:space-y-8">

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm border border-red-100">{error}</div>}
      {formError && <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm border border-red-100">{formError}</div>}
      {actionSuccess && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl shadow-sm border border-emerald-100">{actionSuccess}</div>}

      {/* Top Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6 hover:-translate-y-1">
           <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Capacity</p>
           <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{overview?.lockerCounts?.total || 0}</h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6 hover:-translate-y-1">
           <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Available Units</p>
           <h2 className="text-2xl sm:text-3xl font-bold text-green-600">{overview?.lockerCounts?.available || 0}</h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6 hover:-translate-y-1">
           <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Active Assignments</p>
           <h2 className="text-2xl sm:text-3xl font-bold text-red-600">{overview?.lockerCounts?.occupied || 0}</h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6 hover:-translate-y-1">
           <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Maintenance</p>
           <h2 className="text-2xl sm:text-3xl font-bold text-yellow-600">{overview?.lockerCounts?.maintenance || 0}</h2>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Resource Status Grid */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex-grow lg:w-2/3 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
             <span className="text-lg sm:text-xl font-semibold text-slate-800">Resource Map</span>
             <div className="flex gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> Available</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Occupied</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div> Maint</span>
             </div>
          </div>
          <div className="p-4 sm:p-6 bg-slate-50 min-h-[200px]">
             {loading ? <div className="animate-pulse h-12 bg-slate-200 rounded"></div> : (
               <div className="flex flex-wrap gap-3">
                 {lockers.map((l) => {
                    let bgColor = "bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300";
                    if (l.status === "AVAILABLE") {
                      bgColor = "bg-green-500 text-white border-green-600 shadow-sm hover:bg-green-600 hover:shadow-md";
                    } else if (l.status === "OCCUPIED") {
                      bgColor = "bg-red-500 text-white border-red-600 shadow-sm hover:bg-red-600 hover:shadow-md";
                    }
                    return (
                      <div 
                        key={l.code}
                        onClick={() => setLockerCodeInput(l.code)}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer border transition-all hover:scale-105 active:scale-95 ${bgColor}`}
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
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 lg:w-1/3 flex flex-col overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 bg-white">
            <span className="text-lg sm:text-xl font-semibold text-slate-800">Administrative Actions</span>
          </div>
          <div className="p-4 sm:p-6 flex flex-col flex-grow">
            <div className="mb-5">
               <label className="block text-sm font-medium text-slate-600 mb-2">Resource ID</label>
               <input 
                 type="text" 
                 className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" 
                 value={lockerCodeInput} 
                 onChange={e => setLockerCodeInput(e.target.value)} 
                 placeholder="e.g. A1"
               />
            </div>
            
            <div className="flex gap-3 mb-6">
               <button className="flex-1 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50" onClick={() => toggleMaintenanceMode(true)} disabled={busy || loading}>Maint ON</button>
               <button className="flex-1 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50" onClick={() => toggleMaintenanceMode(false)} disabled={busy || loading}>Maint OFF</button>
            </div>
            
            <div className="mt-auto">
              <button className="w-full bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50" onClick={forceRelease} disabled={busy || loading}>
                 Force Release
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden hover:-translate-y-1">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
           <span className="text-lg sm:text-xl font-semibold text-slate-800">System Audit Logs</span>
           <div className="flex gap-3 items-center w-full sm:w-auto">
             <input 
               type="text" 
               className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" 
               placeholder="Filter records..."
               value={logSearch}
               onChange={e => setLogSearch(e.target.value)}
             />
             <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md whitespace-nowrap" onClick={exportCsv}>
                Export CSV
             </button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-sm font-medium text-slate-600">User ID</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-600">Resource</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-600">Action</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-600">Timestamp</th>
                    <th className="px-6 py-4 text-sm font-medium text-slate-600">Details</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {loading ? (
                    <tr><td colSpan="5" className="p-6"><div className="animate-pulse h-8 bg-slate-100 rounded"></div></td></tr>
                 ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-slate-100 rounded-full p-4 mb-4">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          <p className="text-slate-500 font-medium">No records found.</p>
                        </div>
                      </td>
                    </tr>
                 ) : (
                    logs.filter(log => 
                      (log.actorEmail || "System").toLowerCase().includes(logSearch.toLowerCase()) ||
                      log.lockerCode.toLowerCase().includes(logSearch.toLowerCase()) ||
                      log.action.toLowerCase().includes(logSearch.toLowerCase())
                    ).map(log => (
                       <tr key={log.id} className="even:bg-slate-50 hover:bg-slate-100 transition-colors duration-150">
                          <td className="px-6 py-4 text-sm font-semibold text-slate-800">{log.actorEmail || "System"}</td>
                          <td className="px-6 py-4 text-sm text-slate-800">{log.lockerCode}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                              log.action === 'BOOKED' ? 'bg-amber-100 text-amber-800' : 
                              log.action === 'RELEASED' ? 'bg-slate-100 text-slate-800' : 
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{log.details || "-"}</td>
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
