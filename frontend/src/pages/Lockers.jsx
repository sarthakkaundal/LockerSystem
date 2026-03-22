const lockers = [
  { id: "L-101", location: "Library Block", status: "Available" },
  { id: "L-102", location: "Library Block", status: "Occupied" },
  { id: "L-103", location: "Library Block", status: "Maintenance" },
  { id: "L-201", location: "CSE Block", status: "Available" },
  { id: "L-202", location: "CSE Block", status: "Occupied" },
  { id: "L-203", location: "CSE Block", status: "Available" },
  { id: "L-301", location: "Admin Block", status: "Available" },
  { id: "L-302", location: "Admin Block", status: "Occupied" },
];

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
  return (
    <section className="px-6 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Lockers</h1>
        <p className="mt-2 text-sm text-slate-600">
          View real-time locker availability and reserve an empty unit.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Locker Stations
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Filter lockers by location and check current status.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-sky-500">
            <option>All Locations</option>
            <option>Library Block</option>
            <option>CSE Block</option>
            <option>Admin Block</option>
          </select>

          <select className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-sky-500">
            <option>All Status</option>
            <option>Available</option>
            <option>Occupied</option>
            <option>Maintenance</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {lockers.map((locker) => (
          <div
            key={locker.id}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Locker ID</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                  {locker.id}
                </h3>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                  locker.status
                )}`}
              >
                {locker.status}
              </span>
            </div>

            <div className="mt-5">
              <p className="text-sm text-slate-500">Location</p>
              <p className="mt-1 font-medium text-slate-800">
                {locker.location}
              </p>
            </div>

            <div className="mt-6">
              <button
                disabled={locker.status !== "Available"}
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
    </section>
  );
}

export default Lockers;