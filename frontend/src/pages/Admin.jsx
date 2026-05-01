import { useCallback, useEffect, useState } from "react";
import { api, apiText } from "../api/client";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2, Download, Search } from "lucide-react";

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
        <p className="font-medium text-gray-800">Force release resource {lockerCodeInput}?</p>
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
            className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
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

  const statCards = [
    { label: "Total Capacity", value: overview?.lockerCounts?.total || 0, color: "text-gray-900" },
    { label: "Available", value: overview?.lockerCounts?.available || 0, color: "text-green-600" },
    { label: "Occupied", value: overview?.lockerCounts?.occupied || 0, color: "text-red-600" },
    { label: "Maintenance", value: overview?.lockerCounts?.maintenance || 0, color: "text-yellow-600" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm font-medium">{error}</div>}
      {formError && <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm font-medium">{formError}</div>}
      {actionSuccess && <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 text-sm font-medium">{actionSuccess}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
            <h2 className={`text-2xl font-bold ${card.color}`}>{card.value}</h2>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Resource Map */}
        <div className="bg-white rounded-lg border border-gray-200 flex-grow lg:w-2/3 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <span className="text-base font-semibold text-gray-900">Resource Map</span>
            <div className="flex gap-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Available</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Occupied</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Maint</span>
            </div>
          </div>
          <div className="p-5 bg-gray-50 min-h-[200px]">
            {loading ? <div className="animate-pulse h-12 bg-gray-200 rounded"></div> : (
              <div className="flex flex-wrap gap-2.5">
                {lockers.map((l) => {
                  let bgColor = "bg-gray-200 text-gray-500 border-gray-300";
                  if (l.status === "Available") {
                    bgColor = "bg-green-500 text-white border-green-600 hover:bg-green-600";
                  } else if (l.status === "Occupied") {
                    bgColor = "bg-red-500 text-white border-red-600 hover:bg-red-600";
                  } else if (l.status === "Maintenance") {
                    bgColor = "bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600";
                  }
                  return (
                    <div 
                      key={l.code}
                      onClick={() => setLockerCodeInput(l.code)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold cursor-pointer border transition-colors ${bgColor} ${lockerCodeInput === l.code ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
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
        <div className="bg-white rounded-lg border border-gray-200 lg:w-1/3 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <span className="text-base font-semibold text-gray-900">Quick Actions</span>
          </div>
          <div className="p-5 flex flex-col flex-grow gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Resource ID</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-gray-400" 
                value={lockerCodeInput} 
                onChange={e => setLockerCodeInput(e.target.value)} 
                placeholder="e.g. A1"
              />
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1.5" onClick={() => toggleMaintenanceMode(true)} disabled={busy || loading}>
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Maint ON
              </button>
              <button className="flex-1 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1.5" onClick={() => toggleMaintenanceMode(false)} disabled={busy || loading}>
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Maint OFF
              </button>
            </div>
            
            <button className="w-full mt-auto bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2" onClick={forceRelease} disabled={busy || loading}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Force Release
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <span className="text-base font-semibold text-gray-900">System Audit Logs</span>
          <div className="flex gap-3 items-center w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                className="w-full sm:w-48 bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-gray-400" 
                placeholder="Filter records..."
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
              />
            </div>
            <button className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap" onClick={exportCsv}>
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resource</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-6"><div className="animate-pulse h-8 bg-gray-100 rounded"></div></td></tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <p className="text-sm text-gray-400">No audit records found</p>
                  </td>
                </tr>
              ) : (
                logs.filter(log => 
                  (log.actorEmail || "System").toLowerCase().includes(logSearch.toLowerCase()) ||
                  log.lockerCode.toLowerCase().includes(logSearch.toLowerCase()) ||
                  log.action.toLowerCase().includes(logSearch.toLowerCase())
                ).map(log => (
                  <tr key={log.id} className="hover:bg-orange-50/40 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-gray-800">{log.actorEmail || "System"}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{log.lockerCode}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        log.action === 'BOOKED' ? 'bg-amber-100 text-amber-800' : 
                        log.action === 'RELEASED' ? 'bg-gray-100 text-gray-700' : 
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400 tabular-nums">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{log.details || "—"}</td>
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
