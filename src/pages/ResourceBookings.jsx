
import React, { useEffect, useState } from "react";

import {
    getResourceBookings,
    createResourceBooking,
    deleteResourceBooking,
    getResources,
} from "../services/calendarApi";

function ResourceBookings({ eventId }) {

    const [bookings, setBookings] = useState([]);
    const [resources, setResources] = useState([]);

    const [form, setForm] = useState({
        resource_id: "",
        start_datetime: "",
        end_datetime: "",
    });

    const [showForm, setShowForm] = useState(false);

    // ========================================
    // LOAD BOOKINGS + RESOURCES
    // ========================================

    const loadData = async () => {

        try {

            const bookingResponse =
                await getResourceBookings(eventId);

            const resourceResponse =
                await getResources();

            setBookings(
                bookingResponse.data || bookingResponse
            );

            setResources(
                resourceResponse.data || resourceResponse
            );

        } catch (error) {

            console.error(
                "Failed to load resource data:",
                error
            );
        }
    };


    useEffect(() => {

        if (eventId) {
            loadData();
        }

    }, [eventId]);


    // ========================================
    // HANDLE FORM CHANGE
    // ========================================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };


    // ========================================
    // CREATE BOOKING
    // ========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const booking = {
                event_id: Number(eventId),

                resource_id:
                    Number(form.resource_id),

                start_datetime:
                    form.start_datetime,

                end_datetime:
                    form.end_datetime,
            };

            console.log(
                "BOOKING PAYLOAD:",
                booking
            );

            await createResourceBooking(
                booking
            );

            alert(
                "Resource booked successfully!"
            );

            // Reset form
            setForm({
                resource_id: "",
                start_datetime: "",
                end_datetime: "",
            });

            // Hide form
            setShowForm(false);

            // Reload bookings
            await loadData();

        } catch (error) {

            console.error(
                "Booking error:",
                error
            );

            console.error(
                "Booking response:",
                error.response?.data
            );

            alert(
                error.response?.data?.message ||
                "Resource booking failed. There may be a conflict."
            );
        }
    };


    // ========================================
    // DELETE BOOKING
    // ========================================

    const handleDelete = async (id) => {

        if (
            !window.confirm(
                "Cancel this booking?"
            )
        ) {
            return;
        }

        try {

            await deleteResourceBooking(id);

            await loadData();

        } catch (error) {

            console.error(
                "Delete booking error:",
                error
            );

            alert(
                "Failed to delete booking."
            );
        }
    };


    // ========================================
    // UI
    // ========================================

    return (

        <div className="min-h-screen bg-slate-50 p-4 md:p-6">

            <div className="max-w-6xl mx-auto">

                {/* HEADER */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>

                            <h1 className="text-2xl font-bold text-slate-800">
                                Resource Bookings
                            </h1>

                            <p className="text-slate-500 mt-1">
                                Book resources and prevent scheduling conflicts.
                            </p>

                        </div>


                        <button
                            onClick={() =>
                                setShowForm(!showForm)
                            }
                            className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                        >

                            {showForm
                                ? "Cancel"
                                : "+ New Booking"}

                        </button>

                    </div>

                </div>


                {/* BOOKING FORM */}

                {showForm && (

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6"
                    >

                        <h2 className="text-lg font-bold text-slate-800 mb-5">
                            Create Resource Booking
                        </h2>


                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                            {/* RESOURCE */}

                            <select
                                name="resource_id"
                                value={form.resource_id}
                                onChange={handleChange}
                                required
                                className="border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                            >

                                <option value="">
                                    Select Resource
                                </option>


                                {resources.map(
                                    (resource) => (

                                        <option
                                            key={resource.id}
                                            value={resource.id}
                                        >
                                            {resource.name}
                                        </option>

                                    )
                                )}

                            </select>


                            {/* START */}

                            <input
                                type="datetime-local"
                                name="start_datetime"
                                value={
                                    form.start_datetime
                                }
                                onChange={handleChange}
                                required
                                className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />


                            {/* END */}

                            <input
                                type="datetime-local"
                                name="end_datetime"
                                value={
                                    form.end_datetime
                                }
                                onChange={handleChange}
                                required
                                className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>


                        <button
                            type="submit"
                            className="mt-5 px-5 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
                        >
                            Create Booking
                        </button>

                    </form>

                )}


                {/* BOOKINGS */}

                {bookings.length === 0 ? (

                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">

                        <div className="text-5xl mb-4">
                            📅
                        </div>

                        <h2 className="text-xl font-bold text-slate-800">
                            No bookings
                        </h2>

                        <p className="text-slate-500 mt-2">
                            No resources have been booked for this event.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-4">

                        {bookings.map(
                            (booking) => (

                                <div
                                    key={booking.id}
                                    className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5"
                                >

                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                        <div>

                                            <h2 className="text-lg font-bold text-slate-800">
                                                {booking.resource_name ||
                                                    "Resource"}
                                            </h2>


                                            <div className="mt-2 space-y-1 text-sm text-slate-500">

                                                <p>
                                                    Start:{" "}
                                                    {
                                                        booking.start_datetime
                                                    }
                                                </p>


                                                <p>
                                                    End:{" "}
                                                    {
                                                        booking.end_datetime
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    booking.id
                                                )
                                            }
                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100"
                                        >
                                            Cancel Booking
                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>

    );
}

export default ResourceBookings;
