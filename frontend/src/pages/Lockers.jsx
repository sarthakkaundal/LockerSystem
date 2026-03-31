import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

const getStatusBadge = (status) => {
  switch (status) {
    case "Available":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "Occupied":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "Maintenance":
      return "bg-rose-500/20 text-rose-400 border-rose-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};

function Lockers() {
  const navigate = useNavigate();
  const [lockers, setLockers] = useState([]);
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allLocations, setAllLocations] = useState([]);

  useEffect(() => {
    api("/api/lockers")
      .then((d) => {
        const set = new Set((d.lockers ?? []).map((l) => l.location));
        setAllLocations([...set].sort());
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (locationFilter !== "all") params.set("location", locationFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const q = params.toString();
      const data = await api(`/api/lockers${q ? `?${q}` : ""}`);
      setLockers(data.lockers ?? []);
    } catch (e) {
      setError(e.message || "Could not load lockers. Is the API running?");
      setLockers([]);
    } finally {
      setLoading(false);
    }
  }, [locationFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="relative w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Locker Registry</h1>
        <p className="mt-2 text-sm text-slate-400">
          Global inventory. Filter and secure your spot instantly.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      ) : null}

      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Filters</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            aria-label="Filter by location"
          >
            <option value="all">All Locations</option>
            {allLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 rounded-3xl bg-slate-800/50 animate-pulse border border-white/5"></div>)}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lockers.map((locker) => (
            <div
              key={locker.id}
              className="flex flex-col justify-between rounded-3xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md shadow-lg transition-all hover:bg-slate-800/60 hover:-translate-y-1 hover:border-white/10"
            >
              <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Unit ID</p>
                      <h3 className="text-3xl font-black text-white mt-1">
                        {locker.id}
                      </h3>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center justify-center rounded-full border px-3 py-1 text-xs font-bold leading-none ${getStatusBadge(
                        locker.status
                      )}`}
                    >
                      {locker.status}
                    </span>
                  </div>

                  <div className="mt-6 mb-8">
                    <p className="text-xs text-slate-500 uppercase font-semibold">Location</p>
                    <p className="mt-1 font-medium text-slate-200">{locker.location}</p>
                  </div>
              </div>

              <button
                type="button"
                disabled={locker.status !== "Available"}
                onClick={() =>
                  locker.status === "Available" &&
                  navigate(`/reserve?locker=${encodeURIComponent(locker.id)}`)
                }
                className={`w-full rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  locker.status === "Available"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-[1.02] shadow-lg shadow-indigo-500/25"
                    : "cursor-not-allowed bg-slate-800 text-slate-500"
                }`}
              >
                {locker.status === "Available" ? "Reserve This Locker" : "Unavailable"}
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && lockers.length === 0 && !error ? (
        <div className="py-12 text-center text-slate-500">
          No lockers match these filters.
        </div>
      ) : null}
    </section>
  );
}

export default Lockers;
