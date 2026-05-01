import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { Lock, Clock, Plus, Trash2, QrCode } from "lucide-react";

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
    const id = setInterval(() => {
      setNowTick(Date.now());
      if (new Date(booking.endsAt).getTime() <= Date.now()) {
        load();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [booking, load]);

  const handleRelease = async () => {
    if (!booking) return;
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-gray-800">Release this locker now?</p>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              executeRelease();
            }}
            className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Release
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const executeRelease = async () => {
    setActionError("");
    setBusy(true);
    try {
      await api(`/api/bookings/${booking.id}/release`, { method: "POST" });
      await load();
      toast.success("Locker released");
    } catch (e) {
      toast.error(e.message || "Release failed.");
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
      toast.success("Extended by 1 hour");
    } catch (e) {
      toast.error(e.message || "Could not extend.");
    } finally {
      setBusy(false);
    }
  };

  const rem = booking
    ? remainingParts(booking.endsAt, nowTick)
    : { h: 0, m: 0, s: 0, expired: true };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 text-sm font-medium">{error}</div>}
        {actionError && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 text-sm font-medium">{actionError}</div>}

        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 w-full max-w-md mx-auto animate-pulse flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-100 rounded-lg mb-6"></div>
            <div className="w-48 h-8 bg-gray-100 rounded mb-4"></div>
            <div className="w-64 h-4 bg-gray-100 rounded"></div>
          </div>
        ) : !booking ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center bg-white rounded-lg border border-gray-200 py-16 px-8 text-center max-w-lg mx-auto mt-10"
          >
            <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Assignment</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">You don't have any locker assigned to you right now. Reserve one to get started.</p>
            <Link to="/reserve" className="bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
              Find a Locker
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Main Card */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 flex-1"
            >
              {/* Status badge */}
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded bg-orange-50 text-orange-700 border border-orange-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                  Active Assignment
                </span>
              </div>

              {/* Timer */}
              <div className="border-b border-gray-100 pb-6 mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Time Remaining</p>
                <div className={`text-4xl sm:text-5xl lg:text-6xl font-bold font-mono tracking-tight ${rem.expired ? "text-red-500" : "text-gray-900"}`}>
                  {rem.h.toString().padStart(2, "0")}:{rem.m.toString().padStart(2, "0")}:{rem.s.toString().padStart(2, "0")}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Resource ID</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{booking.lockerCode}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">One-Time Passcode</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 inline-block">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-mono tracking-[0.2em] font-bold text-gray-900">{booking.otpCode}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                <button 
                  className="flex-1 inline-flex justify-center items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50" 
                  onClick={handleExtend} 
                  disabled={busy}
                >
                  {busy ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> : <Plus className="w-4 h-4" />}
                  Extend +1hr
                </button>
                <button 
                  className="flex-1 inline-flex justify-center items-center gap-2 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50" 
                  onClick={handleRelease} 
                  disabled={busy}
                >
                  {busy ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div> : <Trash2 className="w-4 h-4" />}
                  Release Locker
                </button>
              </div>
            </motion.div>
            
            {/* QR Code Card */}
            <motion.div 
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 w-full lg:w-72 flex flex-col items-center justify-center"
            >
              <div className="bg-white p-3 rounded-lg border border-gray-200 mb-5 inline-block">
                <QRCodeSVG value={booking.qrPayload || "mock-qr"} size={160} level="M" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Access Token</h3>
              </div>
              <p className="text-xs text-gray-500 text-center leading-relaxed">Scan this QR code at the terminal to unlock your locker</p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
