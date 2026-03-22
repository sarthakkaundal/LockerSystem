const stats = [
  { title: "Total Lockers", value: "120" },
  { title: "Available Now", value: "76" },
  { title: "Occupied", value: "34" },
  { title: "Under Maintenance", value: "10" },
];

const recentActivity = [
  { id: 1, locker: "L-102", location: "Library Block", status: "Booked" },
  { id: 2, locker: "L-087", location: "CSE Block", status: "Released" },
  { id: 3, locker: "L-054", location: "Admin Block", status: "Occupied" },
];

function Dashboard() {
  return (
    <section className="px-6 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Monitor locker availability, usage, and quick actions.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
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
                Quick Reserve
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Reserve a locker instantly near your academic block.
              </p>
            </div>

            <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600">
              Reserve Now
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Nearest Block</p>
              <h4 className="mt-2 text-lg font-semibold text-slate-900">
                Library Block
              </h4>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Available Lockers</p>
              <h4 className="mt-2 text-lg font-semibold text-slate-900">18</h4>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Peak Usage</p>
              <h4 className="mt-2 text-lg font-semibold text-slate-900">
                1 PM - 3 PM
              </h4>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-xl font-semibold text-slate-900">Active Booking</h3>
          <p className="mt-1 text-sm text-slate-500">
            Current locker assigned to the student.
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Locker ID</p>
            <h4 className="mt-2 text-2xl font-bold text-slate-900">L-102</h4>

            <p className="mt-4 text-sm text-slate-500">Location</p>
            <p className="mt-1 font-medium text-slate-800">Library Block</p>

            <p className="mt-4 text-sm text-slate-500">Time Remaining</p>
            <p className="mt-1 font-medium text-slate-800">01h 24m</p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-xl font-semibold text-slate-900">Recent Activity</h3>
        <p className="mt-1 text-sm text-slate-500">
          Latest locker actions across the campus.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-sm text-slate-500">
                <th className="pb-2 font-medium">Locker</th>
                <th className="pb-2 font-medium">Location</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((item) => (
                <tr key={item.id} className="rounded-xl bg-slate-50">
                  <td className="rounded-l-xl px-4 py-3 font-medium text-slate-900">
                    {item.locker}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.location}</td>
                  <td className="rounded-r-xl px-4 py-3">
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;