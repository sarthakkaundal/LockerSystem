import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

function formatClock(iso) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function remainingParts(endsAtIso, nowMs) {
  const end = new Date(endsAtIso).getTime();
  const ms = Math.max(0, end - nowMs);
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return { h, m, expired: ms <= 0 };
}

export default function MyLocker() {
  const [booking, setBooking] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [extendHours, setExtendHours] = useState("1");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const [active, hist] = await Promise.all([
        api("/api/bookings/active"),
        api("/api/bookings/history"),
      ]);
      setBooking(active.booking);
      setHistory(hist.history ?? []);
    } catch (e) {
      setError(e.message || "Could not load booking.");
      setBooking(null);
      setHistory([]);
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
        body: { hours: Number(extendHours) },
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
    : { h: 0, m: 0, expired: true };

  return (
    <section className="relative w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          My Locker
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Access payload ready. Scan to pair instantly.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      ) : null}

      {actionError ? (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {actionError}
        </div>
      ) : null}

      {loading ? (
        <div className="h-48 w-full animate-pulse rounded-3xl bg-slate-800/50"></div>
      ) : !booking ? (
        <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-12 text-center backdrop-blur-md shadow-2xl">
          <p className="text-slate-400 mb-6 text-lg font-medium">You do not have an active session.</p>
          <Link
            to="/reserve"
            className="inline-flex rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
          >
            Find a Locker
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl xl:col-span-2 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>

            <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Active Locker</p>
                <h2 className="mt-1 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                  {booking.lockerCode}
                </h2>
              </div>

              <span
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
                  rem.expired
                    ? "border-amber-500/30 bg-amber-500/20 text-amber-400"
                    : "border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                }`}
              >
                <span className={`block h-2 w-2 rounded-full ${rem.expired ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span>
                {rem.expired ? "Expired" : "Live"}
              </span>
            </div>

            <div className="relative z-10 mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Location</p>
                <p className="mt-1 text-base font-bold text-white truncate">
                  {booking.location}
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Start Time</p>
                <p className="mt-1 text-base font-bold text-white">
                  {formatClock(booking.startsAt)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">End Time</p>
                <p className="mt-1 text-base font-bold text-white">
                  {formatClock(booking.endsAt)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-indigo-500/10 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">Remaining</p>
                <p className="mt-1 text-lg font-black text-indigo-300">
                  {rem.expired
                    ? "0m"
                    : `${rem.h > 0 ? `${rem.h}h ` : ""}${rem.m}m`}
                </p>
              </div>
            </div>

            {booking.note ? (
              <div className="relative z-10 mt-6 rounded-2xl border border-slate-700/50 bg-slate-800/20 p-4">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 uppercase tracking-widest mr-2">Context:</span>
                  {booking.note}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/40 to-slate-900/60 p-6 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Access OTP</p>
                <h3 className="mt-2 text-6xl font-black tracking-[0.2em] text-white tabular-nums drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    {booking.otpCode}
                </h3>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Time Extension</h3>

              <div className="flex gap-2">
                <select
                    value={extendHours}
                    onChange={(e) => setExtendHours(e.target.value)}
                    className="w-1/2 rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-sm font-medium text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="1">+1 hour</option>
                    <option value="2">+2 hours</option>
                    <option value="4">+4 hours</option>
                </select>
                <button
                    type="button"
                    disabled={busy}
                    onClick={handleExtend}
                    className="w-1/2 rounded-xl bg-white/10 font-bold text-white hover:bg-white/20 transition-colors disabled:opacity-50 text-sm"
                >
                    {busy ? "Working…" : "Extend"}
                </button>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={handleRelease}
                className="mt-2 w-full rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm font-black text-rose-400 uppercase tracking-wider transition-colors hover:bg-rose-500/20 disabled:opacity-50"
              >
                End Session
              </button>
            </div>
          </div>
          
          <div className="xl:col-span-3 rounded-3xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl flex flex-col items-center border-dashed">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6">Quick Scanning Protocol</p>
            <div className="flex justify-center rounded-2xl bg-white p-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] ring-4 ring-indigo-500/20">
              <QRCodeSVG value={booking.qrPayload} size={200} level="H" />
            </div>
          </div>
        </div>
      )}

      {!loading && history.length > 0 ? (
        <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Session Archive</h3>
          <ul className="divide-y divide-white/5">
            {history.map((h) => (
              <li
                key={h.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-white/5 px-4 rounded-xl -mx-4"
              >
                <div>
                  <p className="font-black text-white text-lg">{h.lockerCode}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{h.location}</p>
                </div>
                <div className="flex flex-col sm:items-end">
                    <p className="text-xs font-medium text-slate-400">
                    <span className="text-indigo-400/50">From</span> {new Date(h.startedAt).toLocaleString()}
                    </p>
                    <p className="text-xs font-medium text-slate-400 mt-1">
                    <span className="text-indigo-400/50">To</span> {new Date(h.endedAt).toLocaleString()}
                    </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
