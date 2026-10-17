import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/OrganizerNavbar";

function CommitteeEvents() {
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        if (!token) {
            setError("You are not logged in.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/events/my-events",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    navigate("/login");
                    return;
                }

                throw new Error(
                    result.message || "Failed to fetch events"
                );
            }

            setEvents(Array.isArray(result) ? result : []);

        } catch (error) {
            console.error("Fetch committee events error:", error);
            setError(
                error.message ||
                "Unable to load your events."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );
    };

    const formatTime = (time) => {
        if (!time) {
            return "-";
        }

        const timeString = String(time);

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
            <>
                <Navbar />

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
            </>
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

                    {/* HEADER */}

                    <div className="mb-8">

                        <h1 className="text-3xl font-bold text-slate-800">
                            Event Committee
                        </h1>

                        <p className="text-slate-500 mt-2">
                            Select an event to add and manage committee members.
                        </p>

                    </div>


                    {/* ERROR */}

                    {error && (
                        <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-5 py-4 rounded-lg">
                            {error}
                        </div>
                    )}


                    {/* NO EVENTS */}

                    {!error && events.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-md p-12 text-center">

                            <div className="text-5xl mb-4">
                                📅
                            </div>

                            <h2 className="text-2xl font-bold text-slate-800">
                                No Events Found
                            </h2>

                            <p className="text-slate-500 mt-2">
                                You have not created any events yet.
                            </p>

                        </div>
                    )}


                    {/* EVENTS */}

                    {events.length > 0 && (

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

                            {events.map((event) => (

                                <div
                                    key={event.id}
                                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
                                >

                                    {/* EVENT IMAGE */}

                                    {event.image ? (

                                        <img
                                            src={`http://localhost:5000/uploads/images/${event.image}`}
                                            alt={event.title}
                                            className="w-full h-48 object-cover"
                                        />

                                    ) : (

                                        <div className="w-full h-48 bg-indigo-100 flex items-center justify-center">

                                            <span className="text-6xl">
                                                📅
                                            </span>

                                        </div>

                                    )}


                                    {/* CONTENT */}

                                    <div className="p-6">

                                        {/* CATEGORY */}

                                        {event.category && (
                                            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                                                {event.category}
                                            </span>
                                        )}


                                        {/* TITLE */}

                                        <h2 className="text-xl font-bold text-slate-800">
                                            {event.title}
                                        </h2>


                                        {/* DESCRIPTION */}

                                        <p className="text-slate-500 text-sm mt-2 line-clamp-2">
                                            {event.description ||
                                                "No description provided."}
                                        </p>


                                        {/* EVENT DETAILS */}

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
                                                    Capacity:{" "}
                                                    {event.capacity}
                                                </span>

                                            </div>

                                        </div>


                                        {/* ADD COMMITTEE MEMBERS */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/event-committee/${event.id}`
                                                )
                                            }
                                            className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                                        >
                                            👥 Add Committee Members
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>
        </>
    );
}

export default CommitteeEvents;