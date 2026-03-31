import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
      navigate("/my-locker");
    } catch (err) {
      setSubmitError(err.message || "Reservation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative w-full max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          Reserve a Locker
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Select access rules. Get your OTP payload instantly.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>

        {submitError ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 relative z-10">
            {submitError}
          </div>
        ) : null}

        <div className="relative z-10">
          <label htmlFor="locker" className="mb-2 block text-sm font-semibold text-slate-300 uppercase tracking-widest">
            Select Unit
          </label>
          {loading ? (
            <div className="h-12 w-full animate-pulse rounded-xl bg-slate-800"></div>
          ) : (
            <select
              id="locker"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
            >
              {available.length === 0 ? (
                <option value="">No lockers available</option>
              ) : (
                available.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.id} — {l.location}
                  </option>
                ))
              )}
            </select>
          )}
          {paramId && fromParam && fromParam.status !== "Available" ? (
            <p className="mt-2 text-xs font-medium text-rose-400">
              Locker {paramId} is not available. Pick another unit below.
            </p>
          ) : null}
        </div>

        {selected ? (
          <div className="relative z-10 rounded-2xl bg-white/5 p-5 border border-white/5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Summary</p>
            <div className="flex justify-between items-center">
                <p className="text-2xl font-black text-white">{selected.id}</p>
                <div className="text-right">
                    <p className="text-sm font-medium text-indigo-300">{selected.location}</p>
                </div>
            </div>
          </div>
        ) : null}

        <div className="relative z-10">
          <label htmlFor="duration" className="mb-2 block text-sm font-semibold text-slate-300 uppercase tracking-widest">
            Duration
          </label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
          >
            {durations.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-end mb-2">
            <label htmlFor="note" className="block text-sm font-semibold text-slate-300 uppercase tracking-widest">
                Context Reference
            </label>
            <span className="text-xs text-slate-500 font-medium">{note.length}/500</span>
          </div>
          <textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            placeholder="e.g. short term gym storage"
            className="w-full resize-y rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
          />
        </div>

        <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/lockers"
            className="inline-flex justify-center rounded-xl border border-white/10 px-6 py-3 text-sm font-bold text-slate-300 transition-all hover:bg-white/5 hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={
              submitting ||
              loading ||
              !selected ||
              selected.status !== "Available"
            }
            className="inline-flex justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting ? "Processing…" : "Confirm Booking"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Reserve;
