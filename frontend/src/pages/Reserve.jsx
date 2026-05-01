import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { ChevronDown } from "lucide-react";

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
    <div className="p-4 sm:p-6 lg:p-8">
      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm font-medium mb-6">
          {error}
        </div>
      ) : null}

      <div className="max-w-xl mx-auto">
        <motion.form 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit} 
          className="bg-white rounded-lg border border-gray-200"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Assignment Configuration</h2>
            <p className="text-xs text-gray-400 mt-0.5">Select a locker and configure your booking</p>
          </div>
          <div className="p-6 space-y-5">
            {submitError ? (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm font-medium">
                {submitError}
              </div>
            ) : null}

            <div>
              <label htmlFor="locker" className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Resource
              </label>
              {loading ? (
                <div className="animate-pulse h-10 bg-gray-100 rounded-lg"></div>
              ) : (
                <div className="relative">
                  <select
                    id="locker"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none pr-10"
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
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              )}
              {paramId && fromParam && fromParam.status !== "Available" ? (
                <p className="mt-2 text-xs font-medium text-red-500">
                  Resource {paramId} is unavailable.
                </p>
              ) : null}
            </div>

            {selected ? (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex justify-between items-center">
                <span className="font-semibold text-orange-800 text-sm">{selected.id}</span>
                <span className="text-xs font-medium text-orange-600">{selected.location}</span>
              </div>
            ) : null}

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1.5">
                Duration
              </label>
              <div className="relative">
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none pr-10"
                >
                  {durations.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-1.5">
                <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                  Reference Note
                </label>
                <span className="text-xs text-gray-400">{note.length}/500</span>
              </div>
              <textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                placeholder="Optional notes for this assignment..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none placeholder:text-gray-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-gray-100">
              <Link to="/lockers" className="flex-1 text-center px-5 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || loading || !selected || selected.status !== "Available"}
                className="flex-1 bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                {submitting ? "Processing..." : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default Reserve;
