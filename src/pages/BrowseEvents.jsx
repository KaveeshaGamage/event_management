import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function BrowseEvents() {
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(null);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        fetchData();
    }, []);

    // ==========================================
    // FETCH EVENTS + MY REGISTRATIONS
    // ==========================================
    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            // GET ALL EVENTS
            const eventsResponse = await fetch(
                "http://localhost:5000/api/events"
            );

            const eventsText = await eventsResponse.text();

            let eventsData;

            try {
                eventsData = JSON.parse(eventsText);
            } catch {
                throw new Error(
                    "Server returned an invalid events response."
                );
            }

            if (!eventsResponse.ok) {
                throw new Error(
                    eventsData.message ||
                    "Failed to load events."
                );
            }

            // GET MY REGISTRATIONS
            const registrationsResponse = await fetch(
                "http://localhost:5000/api/registrations/my-registrations",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const registrationsText =
                await registrationsResponse.text();

            let registrationsData;

            try {
                registrationsData =
                    JSON.parse(registrationsText);
            } catch {
                throw new Error(
                    "Server returned an invalid registration response."
                );
            }

            if (
                registrationsResponse.status === 401 ||
                registrationsResponse.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            if (!registrationsResponse.ok) {
                throw new Error(
                    registrationsData.message ||
                    "Failed to load registrations."
                );
            }

            setEvents(
                Array.isArray(eventsData)
                    ? eventsData
                    : []
            );

            setRegistrations(
                Array.isArray(registrationsData)
                    ? registrationsData
                    : []
            );

        } catch (error) {
            console.error(
                "Browse events error:",
                error
            );

            setError(
                error.message ||
                "Unable to load events."
            );

        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // CHECK WHETHER USER IS REGISTERED
    // ==========================================
    const isRegistered = (eventId) => {
        return registrations.some(
            (registration) =>
                Number(registration.event_id) ===
                Number(eventId)
        );
    };

    // ==========================================
    // REGISTER FOR EVENT
    // ==========================================
    const registerForEvent = async (eventId) => {

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setRegistering(eventId);
            setError("");

            const response = await fetch(
                `http://localhost:5000/api/registrations/${eventId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const text = await response.text();

            let result;

            try {
                result = JSON.parse(text);
            } catch {
                throw new Error(
                    "Server returned an invalid response."
                );
            }

            // TOKEN INVALID
            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            // REGISTRATION FAILED
            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Failed to register for event."
                );
            }

            // SUCCESS
            alert(
                result.message ||
                "Successfully registered for the event!"
            );

            // Reload registrations from database
            await fetchData();

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            alert(
                error.message ||
                "Failed to register for event."
            );

        } finally {
            setRegistering(null);
        }
    };

    // ==========================================
    // IMAGE URL
    // ==========================================
    const getImageUrl = (image) => {

        if (!image) {
            return null;
        }

        if (image.startsWith("http")) {
            return image;
        }

        if (image.startsWith("/uploads/")) {
            return `http://localhost:5000${image}`;
        }

        return `http://localhost:5000/uploads/images/${image}`;
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================
    const formatDate = (date) => {

        if (!date) {
            return "";
        }

        return new Date(date).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
    };

    // ==========================================
    // FORMAT TIME
    // ==========================================
    const formatTime = (time) => {

        if (!time) {
            return "";
        }

        const timeString = String(time);

        return new Date(
            `1970-01-01T${timeString}`
        ).toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit"
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
                        Loading events...
                    </div>

                    <p className="text-slate-500 mt-2">
                        Please wait while we load available events.
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================
    return (
        <div className="min-h-screen bg-slate-100">

            {/* HEADER */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-5">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">
                                Browse Events
                            </h1>

                            <p className="text-slate-500 mt-1">
                                Discover events and register for the ones you like.
                            </p>
                        </div>

                        <div className="flex gap-3">

                            <Link
                                to="/attendee-dashboard"
                                className="px-5 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition"
                            >
                                Dashboard
                            </Link>

                            <Link
                                to="/my-registrations"
                                className="px-5 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                            >
                                My Registrations
                            </Link>

                        </div>

                    </div>

                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* ERROR */}
                {error && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-5 py-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* NO EVENTS */}
                {events.length === 0 && !error && (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center">

                        <div className="text-6xl mb-5">
                            📅
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800">
                            No Events Available
                        </h2>

                        <p className="text-slate-500 mt-2">
                            Organizers have not created any events yet.
                        </p>

                    </div>
                )}

                {/* EVENT CARDS */}
                {events.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        {events.map((event) => {

                            const registered =
                                isRegistered(event.id);

                            const imageUrl =
                                getImageUrl(event.image);

                            return (
                                <div
                                    key={event.id}
                                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
                                >

                                    {/* IMAGE */}
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={event.title}
                                            className="w-full h-52 object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-52 bg-indigo-100 flex items-center justify-center">
                                            <span className="text-6xl">
                                                📅
                                            </span>
                                        </div>
                                    )}

                                    <div className="p-6">

                                        {/* CATEGORY */}
                                        {event.category && (
                                            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                                                {event.category}
                                            </span>
                                        )}

                                        {/* TITLE */}
                                        <h2 className="text-xl font-bold text-slate-800 mt-3">
                                            {event.title}
                                        </h2>

                                        {/* DESCRIPTION */}
                                        <p className="text-slate-500 text-sm mt-2 line-clamp-3">
                                            {event.description ||
                                                "No description provided."}
                                        </p>

                                        {/* DETAILS */}
                                        <div className="mt-5 space-y-3 text-sm">

                                            <div className="flex gap-3">
                                                <span>📅</span>
                                                <span className="text-slate-600">
                                                    {formatDate(
                                                        event.event_date
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex gap-3">
                                                <span>🕐</span>
                                                <span className="text-slate-600">
                                                    {formatTime(
                                                        event.event_time
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex gap-3">
                                                <span>📍</span>
                                                <span className="text-slate-600">
                                                    {event.location}
                                                </span>
                                            </div>

                                            <div className="flex gap-3">
                                                <span>👥</span>
                                                <span className="text-slate-600">
                                                    Capacity: {event.capacity}
                                                </span>
                                            </div>

                                        </div>

                                        {/* BUTTONS */}
                                        <div className="mt-6 flex gap-3">

                                            <Link
                                                to={`/event/${event.id}`}
                                                className="flex-1 text-center border border-indigo-600 text-indigo-600 py-2.5 rounded-lg font-semibold hover:bg-indigo-50 transition"
                                            >
                                                View Details
                                            </Link>

                                            {registered ? (

                                                <Link
                                                    to="/my-registrations"
                                                    className="flex-1 text-center bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition"
                                                >
                                                    ✓ Registered
                                                </Link>

                                            ) : (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        registerForEvent(
                                                            event.id
                                                        )
                                                    }
                                                    disabled={
                                                        registering ===
                                                        event.id
                                                    }
                                                    className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                >
                                                    {registering === event.id
                                                        ? "Registering..."
                                                        : "Register"}
                                                </button>

                                            )}

                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </div>
        </div>
    );
}

export default BrowseEvents;