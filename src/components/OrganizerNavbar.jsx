import { Link, useNavigate } from "react-router-dom";

function OrganizerNavbar() {
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
            to="/organizer-dashboard"
            className="text-2xl font-bold text-indigo-600"
          >
            EVENTORA
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">

            <Link
              to="/organizer-dashboard"
              className="text-slate-600 hover:text-indigo-600 font-medium"
            >
              Dashboard
            </Link>

            <Link
              to="/my-events"
              className="text-slate-600 hover:text-indigo-600 font-medium"
            >
              My Events
            </Link>

            <Link
              to="/organizer-createEvent"
              className="text-slate-600 hover:text-indigo-600 font-medium"
            >
              Create Event
            </Link>

            

            <Link
              to="/committee-events"
              className="text-slate-600 hover:text-indigo-600 font-medium"
            >
              Committee Mem.
            </Link>

            <Link
              to="/calendar"
              className="text-slate-600 hover:text-indigo-600 font-medium"
            >
              Calendar
            </Link>

            <Link
              to="/reports"
              className="text-slate-600 hover:text-indigo-600 font-medium"
            >
              Reports
            </Link>

            {/* Profile */}
            <Link
              to="/organizer/profile"
              className="text-slate-600 hover:text-indigo-600 font-medium"
            >
              Profile
            </Link>

            {/* User Management */}
            <Link
              to="/user-management"
              className="text-slate-600 hover:text-indigo-600 font-medium"
            >
              User Management
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

export default OrganizerNavbar;