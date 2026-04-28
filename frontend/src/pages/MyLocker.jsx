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
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {actionError && <div className="alert alert-error">{actionError}</div>}

      {loading ? (
        <div className="skeleton skeleton-row" style={{ height: '400px' }}></div>
      ) : !booking ? (
        <div className="empty-state">
          <p className="empty-state-desc">You do not have an active session.</p>
          <Link to="/reserve" className="btn btn-primary mt-2">
            Find a Locker
          </Link>
        </div>
      ) : (
        <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-color)", padding: "32px", position: "relative" }}>
          
          <div className="flex justify-between items-start mb-6" style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "16px" }}>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: "600", marginBottom: "4px" }}>My Locker</h1>
              <span style={{ fontSize: "14px", fontWeight: "600", letterSpacing: "1px", color: "var(--text-main)" }}>STATUS: <u style={{ color: "var(--success-text)", textDecorationColor: "var(--success-text)" }}>ACTIVE</u></span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Locker ID:</span>
              <p style={{ fontSize: "24px", fontWeight: "600" }}>{booking.lockerCode}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div style={{ flex: 2 }}>
              <div style={{ border: "2px solid var(--border-color)", padding: "24px", textAlign: "center", marginBottom: "24px", backgroundColor: "var(--bg-app)", position: "relative" }}>
                <span className="hidden sm:inline" style={{ position: "absolute", top: "50%", left: "-60px", fontSize: "12px" }}>Focus here →</span>
                
                <h2 style={{ fontSize: "clamp(48px, 8vw, 84px)", fontWeight: "600", letterSpacing: "2px", lineHeight: "1", color: rem.expired ? "var(--error-text)" : "var(--text-main)", textShadow: "2px 2px 0 var(--border-color)" }}>
                   {rem.h.toString().padStart(2, "0")} : {rem.m.toString().padStart(2, "0")} : {rem.s.toString().padStart(2, "0")}
                </h2>
                <div className="flex justify-center gap-10 mt-2" style={{ color: "var(--text-muted)", fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px", fontWeight: 600 }}>
                  <span>Hours</span>
                  <span>Minutes</span>
                  <span>Seconds</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                 <div style={{ border: "2px solid var(--border-color)", padding: "12px 24px", fontSize: "28px", fontWeight: "600", letterSpacing: "4px", backgroundColor: "var(--bg-app)" }}>
                    OTP: [ {booking.otpCode?.split('').join(' ')} ]
                 </div>
                 <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "150px", lineHeight: "1.2" }}>Your single-use access code.</p>
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ border: "2px solid var(--border-color)", padding: "16px", backgroundColor: "#fff", marginBottom: "16px", display: "inline-flex" }}>
                 <QRCodeSVG value={booking.qrPayload || "mock-qr"} size={180} level="M" />
              </div>
              <div style={{ textAlign: "center" }}>
                 <p style={{ fontWeight: "600", letterSpacing: "1px", marginBottom: "4px" }}>[ QR CODE ]</p>
                 <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Scan to open locker.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 mt-8">
             <div style={{ flex: 1 }}>
               <button
                  type="button"
                  disabled={busy}
                  onClick={handleExtend}
                  style={{
                    width: "100%",
                    padding: "16px",
                    border: "2px solid var(--text-main)",
                    backgroundColor: "transparent",
                    color: "var(--text-main)",
                    fontSize: "18px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    cursor: busy ? "not-allowed" : "pointer"
                  }}
               >
                 [ EXTEND TIME ] ⊕
               </button>
               <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--text-muted)", textAlign: "center" }}>Add 1 hour</p>
             </div>

             <div style={{ flex: 1 }}>
               <button
                  type="button"
                  disabled={busy}
                  onClick={handleRelease}
                  style={{
                    width: "100%",
                    padding: "16px",
                    border: "2px solid var(--border-color)",
                    backgroundColor: "var(--bg-surface-hover)",
                    color: "var(--text-main)",
                    fontSize: "18px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    cursor: busy ? "not-allowed" : "pointer"
                  }}
               >
                 [ RELEASE LOCKER ] ⊗
               </button>
               <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--text-muted)", textAlign: "center" }}>End reservation.</p>
             </div>
          </div>

        </div>
      )}
    </div>
  );
}
