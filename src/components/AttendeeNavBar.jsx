import { Link, useNavigate } from "react-router-dom";

function AttendeeNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/attendee-dashboard"
            className="text-2xl font-bold text-indigo-600"
          >
            EVENTORA
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">

            <Link
              to="/attendee-dashboard"
              className="text-slate-600 hover:text-indigo-600 font-medium"
            >
              Home
            </Link>

            <Link
              to="/events"
              className="text-slate-600 hover:text-indigo-600 font-medium"
            >
              Browse Events
            </Link>

            <Link
              to="/my-events"
              className="text-slate-600 hover:text-indigo-600 font-medium"
            >
              My Events
            </Link>

            <Link
              to="/my-tickets"
              className="text-slate-600 hover:text-indigo-600 font-medium"
            >
              My Tickets
            </Link>

            <Link
              to="/calendar"
              className="text-slate-600 hover:text-indigo-600 font-medium"
            >
              Calendar
            </Link>

            {/* Profile */}
            <Link
              to="/profile"
              className="text-slate-600 hover:text-indigo-600 font-medium"
            >
              Profile
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg
                         hover:bg-indigo-700 transition"
            >
              Logout
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
}

export default AttendeeNavbar;