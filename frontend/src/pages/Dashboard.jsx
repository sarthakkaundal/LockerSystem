import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { motion } from "framer-motion";
import { Box, CheckCircle, Clock } from "lucide-react";

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

  const statCards = [
    {
      label: "Total Capacity",
      value: stats?.total,
      icon: Box,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Available",
      value: stats?.available,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Active Assignments",
      value: stats?.occupied,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.08 } }
        }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            className="bg-white rounded-lg border border-gray-200 p-5 flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900">{loading ? "—" : card.value ?? "—"}</p>
            </div>
            <div className={`${card.bg} ${card.color} p-2.5 rounded-lg`}>
              <card.icon className="w-5 h-5" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Activity Log */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          <span className="text-xs text-gray-400 font-medium">{activity.length} entries</span>
        </div>
        
        {loading && activity.length === 0 ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="animate-pulse h-10 bg-gray-100 rounded" />)}
          </div>
        ) : activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No activity recorded yet</p>
            <p className="text-xs text-gray-400 mt-1">Locker actions will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resource</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activity.map((item) => (
                  <tr key={item.id} className="hover:bg-orange-50/40 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        item.action === 'BOOKED' ? 'bg-amber-100 text-amber-800' : 
                        item.action === 'RELEASED' ? 'bg-gray-100 text-gray-700' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">{item.locker}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{item.details}</td>
                    <td className="px-5 py-3 text-sm text-gray-400 tabular-nums">{new Date(item.at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
