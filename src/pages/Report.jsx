
import React, {
    useEffect,
    useState
} from "react";

import {
    getReportEvents,
    getEventReport
} from "../services/reportApi";
import OrganizerNavbar from "../components/OrganizerNavbar";

function Report() {

    // ==================================================
    // STATE
    // ==================================================

    const [events, setEvents] =
        useState([]);

    const [selectedEventId, setSelectedEventId] =
        useState(null);

    const [report, setReport] =
        useState(null);

    const [loadingEvents, setLoadingEvents] =
        useState(true);

    const [loadingReport, setLoadingReport] =
        useState(false);

    const [error, setError] =
        useState("");


    // ==================================================
    // LOAD ALL EVENTS
    // ==================================================

    useEffect(() => {

        loadEvents();

    }, []);


    const loadEvents = async () => {

        try {

            setLoadingEvents(true);
            setError("");

            const data =
                await getReportEvents();

            setEvents(data);

        } catch (error) {

            console.error(
                "Loading report events error:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to load events."
            );

        } finally {

            setLoadingEvents(false);

        }

    };


    // ==================================================
    // GENERATE REPORT
    // ==================================================

    const generateReport = async (eventId) => {

        try {

            setSelectedEventId(eventId);

            setLoadingReport(true);

            setError("");

            setReport(null);


            const data =
                await getEventReport(eventId);


            console.log(
                "GENERATED REPORT:",
                data
            );


            setReport(data);

        } catch (error) {

            console.error(
                "Report generation error:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to generate event report."
            );

        } finally {

            setLoadingReport(false);

        }

    };


    // ==================================================
    // BACK TO EVENTS
    // ==================================================

    const backToEvents = () => {

        setReport(null);

        setSelectedEventId(null);

        setError("");

    };


    // ==================================================
    // PRINT
    // ==================================================

    const handlePrint = () => {

        window.print();

    };


    // ==================================================
    // FORMAT DATE
    // ==================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        const parsedDate =
            new Date(date);

        if (isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString();

    };


    // ==================================================
    // FORMAT DATETIME
    // ==================================================

    const formatDateTime = (value) => {

        if (!value) {
            return "-";
        }

        const parsedDate =
            new Date(value);

        if (isNaN(parsedDate.getTime())) {
            return value;
        }

        return parsedDate.toLocaleString();

    };


    // ==================================================
    // STATUS STYLE
    // ==================================================

    const getStatusClass = (status) => {

        if (status === "Completed") {

            return "bg-green-100 text-green-700";

        }

        if (status === "In Progress") {

            return "bg-blue-100 text-blue-700";

        }

        return "bg-yellow-100 text-yellow-700";

    };


    // ==================================================
    // PRIORITY STYLE
    // ==================================================

    const getPriorityClass = (priority) => {

        if (priority === "High") {

            return "bg-red-100 text-red-700";

        }

        if (priority === "Medium") {

            return "bg-orange-100 text-orange-700";

        }

        return "bg-green-100 text-green-700";

    };


    // ==================================================
    // LOADING EVENTS
    // ==================================================

    if (loadingEvents) {

        return (
             
            <div className="min-h-screen bg-slate-50 p-6">

                <div className="max-w-7xl mx-auto">

                    <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">

                        <div className="text-4xl mb-4">
                            📊
                        </div>

                        <p className="text-slate-500">
                            Loading events...
                        </p>

                    </div>

                </div>

            </div>

        );

    }


    // ==================================================
    // SHOW REPORT
    // ==================================================

    if (report) {

        const {
            event,
            summary,
            committeeMembers = [],
            tasks = [],
            resourceBookings = []
        } = report;


        const registrationSummary =
            summary?.registrations || {
                total: 0,
                capacity: event?.capacity || 0,
                available: event?.capacity || 0,
                percentage: 0
            };


        const taskSummary =
            summary?.tasks || {
                total: 0,
                pending: 0,
                inProgress: 0,
                completed: 0
            };


        const resourceSummary =
            summary?.resources || {
                total: 0
            };


        return (

            <div
                id="event-report"
                className="min-h-screen bg-slate-50 p-4 md:p-6"
            >

                <div className="max-w-7xl mx-auto">


                    {/* ==================================
                        REPORT HEADER
                    ================================== */}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                            <div>

                                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                                    EVENTORA
                                </p>

                                <h1 className="text-3xl font-bold text-slate-800 mt-1">
                                    Event Management Report
                                </h1>

                                <p className="text-slate-500 mt-2">
                                    {event?.title}
                                </p>

                            </div>


                            <div className="flex gap-3">

                                <button
                                    onClick={backToEvents}
                                    className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 print:hidden"
                                >
                                    ← Back to Events
                                </button>


                                <button
                                    onClick={handlePrint}
                                    className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 print:hidden"
                                >
                                    🖨 Print Report
                                </button>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        EVENT INFORMATION
                    ================================== */}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

                        <h2 className="text-xl font-bold text-slate-800 mb-5">
                            Event Information
                        </h2>


                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                            <div>

                                <p className="text-sm text-slate-500">
                                    Event Name
                                </p>

                                <p className="font-semibold text-slate-800 mt-1">
                                    {event?.title || "-"}
                                </p>

                            </div>


                            <div>

                                <p className="text-sm text-slate-500">
                                    Organizer
                                </p>

                                <p className="font-semibold text-slate-800 mt-1">
                                    {event?.organizer_name || "-"}
                                </p>

                            </div>


                            <div>

                                <p className="text-sm text-slate-500">
                                    Category
                                </p>

                                <p className="font-semibold text-slate-800 mt-1">
                                    {event?.category || "Other"}
                                </p>

                            </div>


                            <div>

                                <p className="text-sm text-slate-500">
                                    Event Date
                                </p>

                                <p className="font-semibold text-slate-800 mt-1">
                                    {formatDate(event?.event_date)}
                                </p>

                            </div>


                            <div>

                                <p className="text-sm text-slate-500">
                                    Event Time
                                </p>

                                <p className="font-semibold text-slate-800 mt-1">
                                    {event?.event_time || "-"}
                                </p>

                            </div>


                            <div>

                                <p className="text-sm text-slate-500">
                                    Location
                                </p>

                                <p className="font-semibold text-slate-800 mt-1">
                                    {event?.location || "-"}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        SUMMARY CARDS
                    ================================== */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">


                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

                            <p className="text-sm text-slate-500">
                                Registrations
                            </p>

                            <p className="text-3xl font-bold text-blue-600 mt-2">
                                {registrationSummary.total}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                                of {registrationSummary.capacity}
                            </p>

                        </div>


                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

                            <p className="text-sm text-slate-500">
                                Committee Members
                            </p>

                            <p className="text-3xl font-bold text-purple-600 mt-2">
                                {summary?.committee || 0}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                                assigned members
                            </p>

                        </div>


                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

                            <p className="text-sm text-slate-500">
                                Total Tasks
                            </p>

                            <p className="text-3xl font-bold text-orange-500 mt-2">
                                {taskSummary.total}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                                event tasks
                            </p>

                        </div>


                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

                            <p className="text-sm text-slate-500">
                                Resource Bookings
                            </p>

                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {resourceSummary.total}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                                bookings
                            </p>

                        </div>

                    </div>


                    {/* ==================================
                        TASK SUMMARY
                    ================================== */}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

                        <h2 className="text-xl font-bold text-slate-800 mb-5">
                            Task Summary
                        </h2>


                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                            <div className="rounded-xl bg-yellow-50 border border-yellow-100 p-5">

                                <p className="text-sm text-yellow-700">
                                    Pending
                                </p>

                                <p className="text-3xl font-bold text-yellow-700 mt-2">
                                    {taskSummary.pending}
                                </p>

                            </div>


                            <div className="rounded-xl bg-blue-50 border border-blue-100 p-5">

                                <p className="text-sm text-blue-700">
                                    In Progress
                                </p>

                                <p className="text-3xl font-bold text-blue-700 mt-2">
                                    {taskSummary.inProgress}
                                </p>

                            </div>


                            <div className="rounded-xl bg-green-50 border border-green-100 p-5">

                                <p className="text-sm text-green-700">
                                    Completed
                                </p>

                                <p className="text-3xl font-bold text-green-700 mt-2">
                                    {taskSummary.completed}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        TASK DETAILS
                    ================================== */}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

                        <h2 className="text-xl font-bold text-slate-800 mb-5">
                            Task Details
                        </h2>


                        {tasks.length === 0 ? (

                            <p className="text-slate-500">
                                No tasks have been created for this event.
                            </p>

                        ) : (

                            <div className="overflow-x-auto">

                                <table className="w-full text-sm">

                                    <thead>

                                        <tr className="border-b border-slate-200">

                                            <th className="text-left py-3 px-3">
                                                Task
                                            </th>

                                            <th className="text-left py-3 px-3">
                                                Assigned To
                                            </th>

                                            <th className="text-left py-3 px-3">
                                                Due Date
                                            </th>

                                            <th className="text-left py-3 px-3">
                                                Category
                                            </th>

                                            <th className="text-left py-3 px-3">
                                                Priority
                                            </th>

                                            <th className="text-left py-3 px-3">
                                                Status
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {tasks.map(
                                            (task) => (

                                                <tr
                                                    key={task.id}
                                                    className="border-b border-slate-100"
                                                >

                                                    <td className="py-3 px-3 font-medium text-slate-800">
                                                        {task.title}
                                                    </td>

                                                    <td className="py-3 px-3 text-slate-600">
                                                        {task.assigned_user || "Unassigned"}
                                                    </td>

                                                    <td className="py-3 px-3 text-slate-600">
                                                        {formatDateTime(task.due_date)}
                                                    </td>

                                                    <td className="py-3 px-3 text-slate-600">
                                                        {task.category || "-"}
                                                    </td>

                                                    <td className="py-3 px-3">

                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityClass(task.priority)}`}
                                                        >
                                                            {task.priority || "Medium"}
                                                        </span>

                                                    </td>

                                                    <td className="py-3 px-3">

                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(task.status)}`}
                                                        >
                                                            {task.status || "Pending"}
                                                        </span>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>


                    {/* ==================================
                        COMMITTEE
                    ================================== */}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

                        <h2 className="text-xl font-bold text-slate-800 mb-5">
                            Committee Members
                        </h2>


                        {committeeMembers.length === 0 ? (

                            <p className="text-slate-500">
                                No committee members assigned.
                            </p>

                        ) : (

                            <div className="overflow-x-auto">

                                <table className="w-full text-sm">

                                    <thead>

                                        <tr className="border-b border-slate-200">

                                            <th className="text-left py-3 px-3">
                                                Member
                                            </th>

                                            <th className="text-left py-3 px-3">
                                                Email
                                            </th>

                                            <th className="text-left py-3 px-3">
                                                Position
                                            </th>

                                            <th className="text-left py-3 px-3">
                                                Assigned
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {committeeMembers.map(
                                            (member) => (

                                                <tr
                                                    key={member.id}
                                                    className="border-b border-slate-100"
                                                >

                                                    <td className="py-3 px-3 font-medium text-slate-800">
                                                        {member.full_name}
                                                    </td>

                                                    <td className="py-3 px-3 text-slate-600">
                                                        {member.email}
                                                    </td>

                                                    <td className="py-3 px-3">

                                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                                            {member.position_name}
                                                        </span>

                                                    </td>

                                                    <td className="py-3 px-3 text-slate-600">
                                                        {formatDateTime(member.assigned_at)}
                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>


                    {/* ==================================
                        RESOURCE BOOKINGS
                    ================================== */}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

                        <h2 className="text-xl font-bold text-slate-800 mb-5">
                            Resource Bookings
                        </h2>


                        {resourceBookings.length === 0 ? (

                            <p className="text-slate-500">
                                No resources have been booked for this event.
                            </p>

                        ) : (

                            <div className="overflow-x-auto">

                                <table className="w-full text-sm">

                                    <thead>

                                        <tr className="border-b border-slate-200">

                                            <th className="text-left py-3 px-3">
                                                Resource
                                            </th>

                                            <th className="text-left py-3 px-3">
                                                Type
                                            </th>

                                            <th className="text-left py-3 px-3">
                                                Start
                                            </th>

                                            <th className="text-left py-3 px-3">
                                                End
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {resourceBookings.map(
                                            (booking) => (

                                                <tr
                                                    key={booking.id}
                                                    className="border-b border-slate-100"
                                                >

                                                    <td className="py-3 px-3 font-medium text-slate-800">
                                                        {booking.resource_name}
                                                    </td>

                                                    <td className="py-3 px-3">

                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                            {booking.resource_type}
                                                        </span>

                                                    </td>

                                                    <td className="py-3 px-3 text-slate-600">
                                                        {formatDateTime(
                                                            booking.start_datetime
                                                        )}
                                                    </td>

                                                    <td className="py-3 px-3 text-slate-600">
                                                        {formatDateTime(
                                                            booking.end_datetime
                                                        )}
                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>


                    {/* ==================================
                        REGISTRATION SUMMARY
                    ================================== */}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

                        <h2 className="text-xl font-bold text-slate-800 mb-5">
                            Registration Summary
                        </h2>


                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


                            <div className="p-5 rounded-xl bg-blue-50">

                                <p className="text-sm text-blue-600">
                                    Registered
                                </p>

                                <p className="text-3xl font-bold text-blue-700 mt-1">
                                    {registrationSummary.total}
                                </p>

                            </div>


                            <div className="p-5 rounded-xl bg-slate-50">

                                <p className="text-sm text-slate-600">
                                    Capacity
                                </p>

                                <p className="text-3xl font-bold text-slate-700 mt-1">
                                    {registrationSummary.capacity}
                                </p>

                            </div>


                            <div className="p-5 rounded-xl bg-green-50">

                                <p className="text-sm text-green-600">
                                    Available Seats
                                </p>

                                <p className="text-3xl font-bold text-green-700 mt-1">
                                    {registrationSummary.available}
                                </p>

                            </div>

                        </div>


                        <div className="mt-5">

                            <div className="flex justify-between text-sm mb-2">

                                <span className="text-slate-500">
                                    Registration Progress
                                </span>

                                <span className="font-semibold text-slate-700">
                                    {registrationSummary.percentage}%
                                </span>

                            </div>


                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

                                <div
                                    className="h-full bg-blue-600 rounded-full"
                                    style={{
                                        width:
                                            `${Math.min(
                                                registrationSummary.percentage,
                                                100
                                            )}%`
                                    }}
                                />

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        FOOTER
                    ================================== */}

                    <div className="text-center text-sm text-slate-400 py-6">

                        EVENTORA Event Management System

                        <br />

                        Event Management Report

                    </div>

                </div>

            </div>

        );

    }


    // ==================================================
    // LOADING SINGLE REPORT
    // ==================================================

    if (loadingReport) {

        return (

            <div className="min-h-screen bg-slate-50 p-6">

                <div className="max-w-7xl mx-auto">

                    <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">

                        <div className="text-4xl mb-4">
                            📊
                        </div>

                        <h2 className="text-xl font-bold text-slate-800">
                            Generating Event Report
                        </h2>

                        <p className="text-slate-500 mt-2">
                            Please wait while EVENTORA prepares the report.
                        </p>

                    </div>

                </div>

            </div>

        );

    }


    // ==================================================
    // EVENTS PAGE
    // ==================================================

    return (
        <>
              <OrganizerNavbar /> 
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">

            <div className="max-w-7xl mx-auto">


                {/* ==================================
                    PAGE HEADER
                ================================== */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                        EVENTORA
                    </p>

                    <h1 className="text-3xl font-bold text-slate-800 mt-1">
                        Event Reports
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Select an event to generate its management report.
                    </p>

                </div>


                {/* ==================================
                    ERROR
                ================================== */}

                {error && (

                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">

                        ⚠️ {error}

                    </div>

                )}


                {/* ==================================
                    NO EVENTS
                ================================== */}

                {events.length === 0 ? (

                    <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">

                        <div className="text-5xl mb-4">
                            📅
                        </div>

                        <h2 className="text-xl font-bold text-slate-800">
                            No Events Found
                        </h2>

                        <p className="text-slate-500 mt-2">
                            Create an event first to generate a report.
                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {events.map(
                            (event) => (

                                <div
                                    key={event.id}
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
                                >

                                    {/* EVENT TOP */}

                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">

                                        <div className="flex items-start justify-between gap-3">

                                            <div>

                                                <p className="text-xs uppercase tracking-wide text-blue-100">
                                                    EVENT
                                                </p>

                                                <h2 className="text-xl font-bold mt-1">
                                                    {event.title}
                                                </h2>

                                            </div>


                                            <div className="text-3xl">
                                                📊
                                            </div>

                                        </div>

                                    </div>


                                    {/* EVENT BODY */}

                                    <div className="p-6">


                                        {/* DATE */}

                                        <div className="flex items-center gap-3 mb-3">

                                            <span className="text-xl">
                                                📅
                                            </span>

                                            <div>

                                                <p className="text-xs text-slate-400">
                                                    Date
                                                </p>

                                                <p className="font-semibold text-slate-700">
                                                    {formatDate(
                                                        event.event_date
                                                    )}
                                                </p>

                                            </div>

                                        </div>


                                        {/* TIME */}

                                        <div className="flex items-center gap-3 mb-3">

                                            <span className="text-xl">
                                                🕐
                                            </span>

                                            <div>

                                                <p className="text-xs text-slate-400">
                                                    Time
                                                </p>

                                                <p className="font-semibold text-slate-700">
                                                    {event.event_time || "-"}
                                                </p>

                                            </div>

                                        </div>


                                        {/* LOCATION */}

                                        <div className="flex items-center gap-3 mb-5">

                                            <span className="text-xl">
                                                📍
                                            </span>

                                            <div>

                                                <p className="text-xs text-slate-400">
                                                    Location
                                                </p>

                                                <p className="font-semibold text-slate-700">
                                                    {event.location || "-"}
                                                </p>

                                            </div>

                                        </div>


                                        {/* QUICK STATS */}

                                        <div className="grid grid-cols-2 gap-3 mb-5">


                                            <div className="bg-blue-50 rounded-xl p-3">

                                                <p className="text-xs text-blue-600">
                                                    Registrations
                                                </p>

                                                <p className="text-xl font-bold text-blue-700">
                                                    {event.registration_count}
                                                </p>

                                            </div>


                                            <div className="bg-orange-50 rounded-xl p-3">

                                                <p className="text-xs text-orange-600">
                                                    Tasks
                                                </p>

                                                <p className="text-xl font-bold text-orange-700">
                                                    {event.task_count}
                                                </p>

                                            </div>


                                            <div className="bg-purple-50 rounded-xl p-3">

                                                <p className="text-xs text-purple-600">
                                                    Committee
                                                </p>

                                                <p className="text-xl font-bold text-purple-700">
                                                    {event.committee_count}
                                                </p>

                                            </div>


                                            <div className="bg-green-50 rounded-xl p-3">

                                                <p className="text-xs text-green-600">
                                                    Resources
                                                </p>

                                                <p className="text-xl font-bold text-green-700">
                                                    {event.resource_booking_count}
                                                </p>

                                            </div>

                                        </div>


                                        {/* GENERATE BUTTON */}

                                        <button
                                            onClick={() =>
                                                generateReport(event.id)
                                            }
                                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                                        >
                                            📊 Generate Report
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


export default Report;

