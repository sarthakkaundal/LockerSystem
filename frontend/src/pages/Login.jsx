function Login() {
    return (
        <section className="flex min-h-[calc(100vh-72px)] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Smart Campus Locker
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Access your locker dashboard securely.
        </p>

        <form className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              University Email
            </label>
            <input
              type="email"
              placeholder="student@university.edu"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Access Locker System
          </button>
        </form>
      </div>
    </section>
    )
}

export default Login;