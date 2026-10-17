import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function RegisteredAttendees() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [members, setMembers] = useState([]);
    const [registeredCount, setRegisteredCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchRegisteredAttendees();
    }, [eventId]);

    // ==========================================
    // FETCH REGISTERED ATTENDEES
    // ==========================================
    const fetchRegisteredAttendees = async () => {
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `http://localhost:5000/api/registrations/event/${eventId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const text = await response.text();

            console.log(
                "Registered attendees status:",
                response.status
            );

            console.log(
                "Registered attendees response:",
                text
            );

            let result;

            try {
                result = JSON.parse(text);
            } catch {
                throw new Error(
                    "Server returned an invalid response."
                );
            }

            // Invalid / expired token
            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Failed to load registered attendees."
                );
            }

            setEvent(result.event);
            setMembers(
                Array.isArray(result.members)
                    ? result.members
                    : []
            );

            setRegisteredCount(
                Number(result.registeredCount || 0)
            );

        } catch (error) {
            console.error(
                "Fetch registered attendees error:",
                error
            );

            setError(
                error.message ||
                "Unable to load registered attendees."
            );

        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================
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

    // ==========================================
    // FORMAT DATE + TIME
    // ==========================================
    const formatDateTime = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
            }
        );
    };

    // ==========================================
    // FORMAT EVENT TIME
    // ==========================================
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
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="text-center">

                    <div className="text-2xl font-semibold text-indigo-600">
                        Loading registered attendees...
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
        <div className="min-h-screen bg-slate-100">

            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Registered Attendees
                        </h1>

                        <p className="text-slate-500 mt-2">
                            Attendees who registered for this event.
                        </p>
                    </div>

                    <Link
                        to="/my-events"
                        className="inline-flex items-center justify-center bg-slate-700 text-white px-5 py-3 rounded-lg font-semibold hover:bg-slate-800 transition"
                    >
                        ← Back to My Events
                    </Link>

                </div>

                {/* ERROR */}
                {error && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-5 py-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* EVENT INFORMATION */}
                {event && !error && (
                    <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                            <div>
                                <p className="text-sm text-indigo-600 font-semibold uppercase">
                                    Event
                                </p>

                                <h2 className="text-2xl font-bold text-slate-800 mt-1">
                                    {event.title}
                                </h2>

                                <div className="mt-4 space-y-2 text-sm text-slate-600">

                                    <p>
                                        📅{" "}
                                        {formatDate(
                                            event.event_date
                                        )}
                                    </p>

                                    <p>
                                        🕐{" "}
                                        {formatTime(
                                            event.event_time
                                        )}
                                    </p>

                                    <p>
                                        📍{" "}
                                        {event.location}
                                    </p>

                                </div>
                            </div>

                            {/* REGISTRATION COUNT */}
                            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-8 py-5 text-center">

                                <p className="text-sm text-indigo-600 font-semibold">
                                    REGISTERED ATTENDEES
                                </p>

                                <p className="text-4xl font-bold text-indigo-700 mt-1">
                                    {registeredCount}
                                </p>

                                <p className="text-sm text-slate-500 mt-1">
                                    of {event.capacity} capacity
                                </p>

                            </div>

                        </div>

                    </div>
                )}

                {/* NO ATTENDEES */}
                {members.length === 0 && !error && (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center">

                        <div className="text-5xl mb-4">
                            👥
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800">
                            No Registered Attendees
                        </h2>

                        <p className="text-slate-500 mt-2">
                            No attendees have registered for this event yet.
                        </p>

                    </div>
                )}

                {/* ATTENDEE TABLE */}
                {members.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden">

                        <div className="px-6 py-5 border-b border-slate-200">

                            <h2 className="text-xl font-bold text-slate-800">
                                Attendee List
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                {registeredCount} attendee
                                {registeredCount !== 1
                                    ? "s"
                                    : ""}{" "}
                                registered for this event.
                            </p>

                        </div>

                        {/* DESKTOP TABLE */}
                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-slate-50">

                                    <tr>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                                            #
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                                            Attendee Name
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                                            Email
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                                            Registered At
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-slate-200">

                                    {members.map(
                                        (member, index) => (

                                            <tr
                                                key={
                                                    member.registration_id ||
                                                    index
                                                }
                                                className="hover:bg-slate-50 transition"
                                            >

                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {index + 1}
                                                </td>

                                                <td className="px-6 py-4">

                                                    <div className="font-semibold text-slate-800">
                                                        {
                                                            member.attendee_name
                                                        }
                                                    </div>

                                                </td>

                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {
                                                        member.attendee_email
                                                    }
                                                </td>

                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {formatDateTime(
                                                        member.registered_at
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}

export default RegisteredAttendees;