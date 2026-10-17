import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/OrganizerNavbar";

function MyEvents() {
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(null);

    const token = localStorage.getItem("token");

    // ==========================================
    // FETCH EVENTS WHEN PAGE LOADS
    // ==========================================

    useEffect(() => {
        fetchEvents();
    }, []);

    // ==========================================
    // FETCH ORGANIZER EVENTS
    // ==========================================

    const fetchEvents = async () => {

        if (!token) {

            setError(
                "You are not logged in."
            );

            setLoading(false);

            return;
        }

        try {

            const response = await fetch(
                "http://localhost:5000/api/events/my-events",
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const result =
                await response.json();

            if (!response.ok) {

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    localStorage.removeItem(
                        "token"
                    );

                    localStorage.removeItem(
                        "user"
                    );

                    navigate("/login");

                    return;
                }

                throw new Error(
                    result.message ||
                    "Failed to fetch events"
                );
            }

            setEvents(
                Array.isArray(result)
                    ? result
                    : []
            );

        } catch (error) {

            console.error(
                "Fetch events error:",
                error
            );

            setError(
                "Unable to load your events."
            );

        } finally {

            setLoading(false);

        }
    };

    // ==========================================
    // DELETE EVENT
    // ==========================================

    const handleDelete = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this event?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeleteLoading(id);

            const response =
                await fetch(
                    `http://localhost:5000/api/events/${id}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Failed to delete event"
                );
            }

            setEvents(
                (previousEvents) =>
                    previousEvents.filter(
                        (event) =>
                            event.id !== id
                    )
            );

        } catch (error) {

            console.error(
                "Delete event error:",
                error
            );

            alert(
                error.message ||
                "Failed to delete event"
            );

        } finally {

            setDeleteLoading(null);

        }
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(
            date
        ).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );
    };

    // ==========================================
    // FORMAT TIME
    // ==========================================

    const formatTime = (time) => {

        if (!time) {
            return "-";
        }

        const timeString =
            String(time);

        return new Date(
            `1970-01-01T${timeString}`
        ).toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit",
            }
        );
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-100 flex items-center justify-center">

                <div className="text-center">

                    <div className="text-2xl font-semibold text-indigo-600">
                        Loading your events...
                    </div>

                    <p className="text-slate-500 mt-2">
                        Please wait.
                    </p>

                </div>

            </div>

        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (

        <>

            <Navbar />

            <div className="min-h-screen bg-slate-100">

                <div className="max-w-7xl mx-auto px-6 py-10">

                    {/* ==========================================
                        HEADER
                    ========================================== */}

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                        <div>

                            <h1 className="text-3xl font-bold text-slate-800">
                                My Events
                            </h1>

                            <p className="text-slate-500 mt-2">
                                Manage the events you have created.
                            </p>

                        </div>


                        <Link
                            to="/organizer-createEvent"
                            className="inline-flex items-center justify-center bg-indigo-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                        >
                            + Create Event
                        </Link>

                    </div>


                    {/* ==========================================
                        ERROR
                    ========================================== */}

                    {error && (

                        <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-5 py-4 rounded-lg">

                            {error}

                        </div>

                    )}


                    {/* ==========================================
                        EMPTY EVENTS
                    ========================================== */}

                    {!error &&
                        events.length === 0 && (

                            <div className="bg-white rounded-2xl shadow-md p-12 text-center">

                                <div className="text-5xl mb-4">
                                    📅
                                </div>

                                <h2 className="text-2xl font-bold text-slate-800">
                                    No Events Yet
                                </h2>

                                <p className="text-slate-500 mt-2 mb-6">
                                    You have not created any events yet.
                                </p>

                                <Link
                                    to="/organizer-createEvent"
                                    className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                                >
                                    Create Your First Event
                                </Link>

                            </div>

                        )}


                    {/* ==========================================
                        EVENTS
                    ========================================== */}

                    {events.length > 0 && (

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

                            {events.map(
                                (event) => (

                                    <div
                                        key={event.id}
                                        className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
                                    >

                                        {/* ==========================================
                                            EVENT IMAGE
                                        ========================================== */}

                                        {event.image ? (

                                            <img
                                                src={`http://localhost:5000/uploads/images/${event.image}`}
                                                alt={event.title}
                                                className="w-full h-48 object-cover"
                                            />

                                        ) : (

                                            <div className="w-full h-48 bg-indigo-100 flex items-center justify-center">

                                                <span className="text-indigo-600 text-5xl">
                                                    📅
                                                </span>

                                            </div>

                                        )}


                                        <div className="p-6">

                                            {/* ==========================================
                                                CATEGORY
                                            ========================================== */}

                                            {event.category && (

                                                <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">

                                                    {event.category}

                                                </span>

                                            )}


                                            {/* ==========================================
                                                TITLE
                                            ========================================== */}

                                            <h2 className="text-xl font-bold text-slate-800">

                                                {event.title}

                                            </h2>


                                            {/* ==========================================
                                                DESCRIPTION
                                            ========================================== */}

                                            <p className="text-slate-500 text-sm mt-2 line-clamp-2">

                                                {event.description ||
                                                    "No description provided."}

                                            </p>


                                            {/* ==========================================
                                                EVENT DETAILS
                                            ========================================== */}

                                            <div className="mt-5 space-y-3 text-sm">

                                                {/* DATE */}

                                                <div className="flex gap-3">

                                                    <span>
                                                        📅
                                                    </span>

                                                    <span className="text-slate-600">

                                                        {formatDate(
                                                            event.event_date
                                                        )}

                                                    </span>

                                                </div>


                                                {/* TIME */}

                                                <div className="flex gap-3">

                                                    <span>
                                                        🕐
                                                    </span>

                                                    <span className="text-slate-600">

                                                        {formatTime(
                                                            event.event_time
                                                        )}

                                                    </span>

                                                </div>


                                                {/* LOCATION */}

                                                <div className="flex gap-3">

                                                    <span>
                                                        📍
                                                    </span>

                                                    <span className="text-slate-600">

                                                        {event.location}

                                                    </span>

                                                </div>


                                                {/* CAPACITY */}

                                                <div className="flex gap-3">

                                                    <span>
                                                        👥
                                                    </span>

                                                    <span className="text-slate-600">

                                                        Capacity:{" "}

                                                        {event.capacity}

                                                    </span>

                                                </div>

                                            </div>


                                            {/* ==========================================
                                                DOCUMENT
                                            ========================================== */}

                                            {event.document && (

                                                <a
                                                    href={`http://localhost:5000/uploads/documents/${event.document}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block mt-5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                    📄 View Event Document
                                                </a>

                                            )}


                                            {/* ==========================================
                                                EDIT + DELETE
                                            ========================================== */}

                                            <div className="grid grid-cols-2 gap-3 mt-6">

                                                <Link
                                                    to={`/edit-event/${event.id}`}
                                                    className="text-center border border-indigo-600 text-indigo-600 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition"
                                                >
                                                    Edit
                                                </Link>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            event.id
                                                        )
                                                    }
                                                    disabled={
                                                        deleteLoading ===
                                                        event.id
                                                    }
                                                    className="border border-red-500 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50 transition"
                                                >

                                                    {deleteLoading ===
                                                    event.id
                                                        ? "Deleting..."
                                                        : "Delete"}

                                                </button>

                                            </div>


                                            {/* ==========================================
                                                VIEW REGISTERED ATTENDEES
                                            ========================================== */}

                                            <Link
                                                to={`/registered-attendees/${event.id}`}
                                                className="block w-full mt-3 text-center bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                                            >
                                                👥 View Attendees
                                            </Link>


                                            {/* ==========================================
                                                EVENT GROUP CHAT
                                            ========================================== */}

                                            <button
    type="button"
    onClick={() =>
        navigate(`/events/${event.id}/chat`)
    }
    className="w-full mt-3 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition"
>
    💬 Event Group Chat
</button>
                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>

            </div>

        </>

    );
}

export default MyEvents;