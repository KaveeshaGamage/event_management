import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    getDashboard
} from "../services/dashboardApi";

import OrganizerNavbar
    from "../components/OrganizerNavbar";


function OrganizerDashboard() {

    const navigate =
        useNavigate();


    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ======================================================
    // LOAD DASHBOARD
    // ======================================================

    useEffect(() => {

        const loadDashboard =
            async () => {

                try {

                    setLoading(true);

                    setError("");


                    const data =
                        await getDashboard();


                    setDashboard(data);

                } catch (error) {

                    console.error(
                        "Dashboard loading error:",
                        error
                    );

                    setError(
                        error.response?.data?.message ||
                        "Failed to load dashboard."
                    );

                } finally {

                    setLoading(false);

                }

            };


        loadDashboard();

    }, []);


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-100">

                <OrganizerNavbar />

                <div className="flex min-h-[70vh] items-center justify-center">

                    <div className="text-center">

                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div>

                        <p className="text-slate-600">
                            Loading dashboard...
                        </p>

                    </div>

                </div>

            </div>

        );

    }


    // ======================================================
    // ERROR
    // ======================================================

    if (error) {

        return (

            <div className="min-h-screen bg-slate-100">

                <OrganizerNavbar />

                <div className="mx-auto max-w-6xl px-4 py-8">

                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">

                        {error}

                    </div>

                </div>

            </div>

        );

    }


    // ======================================================
    // DATA
    // ======================================================

    const {

        summary = {},

        upcomingEventsList = [],

        recentTasks = [],

        taskCategories = [],

        committeeMembersList = [],

        committeeEventList = [],

        chatEvents = []

    } = dashboard || {};


    // ======================================================
    // FORMAT DATE
    // ======================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    };


    // ======================================================
    // FORMAT TIME
    // ======================================================

    const formatTime = (time) => {

        if (!time) {
            return "";
        }

        return new Date(
            `1970-01-01T${time}`
        ).toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // ======================================================
    // STATUS CLASS
    // ======================================================

    const getStatusClass = (status) => {

        switch (status) {

            case "Completed":
                return "bg-green-100 text-green-700";

            case "In Progress":
                return "bg-blue-100 text-blue-700";

            case "Pending":
                return "bg-yellow-100 text-yellow-700";

            default:
                return "bg-slate-100 text-slate-700";

        }

    };


    // ======================================================
    // RENDER
    // ======================================================

    return (

        <div className="min-h-screen bg-slate-100">

            <OrganizerNavbar />


            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-slate-800">
                        Organizer Dashboard
                    </h1>

                    <p className="mt-1 text-slate-500">
                        Manage your events, tasks, committee members and team communication.
                    </p>

                </div>


                {/* ==================================================
                    SUMMARY CARDS
                ================================================== */}

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">


                    {/* TOTAL EVENTS */}

                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500">
                                    Total Events
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                    {summary.totalEvents || 0}
                                </h2>

                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                                📅
                            </div>

                        </div>

                        <p className="mt-3 text-sm text-slate-500">
                            {summary.upcomingEvents || 0} upcoming
                        </p>

                    </div>


                    {/* REGISTRATIONS */}

                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500">
                                    Registrations
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                    {summary.totalRegistrations || 0}
                                </h2>

                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                                👥
                            </div>

                        </div>

                        <p className="mt-3 text-sm text-slate-500">
                            {summary.registrationPercentage || 0}% capacity filled
                        </p>

                    </div>


                    {/* TASKS */}

                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500">
                                    Total Tasks
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                    {summary.totalTasks || 0}
                                </h2>

                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                                ✓
                            </div>

                        </div>

                        <p className="mt-3 text-sm text-slate-500">
                            {summary.pendingTasks || 0} pending
                        </p>

                    </div>


                    {/* RESOURCES */}

                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500">
                                    Resource Bookings
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                    {summary.resourceBookings || 0}
                                </h2>

                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                                📦
                            </div>

                        </div>

                        <p className="mt-3 text-sm text-slate-500">
                            {summary.committeeMembers || 0} committee assignments
                        </p>

                    </div>

                </div>


                {/* ==================================================
                    TASK STATUS
                ================================================== */}

                <div className="mt-6 grid gap-5 sm:grid-cols-3">


                    <div className="rounded-xl bg-white p-5 shadow-sm">

                        <p className="text-sm text-slate-500">
                            Pending
                        </p>

                        <p className="mt-2 text-2xl font-bold text-yellow-600">
                            {summary.pendingTasks || 0}
                        </p>

                    </div>


                    <div className="rounded-xl bg-white p-5 shadow-sm">

                        <p className="text-sm text-slate-500">
                            In Progress
                        </p>

                        <p className="mt-2 text-2xl font-bold text-blue-600">
                            {summary.inProgressTasks || 0}
                        </p>

                    </div>


                    <div className="rounded-xl bg-white p-5 shadow-sm">

                        <p className="text-sm text-slate-500">
                            Completed
                        </p>

                        <p className="mt-2 text-2xl font-bold text-green-600">
                            {summary.completedTasks || 0}
                        </p>

                    </div>

                </div>


                {/* ==================================================
                    UPCOMING EVENTS
                ================================================== */}

                <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

                    <div className="mb-5 flex items-center justify-between">

                        <div>

                            <h2 className="text-xl font-bold text-slate-800">
                                Upcoming Events
                            </h2>

                            <p className="text-sm text-slate-500">
                                Events created by you
                            </p>

                        </div>

                        <button
                            onClick={() =>
                                navigate("/my-events")
                            }
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                            View All
                        </button>

                    </div>


                    {upcomingEventsList.length === 0 ? (

                        <div className="rounded-xl bg-slate-50 p-8 text-center">

                            <div className="mb-2 text-4xl">
                                📅
                            </div>

                            <p className="font-medium text-slate-700">
                                No upcoming events
                            </p>

                        </div>

                    ) : (

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                            {upcomingEventsList.map(
                                (event) => (

                                    <div
                                        key={event.id}
                                        className="rounded-xl border border-slate-200 p-5 transition hover:shadow-md"
                                    >

                                        <div className="mb-3 flex items-start justify-between">

                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                {event.category || "General"}
                                            </span>

                                            <span className="text-xs text-slate-500">
                                                {event.registration_count || 0} registered
                                            </span>

                                        </div>


                                        <h3 className="text-lg font-bold text-slate-800">
                                            {event.title}
                                        </h3>


                                        <div className="mt-3 space-y-2 text-sm text-slate-500">

                                            <p>
                                                📅 {formatDate(event.event_date)}
                                            </p>

                                            <p>
                                                🕐 {formatTime(event.event_time)}
                                            </p>

                                            <p>
                                                📍 {event.location}
                                            </p>

                                        </div>


                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/events/${event.id}/chat`
                                                )
                                            }
                                            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                        >
                                            💬 Open Event Chat
                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* ==================================================
                    COMMITTEE EVENTS
                ================================================== */}

                <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

                    <div className="mb-5">

                        <h2 className="text-xl font-bold text-slate-800">
                            My Committee Events
                        </h2>

                        <p className="text-sm text-slate-500">
                            Events where you are assigned as a committee member
                        </p>

                    </div>


                    {committeeEventList.length === 0 ? (

                        <div className="rounded-xl bg-slate-50 p-8 text-center">

                            <div className="mb-2 text-4xl">
                                👥
                            </div>

                            <p className="font-medium text-slate-700">
                                No committee assignments
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                You are not currently assigned to any event committee.
                            </p>

                        </div>

                    ) : (

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                            {committeeEventList.map(
                                (event) => (

                                    <div
                                        key={event.id}
                                        className="rounded-xl border border-slate-200 p-5"
                                    >

                                        <div className="flex items-start justify-between">

                                            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                                                Committee Member
                                            </span>

                                        </div>


                                        <h3 className="mt-3 text-lg font-bold text-slate-800">
                                            {event.title}
                                        </h3>


                                        <p className="mt-2 text-sm font-medium text-blue-600">
                                            Position: {event.committee_position}
                                        </p>


                                        <div className="mt-3 space-y-2 text-sm text-slate-500">

                                            <p>
                                                📅 {formatDate(event.event_date)}
                                            </p>

                                            <p>
                                                🕐 {formatTime(event.event_time)}
                                            </p>

                                            <p>
                                                📍 {event.location}
                                            </p>

                                            <p>
                                                👤 Organizer: {event.organizer_name}
                                            </p>

                                        </div>


                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/events/${event.id}/chat`
                                                )
                                            }
                                            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                        >
                                            💬 Open Event Chat
                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* ==================================================
                    EVENT GROUP CHATS
                ================================================== */}

                <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

                    <div className="mb-5">

                        <h2 className="text-xl font-bold text-slate-800">
                            💬 Event Group Chats
                        </h2>

                        <p className="text-sm text-slate-500">
                            Chat with organizers and committee members
                        </p>

                    </div>


                    {chatEvents.length === 0 ? (

                        <div className="rounded-xl bg-slate-50 p-8 text-center">

                            <div className="mb-2 text-4xl">
                                💬
                            </div>

                            <p className="font-medium text-slate-700">
                                No event chats available
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-3">

                            {chatEvents.map(
                                (event) => (

                                    <div
                                        key={event.id}
                                        className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 transition hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                                    >

                                        <div>

                                            <div className="flex flex-wrap items-center gap-2">

                                                <h3 className="font-semibold text-slate-800">
                                                    {event.title}
                                                </h3>

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        event.user_role === "Organizer"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-purple-100 text-purple-700"
                                                    }`}
                                                >
                                                    {event.user_role}
                                                </span>

                                            </div>


                                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">

                                                <span>
                                                    📅 {formatDate(event.event_date)}
                                                </span>

                                                <span>
                                                    📍 {event.location}
                                                </span>

                                            </div>

                                        </div>


                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/events/${event.id}/chat`
                                                )
                                            }
                                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                        >
                                            💬 Open Chat
                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* ==================================================
                    COMMITTEE MEMBERS
                ================================================== */}

                <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

                    <div className="mb-5 flex items-center justify-between">

                        <div>

                            <h2 className="text-xl font-bold text-slate-800">
                                Committee Members
                            </h2>

                            <p className="text-sm text-slate-500">
                                Committee members assigned to your events
                            </p>

                        </div>

                        <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                            {committeeMembersList.length} assignments
                        </div>

                    </div>


                    {committeeMembersList.length === 0 ? (

                        <div className="rounded-xl bg-slate-50 p-8 text-center">

                            <div className="mb-2 text-4xl">
                                👥
                            </div>

                            <p className="font-medium text-slate-700">
                                No committee members assigned
                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="min-w-full">

                                <thead>

                                    <tr className="border-b border-slate-200 text-left">

                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                            Member
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                            Email
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                            Position
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                            Event
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {committeeMembersList.map(
                                        (member) => (

                                            <tr
                                                key={member.id}
                                                className="border-b border-slate-100 last:border-0"
                                            >

                                                <td className="px-4 py-4">

                                                    <div className="font-medium text-slate-800">
                                                        {member.member_name}
                                                    </div>

                                                </td>


                                                <td className="px-4 py-4 text-sm text-slate-500">
                                                    {member.email}
                                                </td>


                                                <td className="px-4 py-4">

                                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                                                        {member.position_name}
                                                    </span>

                                                </td>


                                                <td className="px-4 py-4 text-sm font-medium text-slate-700">
                                                    {member.event_title}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* ==================================================
                    TASKS + CATEGORIES
                ================================================== */}

                <div className="mt-8 grid gap-6 lg:grid-cols-2">


                    {/* RECENT TASKS */}

                    <section className="rounded-2xl bg-white p-6 shadow-sm">

                        <div className="mb-5">

                            <h2 className="text-xl font-bold text-slate-800">
                                Upcoming Tasks
                            </h2>

                            <p className="text-sm text-slate-500">
                                Tasks that need attention
                            </p>

                        </div>


                        {recentTasks.length === 0 ? (

                            <div className="rounded-xl bg-slate-50 p-6 text-center">

                                <p className="text-sm text-slate-500">
                                    No tasks available.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-3">

                                {recentTasks.map(
                                    (task) => (

                                        <div
                                            key={task.id}
                                            className="rounded-xl border border-slate-200 p-4"
                                        >

                                            <div className="flex items-start justify-between gap-3">

                                                <div>

                                                    <h3 className="font-semibold text-slate-800">
                                                        {task.title}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {task.event_title}
                                                    </p>

                                                </div>


                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(task.status)}`}
                                                >
                                                    {task.status}
                                                </span>

                                            </div>


                                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">

                                                <span>
                                                    📅 {formatDate(task.due_date)}
                                                </span>

                                                <span>
                                                    Priority: {task.priority}
                                                </span>

                                                <span>
                                                    {task.assigned_user
                                                        ? `Assigned: ${task.assigned_user}`
                                                        : "Unassigned"}
                                                </span>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </section>


                    {/* TASK CATEGORIES */}

                    <section className="rounded-2xl bg-white p-6 shadow-sm">

                        <div className="mb-5">

                            <h2 className="text-xl font-bold text-slate-800">
                                Task Categories
                            </h2>

                            <p className="text-sm text-slate-500">
                                Distribution of your event tasks
                            </p>

                        </div>


                        {taskCategories.length === 0 ? (

                            <div className="rounded-xl bg-slate-50 p-6 text-center">

                                <p className="text-sm text-slate-500">
                                    No task categories available.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-4">

                                {taskCategories.map(
                                    (category) => (

                                        <div
                                            key={category.category}
                                        >

                                            <div className="mb-1 flex justify-between">

                                                <span className="text-sm font-medium text-slate-700">
                                                    {category.category}
                                                </span>

                                                <span className="text-sm font-semibold text-slate-800">
                                                    {category.total}
                                                </span>

                                            </div>


                                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                                <div
                                                    className="h-full rounded-full bg-blue-600"
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            (Number(category.total) /
                                                                Math.max(
                                                                    Number(summary.totalTasks) || 1,
                                                                    1
                                                                )) * 100
                                                        )}%`
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </section>

                </div>


                {/* ==================================================
                    REGISTRATION OVERVIEW
                ================================================== */}

                <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

                    <div className="mb-5">

                        <h2 className="text-xl font-bold text-slate-800">
                            Event Registration Overview
                        </h2>

                        <p className="text-sm text-slate-500">
                            Registration information for your events
                        </p>

                    </div>


                    {dashboard?.events?.length === 0 ? (

                        <div className="rounded-xl bg-slate-50 p-8 text-center">

                            <p className="text-slate-500">
                                No events available.
                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="min-w-full">

                                <thead>

                                    <tr className="border-b border-slate-200 text-left">

                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                            Event
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                            Date
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                            Location
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                            Registrations
                                        </th>

                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                                            Capacity
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {dashboard?.events?.map(
                                        (event) => (

                                            <tr
                                                key={event.id}
                                                className="border-b border-slate-100 last:border-0"
                                            >

                                                <td className="px-4 py-4">

                                                    <p className="font-medium text-slate-800">
                                                        {event.title}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {event.category || "General"}
                                                    </p>

                                                </td>


                                                <td className="px-4 py-4 text-sm text-slate-600">
                                                    {formatDate(event.event_date)}
                                                </td>


                                                <td className="px-4 py-4 text-sm text-slate-600">
                                                    {event.location}
                                                </td>


                                                <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                                                    {event.registration_count || 0}
                                                </td>


                                                <td className="px-4 py-4 text-sm text-slate-600">
                                                    {event.capacity}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* ==================================================
                    FOOTER
                ================================================== */}

                <div className="py-8 text-center text-sm text-slate-400">

                    EVENTORA Event Management System

                </div>

            </main>

        </div>

    );

}


export default OrganizerDashboard;