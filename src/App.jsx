import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AttendeeDashboard from "./pages/AttendeeDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import OrganizerCreateEvent from "./pages/CreateEvent";
import MyEvents from "./pages/MyEvents";
import EditEvent from "./pages/EditEvent";
import RegisteredAttendees from "./pages/RegisteredAttendees ";
import BrowseEvents from "./pages/BrowseEvents";
import EventCommittee from "./pages/EventCommittee";
import CommitteeEvents from "./pages/CommitteeEvents";

import EventCalendar from "./pages/EventCalendar";
import EventTasks from "./pages/EventTasks";
import CreateTask from "./pages/CreateTask";
import EventResources from "./pages/EventResources";
import ResourceBookings from "./pages/ResourceBookings";
import Report from "./pages/Report";
import OrganizerProfile from "./pages/OrganizerProfile";
import UserManagement from "./pages/UserManagement";
import EventChat from "./pages/EventChat";
/* ================================
   EVENT TASKS WRAPPER
================================ */

function EventTasksWrapper() {
    const { eventId } = useParams();

    return (
        <EventTasks
            eventId={eventId}
        />
    );
}


/* ================================
   CREATE TASK WRAPPER
================================ */

function CreateTaskWrapper() {
    const { eventId } = useParams();

    return (
        <CreateTask
            eventId={eventId}
        />
    );
}


/* ================================
   EVENT RESOURCES WRAPPER
================================ */

function EventResourcesWrapper() {
    const { eventId } = useParams();

    return (
        <EventResources
            eventId={eventId}
        />
    );
}


/* ================================
   RESOURCE BOOKINGS WRAPPER
================================ */

function ResourceBookingsWrapper() {
    const { eventId } = useParams();

    return (
        <ResourceBookings
            eventId={eventId}
        />
    );
}


/* ================================
   MAIN APP
================================ */

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* =========================
                    AUTHENTICATION
                ========================= */}

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />


                {/* =========================
                    DASHBOARDS
                ========================= */}

                <Route
                    path="/attendee-dashboard"
                    element={<AttendeeDashboard />}
                />

                <Route
                    path="/organizer-dashboard"
                    element={<OrganizerDashboard />}
                />


                {/* =========================
                    EVENTS
                ========================= */}

                <Route
                    path="/my-events"
                    element={<MyEvents />}
                />

                <Route
                    path="/edit-event/:id"
                    element={<EditEvent />}
                />

                <Route
                    path="/organizer-createEvent"
                    element={<OrganizerCreateEvent />}
                />

                <Route
                    path="/events"
                    element={<BrowseEvents />}
                />


                {/* =========================
                    REGISTERED ATTENDEES
                ========================= */}

                <Route
                    path="/registered-attendees/:eventId"
                    element={<RegisteredAttendees />}
                />


                {/* =========================
                    EVENT COMMITTEE
                ========================= */}

                <Route
                    path="/event-committee/:eventId"
                    element={<EventCommittee />}
                />

                <Route
                    path="/committee-events"
                    element={<CommitteeEvents />}
                />


                {/* =========================
                    EVENT CALENDAR
                ========================= */}

                <Route
                    path="/calendar"
                    element={<EventCalendar />}
                />


                {/* =========================
                    EVENT TASKS
                ========================= */}

                <Route
                    path="/events/:eventId/tasks"
                    element={<EventTasksWrapper />}
                />


                {/* =========================
                    CREATE TASK
                ========================= */}

                <Route
                    path="/events/:eventId/tasks/create"
                    element={<CreateTaskWrapper />}
                />


                {/* =========================
                    EVENT RESOURCES
                ========================= */}

                <Route
                    path="/events/:eventId/resources"
                    element={<EventResourcesWrapper />}
                />


                {/* =========================
                    RESOURCE BOOKINGS
                ========================= */}

                <Route
                    path="/events/:eventId/bookings"
                    element={<ResourceBookingsWrapper />}
                />
                <Route
                    path="/reports"
                    element={<Report />}
                />
<Route
    path="/organizer/profile"
    element={
        <OrganizerProfile />
    }
/>
<Route
    path="/user-management"
    element={
        <UserManagement />
    }
/>
<Route
    path="/events/:eventId/chat"
    element={<EventChat />}
/>

            </Routes>

        </BrowserRouter>
    );
}

export default App;