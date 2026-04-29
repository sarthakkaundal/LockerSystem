import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "../api/client";

const durations = [
  { value: "1", label: "1 hour" },
  { value: "2", label: "2 hours" },
  { value: "4", label: "4 hours" },
];

function Reserve() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paramId = searchParams.get("locker")?.trim() || "";

  const [lockers, setLockers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const available = useMemo(
    () => lockers.filter((l) => l.status === "Available"),
    [lockers]
  );

  const fromParam = useMemo(
    () => lockers.find((l) => l.id === paramId),
    [lockers, paramId]
  );

  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const data = await api("/api/lockers");
        if (cancelled) return;
        setLockers(data.lockers ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Could not load lockers.");
          setLockers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!available.length) {
      setSelectedId("");
      return;
    }
    if (fromParam?.status === "Available" && paramId) {
      setSelectedId(paramId);
      return;
    }
    setSelectedId((prev) =>
      prev && available.some((l) => l.id === prev) ? prev : available[0].id
    );
  }, [available, fromParam, paramId]);

  const selected = lockers.find((l) => l.id === selectedId);
  const [duration, setDuration] = useState("2");
  const [note, setNote] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!selected || selected.status !== "Available") return;
    setSubmitting(true);
    try {
      await api("/api/bookings", {
        method: "POST",
        body: {
          lockerCode: selected.id,
          durationHours: Number(duration),
          note: note.trim() || undefined,
        },
      });
      toast.success("Locker assigned successfully");
      navigate("/my-locker");
    } catch (err) {
      toast.error(err.message || "Reservation failed.");
      setSubmitError(err.message || "Reservation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-full space-y-6">


      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm border border-red-100">
          {error}
        </div>
      ) : null}

      <div className="max-w-2xl mx-auto">
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit} 
          className="bg-white rounded-xl shadow-sm border border-slate-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
        >
          <div className="px-6 py-5 border-b border-slate-200 bg-white rounded-t-xl">
            <h2 className="text-lg font-semibold text-slate-800">Assignment Configuration</h2>
          </div>
          <div className="p-6 sm:p-8">
            {submitError ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 text-sm">
                {submitError}
              </div>
            ) : null}

            <div className="mb-6">
              <label htmlFor="locker" className="block text-sm font-medium text-slate-600 mb-2">
                Select Resource
              </label>
              {loading ? (
                <div className="animate-pulse h-10 bg-slate-100 rounded-lg"></div>
              ) : (
                <div className="relative">
                  <select
                    id="locker"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow appearance-none pr-10"
                  >
                    {available.length === 0 ? (
                      <option value="">No resources available</option>
                    ) : (
                      available.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.id} — {l.location}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              )}
              {paramId && fromParam && fromParam.status !== "Available" ? (
                <p className="mt-2 text-xs font-medium text-red-500">
                  Resource {paramId} is unavailable.
                </p>
              ) : null}
            </div>

            {selected ? (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 flex justify-between items-center">
                <span className="font-semibold text-indigo-900">{selected.id}</span>
                <span className="text-sm font-medium text-indigo-700">{selected.location}</span>
              </div>
            ) : null}

            <div className="mb-6">
              <label htmlFor="duration" className="block text-sm font-medium text-slate-600 mb-2">
                Duration
              </label>
              <div className="relative">
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow appearance-none pr-10"
                >
                  {durations.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <label htmlFor="note" className="block text-sm font-medium text-slate-600">
                  Reference Note
                </label>
                <span className="text-xs text-slate-400">{note.length}/500</span>
              </div>
              <textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                placeholder="Optional notes for this assignment..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100 items-center justify-between">
              <Link to="/lockers" className="w-full sm:w-auto px-6 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-all duration-200 text-center shadow-sm hover:shadow-md block">
                <motion.span whileTap={{ scale: 0.95 }} className="block w-full h-full">Cancel</motion.span>
              </Link>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={submitting || loading || !selected || selected.status !== "Available"}
                className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                {submitting ? "Processing..." : "Confirm Assignment"}
              </motion.button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default Reserve;
