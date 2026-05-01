import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { Clock, Search } from "lucide-react";

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

  const filteredHistory = history.filter(h => 
    h.lockerCode.toLowerCase().includes(filter.toLowerCase()) || 
    h.location.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm font-medium">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Transaction Log</h2>
            <p className="text-xs text-gray-400 mt-0.5">{history.length} total records</p>
          </div>
          {history.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search resources or locations..." 
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full sm:w-64 bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow placeholder:text-gray-400"
              />
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="animate-pulse h-10 bg-gray-100 rounded" />)}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No booking history yet</p>
            <p className="text-xs text-gray-400 mt-1">Completed bookings will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resource ID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Time</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">End Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredHistory.map((booking) => (
                  <tr key={booking.id} className="hover:bg-orange-50/40 transition-colors">
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">{booking.lockerCode}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{booking.location}</td>
                    <td className="px-5 py-3 text-sm text-gray-400 tabular-nums">{new Date(booking.startedAt).toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm text-gray-400 tabular-nums">{new Date(booking.endedAt).toLocaleString()}</td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-sm text-gray-400">
                      No results for "{filter}"
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
