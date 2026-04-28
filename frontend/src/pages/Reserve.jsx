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
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header center">
        <h1 className="page-title">Reserve a Locker</h1>
        <p className="page-subtitle">
          Select access rules. Get your OTP payload instantly.
        </p>
      </div>

      {error ? (
        <div className="alert alert-error">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="card">
        {submitError ? (
          <div className="alert alert-error">
            {submitError}
          </div>
        ) : null}

        <div className="form-group mb-3">
          <label htmlFor="locker" className="form-label card-label">
            Select Unit
          </label>
          {loading ? (
            <div className="skeleton skeleton-row"></div>
          ) : (
            <select
              id="locker"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="form-input"
              style={{ fontWeight: 600 }}
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
            <p className="mt-2" style={{ fontSize: '12px', color: 'var(--error-text)', fontWeight: 500 }}>
              Locker {paramId} is not available. Pick another unit below.
            </p>
          ) : null}
        </div>

        {selected ? (
          <div className="card mb-3" style={{ padding: '16px', backgroundColor: 'var(--bg-app)' }}>
            <p className="card-label">Summary</p>
            <div className="flex justify-between items-center">
                <p className="card-value" style={{ fontSize: '20px' }}>{selected.id}</p>
                <div className="text-right">
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--primary-text)' }}>{selected.location}</p>
                </div>
            </div>
          </div>
        ) : null}

        <div className="form-group mb-3">
          <label htmlFor="duration" className="form-label card-label">
            Duration
          </label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="form-input"
            style={{ fontWeight: 600 }}
          >
            {durations.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group mb-4">
          <div className="flex justify-between items-end mb-1">
            <label htmlFor="note" className="form-label card-label" style={{ marginBottom: 0 }}>
                Context Reference
            </label>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{note.length}/500</span>
          </div>
          <textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            placeholder="e.g. short term gym storage"
            className="form-input"
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="flex gap-2 justify-between" style={{ justifyContent: 'flex-end', marginTop: '32px' }}>
          <Link to="/lockers" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || loading || !selected || selected.status !== "Available"}
            className="btn btn-primary"
          >
            {submitting ? "Processing…" : "Confirm Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Reserve;
