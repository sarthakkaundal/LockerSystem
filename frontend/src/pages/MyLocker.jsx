import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

function remainingParts(endsAtIso, nowMs) {
  const end = new Date(endsAtIso).getTime();
  const ms = Math.max(0, end - nowMs);
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { h, m, s, expired: ms <= 0 };
}

export default function MyLocker() {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const active = await api("/api/bookings/active");
      setBooking(active.booking);
    } catch (e) {
      setError(e.message || "Could not load booking.");
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!booking) return undefined;
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [booking]);

  const handleRelease = async () => {
    if (!booking || !window.confirm("Release this locker now?")) return;
    setActionError("");
    setBusy(true);
    try {
      await api(`/api/bookings/${booking.id}/release`, { method: "POST" });
      await load();
    } catch (e) {
      setActionError(e.message || "Release failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleExtend = async () => {
    if (!booking) return;
    setActionError("");
    setBusy(true);
    try {
      const data = await api(`/api/bookings/${booking.id}/extend`, {
        method: "POST",
        body: { hours: 1 },
      });
      setBooking(data.booking);
    } catch (e) {
      setActionError(e.message || "Could not extend.");
    } finally {
      setBusy(false);
    }
  };

  const rem = booking
    ? remainingParts(booking.endsAt, nowTick)
    : { h: 0, m: 0, s: 0, expired: true };

  return (
    <div className="page-container">
      <div className="page-header" style={{ justifyContent: "flex-start", gap: "16px" }}>
         <h1 className="page-title">Active Assignment</h1>
         {booking && !loading && <span className="status-badge status-available">Active</span>}
      </div>

      {error && <div className="alert alert-error" style={{ margin: "16px" }}>{error}</div>}
      {actionError && <div className="alert alert-error" style={{ margin: "16px" }}>{actionError}</div>}

      <div style={{ padding: "16px", display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start" }}>
        {loading ? (
          <div className="skeleton skeleton-row" style={{ flex: 1, minWidth: "300px" }}></div>
        ) : !booking ? (
          <div className="empty-state" style={{ flex: 1 }}>
            <p className="empty-state-desc">No active assignments found.</p>
            <Link to="/reserve" className="btn btn-primary mt-3">Find Resource</Link>
          </div>
        ) : (
          <>
            <div className="panel" style={{ flex: 2, minWidth: "300px", borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
              <div className="panel-header">Session Details</div>
              <div className="panel-body">
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", marginBottom: "16px" }}>
                  <div>
                     <p className="form-label">Resource ID</p>
                     <h2 style={{ fontSize: "20px", fontWeight: "600" }}>{booking.lockerCode}</h2>
                  </div>
                  <div style={{ textAlign: "right" }}>
                     <p className="form-label">Time Remaining</p>
                     <h2 style={{ fontSize: "24px", color: rem.expired ? "var(--error-text)" : "var(--text-main)", fontFamily: "monospace", letterSpacing: "1px" }}>
                       {rem.h.toString().padStart(2, "0")}:{rem.m.toString().padStart(2, "0")}:{rem.s.toString().padStart(2, "0")}
                     </h2>
                  </div>
                </div>
                <div style={{ marginBottom: "24px" }}>
                   <p className="form-label">One-Time Passcode</p>
                   <div style={{ backgroundColor: "var(--bg-app)", padding: "12px", border: "1px solid var(--border-color)", fontFamily: "monospace", fontSize: "18px", letterSpacing: "4px" }}>
                      {booking.otpCode}
                   </div>
                </div>
                <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid var(--border-color)" }}>
                  <button className="btn btn-secondary flex-1" onClick={handleExtend} disabled={busy}>Extend +1hr</button>
                  <button className="btn btn-primary flex-1" onClick={handleRelease} disabled={busy} style={{ backgroundColor: "var(--error-color)", borderColor: "var(--error-color)" }}>Release</button>
                </div>
              </div>
            </div>
            
            <div className="panel" style={{ flex: 1, minWidth: "250px", borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
              <div className="panel-header">Access Token (QR)</div>
              <div className="panel-body text-center" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                 <div style={{ border: "1px solid var(--border-color)", padding: "8px", backgroundColor: "#fff", display: "inline-block", marginBottom: "16px" }}>
                    <QRCodeSVG value={booking.qrPayload || "mock-qr"} size={160} level="M" />
                 </div>
                 <p className="form-label">Scan at terminal to unlock</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
