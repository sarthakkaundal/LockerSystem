const lockerSummary = [
  { title: "Total Lockers", value: "120" },
  { title: "Occupied", value: "34" },
  { title: "Available", value: "76" },
  { title: "Maintenance", value: "10" },
];

const lockerLogs = [
  {
    id: 1,
    locker: "L-102",
    student: "12300561",
    location: "Library Block",
    status: "Occupied",
  },
  {
    id: 2,
    locker: "L-087",
    student: "12300412",
    location: "CSE Block",
    status: "Released",
  },
  {
    id: 3,
    locker: "L-054",
    student: "12300890",
    location: "Admin Block",
    status: "Maintenance",
  },
  {
    id: 4,
    locker: "L-201",
    student: "12300117",
    location: "Library Block",
    status: "Occupied",
  },
];

const getStatusClasses = (status) => {
  switch (status) {
    case "Occupied":
      return "bg-amber-100 text-amber-700";
    case "Released":
      return "bg-emerald-100 text-emerald-700";
    case "Maintenance":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

function Admin() {
  return (
    <section className="px-6 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
        <p className="mt-2 text-sm text-slate-600">
          Monitor locker allocation, usage logs, and maintenance status.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {lockerSummary.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <p className="text-sm font-medium text-slate-500">{item.title}</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Locker Logs
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Recent locker activity across campus stations.
              </p>
            </div>

            <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Export Logs
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="pb-2 font-medium">Locker</th>
                  <th className="pb-2 font-medium">Student ID</th>
                  <th className="pb-2 font-medium">Location</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {lockerLogs.map((item) => (
                  <tr key={item.id} className="bg-slate-50">
                    <td className="rounded-l-xl px-4 py-3 font-medium text-slate-900">
                      {item.locker}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.student}</td>
                    <td className="px-4 py-3 text-slate-700">{item.location}</td>
                    <td className="rounded-r-xl px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              Maintenance Control
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Mark lockers unavailable during inspection or repair.
            </p>

            <div className="mt-5 space-y-3">
              <input
                type="text"
                placeholder="Enter locker ID"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
              />

              <button className="w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">
                Mark as Maintenance
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              Manual Override
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Force release or inspect a locker manually.
            </p>

            <div className="mt-5 space-y-3">
              <button className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Force Release Locker
              </button>

              <button className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                View Inspection Queue
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Admin;