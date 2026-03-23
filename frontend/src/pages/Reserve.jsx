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
    <section className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Reserve a locker
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Confirm duration; the server assigns an OTP and QR payload for access.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        {error ? (
          <div
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8"
        >
          {submitError ? (
            <div
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
              role="alert"
            >
              {submitError}
            </div>
          ) : null}

          <div>
            <label
              htmlFor="locker"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Locker
            </label>
            {loading ? (
              <p className="text-sm text-slate-500">Loading options…</p>
            ) : (
              <select
                id="locker"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-500"
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
              <p className="mt-2 text-sm text-amber-700">
                Locker {paramId} is not available. Pick another unit below.
              </p>
            ) : null}
          </div>

          {selected ? (
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Summary</p>
              <p className="mt-1 font-semibold text-slate-900">{selected.id}</p>
              <p className="text-sm text-slate-700">{selected.location}</p>
            </div>
          ) : null}

          <div>
            <label
              htmlFor="duration"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Duration
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-500"
            >
              {durations.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="note"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Note (optional)
            </label>
            <textarea
              id="note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              placeholder="e.g. storing laptop bag until 4 PM lab"
              className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-500"
            />
            <p className="mt-1 text-xs text-slate-400">{note.length}/500</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/lockers"
              className="rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to listings
            </Link>
            <button
              type="submit"
              disabled={
                submitting ||
                loading ||
                !selected ||
                selected.status !== "Available"
              }
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {submitting ? "Saving…" : "Confirm reservation"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Reserve;
