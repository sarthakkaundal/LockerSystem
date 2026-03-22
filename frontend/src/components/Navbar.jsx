import {Link} from 'react-router-dom';

function Navbar() {
    return (
        <nav className="flex items-center justify-between bg-slate-900 px-8 py-4 text-white shadow-md">
      <h2 className="text-xl font-bold tracking-wide">LockerSystem</h2>

      <div className="flex gap-5 text-sm font-medium">
        <Link className="transition hover:text-sky-400" to="/">
          Login
        </Link>
        <Link className="transition hover:text-sky-400" to="/dashboard">
          Dashboard
        </Link>
        <Link className="transition hover:text-sky-400" to="/lockers">
          Lockers
        </Link>
        <Link className="transition hover:text-sky-400" to="/my-locker">
          My Locker
        </Link>
        <Link className="transition hover:text-sky-400" to="/admin">
          Admin
        </Link>
      </div>
    </nav>
    );
}

export default Navbar
