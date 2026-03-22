function MyLocker() {
  return (
    <section className="px-6 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Locker</h1>
        <p className="mt-2 text-sm text-slate-600">
          View your current locker booking, access code, and release options.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Locker</p>
              <h2 className="mt-1 text-3xl font-bold text-slate-900">L-102</h2>
            </div>

            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Active
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Location</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                Library Block
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Booked Duration</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                2 Hours
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Start Time</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                11:30 AM
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Time Remaining</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                01h 24m
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Access QR</p>
            <div className="mt-4 flex h-48 items-center justify-center rounded-xl bg-white text-sm font-medium text-slate-400 ring-1 ring-slate-200">
              QR Code Placeholder
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">One-Time Password</p>
            <h3 className="mt-3 text-4xl font-bold tracking-[0.3em] text-slate-900">
              4821
            </h3>
            <p className="mt-3 text-sm text-slate-500">
              Use this OTP on the locker keypad to unlock your assigned unit.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              Locker Actions
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Manage your active booking from here.
            </p>

            <div className="mt-5 space-y-3">
              <button className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Extend Booking
              </button>

              <button className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
                Release Locker
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MyLocker;