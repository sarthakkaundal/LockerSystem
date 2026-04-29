import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

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
    <div className="p-6 bg-slate-50 min-h-full space-y-6">


      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm border border-red-100">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white">
          <h2 className="text-lg font-semibold text-slate-800">Transaction Log</h2>
          {history.length > 0 && (
            <input 
              type="text" 
              placeholder="Search resources or locations..." 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            />
          )}
        </div>
        
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse h-12 bg-slate-100 rounded mb-2"></div>
            <div className="animate-pulse h-12 bg-slate-100 rounded mb-2"></div>
            <div className="animate-pulse h-12 bg-slate-100 rounded"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-slate-100 rounded-full p-4 mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-slate-500 font-medium">No records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4 text-sm font-medium text-slate-600">Resource ID</th>
                  <th className="px-6 py-4 text-sm font-medium text-slate-600">Location</th>
                  <th className="px-6 py-4 text-sm font-medium text-slate-600">Start Time</th>
                  <th className="px-6 py-4 text-sm font-medium text-slate-600">End Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((booking) => (
                  <tr key={booking.id} className="even:bg-slate-50 hover:bg-slate-100 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{booking.lockerCode}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{booking.location}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(booking.startedAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(booking.endedAt).toLocaleString()}</td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-slate-500">
                      No results found for "{filter}"
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
