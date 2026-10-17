import AttendeeNavbar from "../components/AttendeeNavBar";

function AttendeeDashboard() {
  return (
    <div className="min-h-screen bg-slate-100">
      <AttendeeNavbar />

      <main className="p-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Welcome to Eventora
        </h1>

        <p className="mt-2 text-slate-500">
          Discover and manage your events.
        </p>
      </main>
    </div>
  );
}

export default AttendeeDashboard;