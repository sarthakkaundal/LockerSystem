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
    <div className="p-6 bg-slate-50 min-h-full flex flex-col items-center">
      <div className="w-full max-w-4xl mb-6 flex justify-end items-center">
         {booking && !loading && (
           <span className="bg-emerald-100 text-emerald-800 text-sm font-medium px-3 py-1 rounded-full">
             Active
           </span>
         )}
      </div>

      <div className="w-full max-w-4xl">
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 shadow-sm border border-red-100">{error}</div>}
        {actionError && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 shadow-sm border border-red-100">{actionError}</div>}

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 w-full max-w-md mx-auto animate-pulse flex flex-col items-center">
            <div className="w-32 h-32 bg-slate-200 rounded-lg mb-6"></div>
            <div className="w-48 h-8 bg-slate-200 rounded mb-4"></div>
            <div className="w-64 h-4 bg-slate-200 rounded"></div>
          </div>
        ) : !booking ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center max-w-2xl mx-auto mt-10 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Assignment</h3>
            <p className="text-slate-500 mb-6">You don't have any locker assigned to you right now.</p>
            <Link to="/reserve" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium inline-block shadow-sm hover:shadow-md">
              Find a Resource
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 justify-center">
            {/* Main Timer and Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 flex-1 max-w-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="border-b border-slate-100 pb-6 mb-6">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Time Remaining</p>
                <div className={`text-4xl sm:text-5xl font-bold font-mono tracking-tight ${rem.expired ? "text-red-500" : "text-slate-900"}`}>
                  {rem.h.toString().padStart(2, "0")}:{rem.m.toString().padStart(2, "0")}:{rem.s.toString().padStart(2, "0")}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Resource ID</p>
                  <p className="text-2xl font-bold text-slate-800">{booking.lockerCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">One-Time Passcode</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-4 inline-block">
                    <p className="text-2xl font-mono tracking-[0.2em] font-semibold text-slate-800">{booking.otpCode}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                <button 
                  className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-all duration-200 font-medium flex-1 shadow-sm hover:shadow-md" 
                  onClick={handleExtend} 
                  disabled={busy}
                >
                  Extend +1hr
                </button>
                <button 
                  className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-lg hover:bg-red-100 transition-all duration-200 font-medium flex-1 shadow-sm hover:shadow-md" 
                  onClick={handleRelease} 
                  disabled={busy}
                >
                  Release Locker
                </button>
              </div>
            </div>
            
            {/* QR Code Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 w-full lg:w-80 flex flex-col items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 inline-block">
                <QRCodeSVG value={booking.qrPayload || "mock-qr"} size={180} level="M" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Access Token</h3>
              <p className="text-sm text-slate-500 text-center">Scan this QR code at the terminal scanner to unlock your resource.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
