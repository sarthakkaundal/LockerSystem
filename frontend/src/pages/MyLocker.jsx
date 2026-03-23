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
    <section className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Locker</h1>
        <p className="mt-2 text-sm text-slate-600">
          OTP and QR update when you extend; timer counts down from the server end time.
        </p>
      </div>

      {error ? (
        <div
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {actionError ? (
        <div
          className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          role="alert"
        >
          {actionError}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : !booking ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-slate-700">You do not have an active locker.</p>
          <Link
            to="/reserve"
            className="mt-4 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Reserve a locker
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Active Locker</p>
                <h2 className="mt-1 text-3xl font-bold text-slate-900">
                  {booking.lockerCode}
                </h2>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  rem.expired
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {rem.expired ? "Time ended — release or extend" : "Active"}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Location</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {booking.location}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Start</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {formatClock(booking.startsAt)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Ends</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {formatClock(booking.endsAt)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Time remaining</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {rem.expired
                    ? "0m"
                    : `${rem.h > 0 ? `${rem.h}h ` : ""}${rem.m}m`}
                </p>
              </div>
            </div>

            {booking.note ? (
              <p className="mt-4 text-sm text-slate-600">
                <span className="font-medium text-slate-800">Your note:</span>{" "}
                {booking.note}
              </p>
            ) : null}

            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Access QR</p>
              <p className="mt-1 text-xs text-slate-400">
                Payload is scoped to this booking (demo verification flow).
              </p>
              <div className="mt-4 flex justify-center rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <QRCodeSVG value={booking.qrPayload} size={180} level="M" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm text-slate-500">One-Time Password</p>
              <h3 className="mt-3 text-4xl font-bold tracking-[0.3em] text-slate-900">
                {booking.otpCode}
              </h3>
              <p className="mt-3 text-sm text-slate-500">
                Use this OTP on the locker keypad. A new code is issued when you
                extend.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Locker Actions</h3>
              <p className="mt-1 text-sm text-slate-500">
                Extend up to 8 hours total from your original start time.
              </p>

              <div className="mt-5 space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Extend by
                  <select
                    value={extendHours}
                    onChange={(e) => setExtendHours(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-sky-500"
                  >
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                  </select>
                </label>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleExtend}
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {busy ? "Working…" : "Extend booking"}
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={handleRelease}
                  className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                >
                  Release locker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && history.length > 0 ? (
        <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-xl font-semibold text-slate-900">Booking history</h3>
          <p className="mt-1 text-sm text-slate-500">Your completed sessions.</p>
          <ul className="mt-4 divide-y divide-slate-100">
            {history.map((h) => (
              <li
                key={h.id}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{h.lockerCode}</p>
                  <p className="text-sm text-slate-500">{h.location}</p>
                </div>
                <p className="text-xs text-slate-500 sm:text-right">
                  {new Date(h.startedAt).toLocaleString()} →{" "}
                  {new Date(h.endedAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
