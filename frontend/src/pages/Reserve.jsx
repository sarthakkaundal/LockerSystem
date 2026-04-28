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
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Resource Assignment</h1>
      </div>

      {error ? (
        <div className="alert alert-error" style={{ margin: "16px" }}>
          {error}
        </div>
      ) : null}

      <div style={{ padding: "16px" }}>
        <form onSubmit={handleSubmit} className="panel" style={{ maxWidth: "600px", borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
          <div className="panel-header">Assignment Configuration</div>
          <div className="panel-body">
            {submitError ? (
              <div className="alert alert-error">
                {submitError}
              </div>
            ) : null}

            <div className="form-group">
              <label htmlFor="locker" className="form-label">
                Select Resource
              </label>
              {loading ? (
                <div className="skeleton skeleton-row"></div>
              ) : (
                <select
                  id="locker"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="form-input"
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
              )}
              {paramId && fromParam && fromParam.status !== "Available" ? (
                <p className="mt-2" style={{ fontSize: '11px', color: 'var(--error-text)', fontWeight: 500 }}>
                  Resource {paramId} is unavailable.
                </p>
              ) : null}
            </div>

            {selected ? (
              <div style={{ backgroundColor: "var(--bg-app)", border: "1px solid var(--border-color)", padding: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "600" }}>{selected.id}</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{selected.location}</span>
              </div>
            ) : null}

            <div className="form-group">
              <label htmlFor="duration" className="form-label">
                Duration
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="form-input"
              >
                {durations.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <div className="flex justify-between items-end mb-2">
                <label htmlFor="note" className="form-label" style={{ marginBottom: 0 }}>
                    Reference Note
                </label>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{note.length}/500</span>
              </div>
              <textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                className="form-input"
              />
            </div>

            <div className="flex gap-2 justify-between" style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px", marginTop: "16px" }}>
              <Link to="/lockers" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || loading || !selected || selected.status !== "Available"}
                className="btn btn-primary"
              >
                {submitting ? "Processing..." : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Reserve;
