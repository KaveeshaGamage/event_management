import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function EventDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [registeredCount, setRegisteredCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");


    useEffect(() => {
        fetchEvent();
    }, [id]);


    const fetchEvent = async () => {

        if (!token) {
            navigate("/login");
            return;
        }

        try {

            const response = await fetch(
                `http://localhost:5000/api/events/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to load event"
                );
            }

            setEvent(result);

            // Get registration count
            const membersResponse = await fetch(
                `http://localhost:5000/api/registrations/event/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (membersResponse.ok) {

                const membersResult =
                    await membersResponse.json();

                setRegisteredCount(
                    membersResult.registeredCount || 0
                );
            }

        } catch (error) {

            console.error(error);

            setError(
                "Unable to load event."
            );

        } finally {

            setLoading(false);
        }
    };


    const handleRegister = async () => {

        setRegistering(true);
        setMessage("");
        setError("");

        try {

            const response = await fetch(
                `http://localhost:5000/api/registrations/${id}`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Registration failed"
                );
            }

            setMessage(
                "You have successfully registered for this event."
            );

            setRegisteredCount(
                previous => previous + 1
            );

        } catch (error) {

            setError(
                error.message ||
                "Registration failed."
            );

        } finally {

            setRegistering(false);
        }
    };


    if (loading) {

        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-xl font-semibold text-indigo-600">
                    Loading event...
                </div>
            </div>
        );
    }


    if (!event) {

        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Event not found.</p>
            </div>
        );
    }


    const isFull =
        registeredCount >= event.capacity;


    return (
        <div className="min-h-screen bg-slate-100">

            <div className="max-w-5xl mx-auto px-6 py-10">

                <Link
                    to="/attendee-dashboard"
                    className="text-indigo-600 font-medium"
                >
                    ← Back to Events
                </Link>


                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-6">

                    {event.image && (
                        <img
                            src={`http://localhost:5000/uploads/images/${event.image}`}
                            alt={event.title}
                            className="w-full h-72 object-cover"
                        />
                    )}


                    <div className="p-8">

                        {event.category && (
                            <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                                {event.category}
                            </span>
                        )}


                        <h1 className="text-4xl font-bold text-slate-800">
                            {event.title}
                        </h1>


                        <p className="text-slate-600 mt-4">
                            {event.description ||
                                "No description provided."}
                        </p>


                        <div className="grid md:grid-cols-2 gap-5 mt-8">

                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm text-slate-500">
                                    Date
                                </p>

                                <p className="font-semibold">
                                    {event.event_date}
                                </p>
                            </div>


                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm text-slate-500">
                                    Time
                                </p>

                                <p className="font-semibold">
                                    {event.event_time}
                                </p>
                            </div>


                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm text-slate-500">
                                    Location
                                </p>

                                <p className="font-semibold">
                                    {event.location}
                                </p>
                            </div>


                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm text-slate-500">
                                    Available Seats
                                </p>

                                <p className="font-semibold">
                                    {event.capacity - registeredCount}
                                    {" / "}
                                    {event.capacity}
                                </p>
                            </div>

                        </div>


                        {message && (
                            <div className="mt-6 bg-green-100 border border-green-300 text-green-700 p-4 rounded-lg">
                                {message}
                            </div>
                        )}


                        {error && (
                            <div className="mt-6 bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg">
                                {error}
                            </div>
                        )}


                        <button
                            onClick={handleRegister}
                            disabled={
                                registering ||
                                isFull
                            }
                            className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-slate-400"
                        >
                            {registering
                                ? "Registering..."
                                : isFull
                                    ? "Event Full"
                                    : "Register for Event"}
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default EventDetails;