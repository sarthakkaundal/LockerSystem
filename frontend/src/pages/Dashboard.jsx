import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { motion } from "framer-motion";

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
    <div className="p-6 bg-slate-50 min-h-full space-y-6">

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} whileHover={{ scale: 1.03 }} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 transition-shadow hover:shadow-md cursor-default">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Capacity</h3>
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{loading ? "-" : stats?.total ?? "-"}</p>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} whileHover={{ scale: 1.03 }} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 transition-shadow hover:shadow-md cursor-default">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Available Units</h3>
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{loading ? "-" : stats?.available ?? "-"}</p>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} whileHover={{ scale: 1.03 }} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 transition-shadow hover:shadow-md cursor-default">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Assignments</h3>
            <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{loading ? "-" : stats?.occupied ?? "-"}</p>
        </motion.div>
      </motion.div>

      {/* Activity Log Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Recent Audit Log</h2>
        </div>
        
        {loading && activity.length === 0 ? (
          <div className="p-6">
            <div className="animate-pulse h-12 bg-slate-100 rounded mb-2"></div>
            <div className="animate-pulse h-12 bg-slate-100 rounded mb-2"></div>
            <div className="animate-pulse h-12 bg-slate-100 rounded"></div>
          </div>
        ) : activity.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="bg-slate-100 rounded-full p-4 mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-2">No records found.</p>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4 text-sm font-medium text-slate-600">Action Type</th>
                  <th className="px-6 py-4 text-sm font-medium text-slate-600">Resource ID</th>
                  <th className="px-6 py-4 text-sm font-medium text-slate-600">Description</th>
                  <th className="px-6 py-4 text-sm font-medium text-slate-600">Timestamp</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                }}
                initial="hidden"
                animate="show"
                className="divide-y divide-slate-100"
              >
                {activity.map((item) => (
                  <motion.tr variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} key={item.id} className="even:bg-slate-50 hover:bg-slate-100 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                        item.action === 'BOOKED' ? 'bg-amber-100 text-amber-800' : 
                        item.action === 'RELEASED' ? 'bg-indigo-100 text-indigo-800' : 
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{item.locker}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.details}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(item.at).toLocaleString()}</td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
