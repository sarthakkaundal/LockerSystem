import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

const getStatusClasses = (status) => {
  switch (status) {
    case "Available":
      return "bg-emerald-100 text-emerald-700";
    case "Occupied":
      return "bg-amber-100 text-amber-700";
    case "Maintenance":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
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
    <section className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Lockers</h1>
        <p className="mt-2 text-sm text-slate-600">
          Live availability from the server. Reserve when a unit shows Available.
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

      <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Locker Stations</h2>
          <p className="mt-1 text-sm text-slate-500">
            Filter by location and status.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-sky-500"
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
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-sky-500"
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
        <p className="text-sm text-slate-500">Loading lockers…</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {lockers.map((locker) => (
            <div
              key={locker.id}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-slate-500">Locker ID</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">
                    {locker.id}
                  </h3>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    locker.status
                  )}`}
                >
                  {locker.status}
                </span>
              </div>

              <div className="mt-5">
                <p className="text-sm text-slate-500">Location</p>
                <p className="mt-1 font-medium text-slate-800">{locker.location}</p>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  disabled={locker.status !== "Available"}
                  onClick={() =>
                    locker.status === "Available" &&
                    navigate(`/reserve?locker=${encodeURIComponent(locker.id)}`)
                  }
                  className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    locker.status === "Available"
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "cursor-not-allowed bg-slate-200 text-slate-500"
                  }`}
                >
                  {locker.status === "Available" ? "Reserve Locker" : "Unavailable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && lockers.length === 0 && !error ? (
        <p className="text-sm text-slate-500">No lockers match these filters.</p>
      ) : null}
    </section>
  );
}

export default Lockers;
