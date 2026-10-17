import React, { useEffect, useState } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { getCalendar } from "../services/calendarApi";
import OrganizerNavbar from "../components/OrganizerNavbar";
function EventCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedEvent, setSelectedEvent] = useState(null);

    // ==========================================
    // LOAD CALENDAR
    // ==========================================

    useEffect(() => {
        loadCalendar();
    }, []);

    const loadCalendar = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getCalendar();

            const data = response.data || response;

            console.log("Calendar API data:", data);

            const formattedEvents = data.map((item) => {
                const itemType =
                    item.item_type ||
                    item.itemType ||
                    "event";

                const isTask = itemType === "task";

                return {
                    // ==========================================
                    // CALENDAR ITEM ID
                    // ==========================================

                    id: isTask
                        ? `task-${item.id}`
                        : `event-${item.id}`,

                    // ==========================================
                    // CALENDAR TITLE
                    // ==========================================
                    //
                    // EVENT:
                    //     Event name
                    //
                    // TASK:
                    //     Task name only
                    //
                    // ==========================================

                    title: isTask
                        ? item.title || item.name
                        : item.name || item.title,

                    // ==========================================
                    // DATE
                    // ==========================================

                    start:
                        item.start_date ||
                        item.due_date,

                    end: item.end_date,

                    // ==========================================
                    // CSS CLASS
                    // ==========================================

                    className: isTask
                        ? "calendar-task"
                        : "calendar-event",

                    // ==========================================
                    // EXTRA INFORMATION
                    // ==========================================

                    extendedProps: {
                        // --------------------------------------
                        // ITEM TYPE
                        // --------------------------------------

                        itemType: itemType,

                        // --------------------------------------
                        // EVENT INFORMATION
                        // --------------------------------------

                        eventId: isTask
                            ? item.event_id
                            : item.id,

                        /*
                         * IMPORTANT:
                         *
                         * For a TASK, eventTitle comes ONLY
                         * from item.event_title.
                         *
                         * We do NOT use item.name or item.title
                         * here because those are the TASK name.
                         */

                        eventTitle: isTask
                            ? item.event_title
                            : item.name || item.title,

                        eventDate:
                            item.event_date,

                        eventTime:
                            item.event_time,

                        location:
                            item.location,

                        capacity:
                            item.capacity,

                        // --------------------------------------
                        // TASK INFORMATION
                        // --------------------------------------

                        taskId: isTask
                            ? item.id
                            : null,

                        taskTitle: isTask
                            ? item.title || item.name
                            : null,

                        description:
                            item.description,

                        dueDate:
                            item.due_date,

                        category:
                            item.category,

                        priority:
                            item.priority,

                        status:
                            item.status,

                        assignedUser:
                            item.assigned_user,

                        assignedTo:
                            item.assigned_to,
                    },
                };
            });

            console.log(
                "Formatted calendar events:",
                formattedEvents
            );

            setEvents(formattedEvents);

        } catch (err) {
            console.error(
                "Calendar loading error:",
                err
            );

            setError(
                "Unable to load calendar events."
            );

        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // EVENT CLICK
    // ==========================================

    const handleEventClick = (info) => {
        console.log(
            "Selected calendar item:",
            info.event
        );

        console.log(
            "Selected item properties:",
            info.event.extendedProps
        );

        setSelectedEvent(info.event);
    };

    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const closeModal = () => {
        setSelectedEvent(null);
    };

    // ==========================================
    // CHECK IF SELECTED ITEM IS TASK
    // ==========================================

    const isTask =
        selectedEvent?.extendedProps?.itemType ===
        "task";

    // ==========================================
    // EVENT ID
    // ==========================================

    const eventId =
        selectedEvent?.extendedProps?.eventId;

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">

                <div className="text-center">

                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

                    <p className="text-slate-600 font-medium">
                        Loading calendar...
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">

                <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">

                    <h2 className="font-semibold text-lg mb-1">
                        Calendar Error
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={loadCalendar}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }

    return (
        <>
        <OrganizerNavbar/>
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">

            
            <div className="max-w-7xl mx-auto mb-6">

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>

                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                                Event Calendar
                            </h1>

                            <p className="text-slate-500 mt-1">
                                Manage events, tasks, resources and deadlines.
                            </p>

                        </div>

                        <button
                            onClick={loadCalendar}
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Refresh Calendar
                        </button>

                    </div>

                </div>

            </div>

            {/* ========================================== */}
            {/* CALENDAR */}
            {/* ========================================== */}

            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">

                <FullCalendar
                    plugins={[
                        dayGridPlugin,
                        timeGridPlugin,
                        interactionPlugin,
                    ]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    events={events}
                    eventClick={handleEventClick}
                    height="auto"
                    dayMaxEvents={3}
                />

            </div>

            {/* ========================================== */}
            {/* DETAILS MODAL */}
            {/* ========================================== */}

            {selectedEvent && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={closeModal}
                >

                    <div
                        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* ====================================== */}
                        {/* TASK MODAL */}
                        {/* ====================================== */}

                        {isTask ? (

                            <>

                                {/* ================================== */}
                                {/* TASK HEADER */}
                                {/* ================================== */}

                                <div className="bg-amber-500 px-6 py-5 text-white">

                                    <div className="flex items-start justify-between gap-4">

                                        <div>

                                            <p className="text-amber-100 text-sm font-medium mb-1">
                                                Task Details
                                            </p>

                                            <h2 className="text-2xl font-bold">
                                                {
                                                    selectedEvent
                                                        .extendedProps
                                                        .taskTitle
                                                }
                                            </h2>

                                        </div>

                                        <button
                                            onClick={closeModal}
                                            className="text-white/80 hover:text-white text-2xl"
                                        >
                                            ×
                                        </button>

                                    </div>

                                </div>

                                {/* ================================== */}
                                {/* TASK CONTENT */}
                                {/* ================================== */}

                                <div className="p-6">

                                    {/* ================================== */}
                                    {/* EVENT BELONGING TO */}
                                    {/* ================================== */}

                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">

                                        <p className="text-xs font-semibold text-blue-500 uppercase mb-1">
                                            Event
                                        </p>

                                        <p className="text-lg font-bold text-blue-800">

                                            {
                                                selectedEvent
                                                    .extendedProps
                                                    .eventTitle
                                                    ||
                                                "Event not specified"
                                            }

                                        </p>

                                    </div>

                                    {/* ================================== */}
                                    {/* TASK INFORMATION */}
                                    {/* ================================== */}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        {/* ================================== */}
                                        {/* DUE DATE */}
                                        {/* ================================== */}

                                        <div className="bg-slate-50 rounded-xl p-4">

                                            <p className="text-xs font-semibold text-slate-400 uppercase">
                                                Due Date
                                            </p>

                                            <p className="mt-1 font-semibold text-slate-800">

                                                {
                                                    selectedEvent
                                                        .extendedProps
                                                        .dueDate
                                                    ? new Date(
                                                        selectedEvent
                                                            .extendedProps
                                                            .dueDate
                                                    ).toLocaleString()
                                                    : selectedEvent
                                                        .start
                                                        ?.toLocaleString()
                                                    || "Not specified"
                                                }

                                            </p>

                                        </div>

                                        {/* ================================== */}
                                        {/* CATEGORY */}
                                        {/* ================================== */}

                                        <div className="bg-slate-50 rounded-xl p-4">

                                            <p className="text-xs font-semibold text-slate-400 uppercase">
                                                Category
                                            </p>

                                            <p className="mt-1 font-semibold text-slate-800">

                                                {
                                                    selectedEvent
                                                        .extendedProps
                                                        .category
                                                    || "Other"
                                                }

                                            </p>

                                        </div>

                                        {/* ================================== */}
                                        {/* PRIORITY */}
                                        {/* ================================== */}

                                        <div className="bg-slate-50 rounded-xl p-4">

                                            <p className="text-xs font-semibold text-slate-400 uppercase">
                                                Priority
                                            </p>

                                            <p
                                                className={`mt-1 font-semibold ${
                                                    selectedEvent
                                                        .extendedProps
                                                        .priority ===
                                                    "High"
                                                        ? "text-red-600"
                                                        : selectedEvent
                                                            .extendedProps
                                                            .priority ===
                                                          "Medium"
                                                        ? "text-orange-600"
                                                        : "text-green-600"
                                                }`}
                                            >

                                                {
                                                    selectedEvent
                                                        .extendedProps
                                                        .priority
                                                    || "Medium"
                                                }

                                            </p>

                                        </div>

                                        {/* ================================== */}
                                        {/* STATUS */}
                                        {/* ================================== */}

                                        <div className="bg-slate-50 rounded-xl p-4">

                                            <p className="text-xs font-semibold text-slate-400 uppercase">
                                                Status
                                            </p>

                                            <p className="mt-1 font-semibold text-slate-800">

                                                {
                                                    selectedEvent
                                                        .extendedProps
                                                        .status
                                                    || "Pending"
                                                }

                                            </p>

                                        </div>

                                        {/* ================================== */}
                                        {/* ASSIGNED MEMBER */}
                                        {/* ================================== */}

                                        <div className="bg-slate-50 rounded-xl p-4 md:col-span-2">

                                            <p className="text-xs font-semibold text-slate-400 uppercase">
                                                Assigned To
                                            </p>

                                            <p className="mt-1 font-semibold text-slate-800">

                                                {
                                                    selectedEvent
                                                        .extendedProps
                                                        .assignedUser
                                                    || "Unassigned"
                                                }

                                            </p>

                                        </div>

                                    </div>

                                    {/* ================================== */}
                                    {/* TASK DESCRIPTION */}
                                    {/* ================================== */}

                                    <div className="mt-5">

                                        <p className="text-sm font-semibold text-slate-700 mb-2">
                                            Task Description
                                        </p>

                                        <div className="bg-slate-50 rounded-xl p-4 text-slate-600 leading-relaxed">

                                            {
                                                selectedEvent
                                                    .extendedProps
                                                    .description
                                                || "No description available."
                                            }

                                        </div>

                                    </div>

                                    {/* ================================== */}
                                    {/* VIEW TASKS */}
                                    {/* ================================== */}

                                    <div className="mt-6">

                                        <button
                                            onClick={() =>
                                                window.location.href =
                                                `/events/${eventId}/tasks`
                                            }
                                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                                        >
                                            View Tasks for This Event
                                        </button>

                                    </div>

                                </div>

                            </>

                        ) : (

                            /* ====================================== */
                            /* EVENT MODAL */
                            /* ====================================== */

                            <>

                                {/* ================================== */}
                                {/* EVENT HEADER */}
                                {/* ================================== */}

                                <div className="bg-blue-600 px-6 py-5 text-white">

                                    <div className="flex items-start justify-between gap-4">

                                        <div>

                                            <p className="text-blue-100 text-sm font-medium mb-1">
                                                Event Details
                                            </p>

                                            <h2 className="text-2xl font-bold">
                                                {selectedEvent.title}
                                            </h2>

                                        </div>

                                        <button
                                            onClick={closeModal}
                                            className="text-white/80 hover:text-white text-2xl"
                                        >
                                            ×
                                        </button>

                                    </div>

                                </div>

                                {/* ================================== */}
                                {/* EVENT CONTENT */}
                                {/* ================================== */}

                                <div className="p-6">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        {/* ================================== */}
                                        {/* DATE */}
                                        {/* ================================== */}

                                        <div className="bg-slate-50 rounded-xl p-4">

                                            <p className="text-xs font-semibold text-slate-400 uppercase">
                                                Date
                                            </p>

                                            <p className="mt-1 font-semibold text-slate-800">

                                                {
                                                    selectedEvent
                                                        .extendedProps
                                                        .eventDate
                                                    ||
                                                    selectedEvent
                                                        .start
                                                        ?.toLocaleDateString()
                                                }

                                            </p>

                                        </div>

                                        {/* ================================== */}
                                        {/* TIME */}
                                        {/* ================================== */}

                                        <div className="bg-slate-50 rounded-xl p-4">

                                            <p className="text-xs font-semibold text-slate-400 uppercase">
                                                Time
                                            </p>

                                            <p className="mt-1 font-semibold text-slate-800">

                                                {
                                                    selectedEvent
                                                        .extendedProps
                                                        .eventTime
                                                    ||
                                                    "Not specified"
                                                }

                                            </p>

                                        </div>

                                        {/* ================================== */}
                                        {/* LOCATION */}
                                        {/* ================================== */}

                                        <div className="bg-slate-50 rounded-xl p-4">

                                            <p className="text-xs font-semibold text-slate-400 uppercase">
                                                Location
                                            </p>

                                            <p className="mt-1 font-semibold text-slate-800">

                                                {
                                                    selectedEvent
                                                        .extendedProps
                                                        .location
                                                    ||
                                                    "Not specified"
                                                }

                                            </p>

                                        </div>

                                        {/* ================================== */}
                                        {/* CATEGORY */}
                                        {/* ================================== */}

                                        <div className="bg-slate-50 rounded-xl p-4">

                                            <p className="text-xs font-semibold text-slate-400 uppercase">
                                                Category
                                            </p>

                                            <p className="mt-1 font-semibold text-slate-800">

                                                {
                                                    selectedEvent
                                                        .extendedProps
                                                        .category
                                                    ||
                                                    "General"
                                                }

                                            </p>

                                        </div>

                                        {/* ================================== */}
                                        {/* CAPACITY */}
                                        {/* ================================== */}

                                        <div className="bg-slate-50 rounded-xl p-4">

                                            <p className="text-xs font-semibold text-slate-400 uppercase">
                                                Capacity
                                            </p>

                                            <p className="mt-1 font-semibold text-slate-800">

                                                {
                                                    selectedEvent
                                                        .extendedProps
                                                        .capacity
                                                    ||
                                                    "Not specified"
                                                }

                                            </p>

                                        </div>

                                    </div>

                                    {/* ================================== */}
                                    {/* DESCRIPTION */}
                                    {/* ================================== */}

                                    <div className="mt-5">

                                        <p className="text-sm font-semibold text-slate-700 mb-2">
                                            Description
                                        </p>

                                        <div className="bg-slate-50 rounded-xl p-4 text-slate-600 leading-relaxed">

                                            {
                                                selectedEvent
                                                    .extendedProps
                                                    .description
                                                ||
                                                "No description available."
                                            }

                                        </div>

                                    </div>

                                    {/* ================================== */}
                                    {/* EVENT ACTIONS */}
                                    {/* ================================== */}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">

                                        <button
                                            onClick={() =>
                                                window.location.href =
                                                `/events/${eventId}/tasks`
                                            }
                                            className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                                        >
                                            Tasks
                                        </button>

                                        <button
                                            onClick={() =>
                                                window.location.href =
                                                `/events/${eventId}/resources`
                                            }
                                            className="px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
                                        >
                                            Resources
                                        </button>

                                        <button
                                            onClick={() =>
                                                window.location.href =
                                                `/events/${eventId}/bookings`
                                            }
                                            className="px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
                                        >
                                            Bookings
                                        </button>

                                    </div>

                                </div>

                            </>

                        )}

                    </div>

                </div>

            )}

        </div>
        </>
    );
}

export default EventCalendar;
