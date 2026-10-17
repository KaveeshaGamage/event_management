import React, { useEffect, useState } from "react";

import {
    getEventTasks,
    deleteTask,
    updateTask,
} from "../services/calendarApi";

function EventTasks({ eventId }) {

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadTasks();
    }, [eventId]);

    const loadTasks = async () => {
        try {
            setLoading(true);

            const response = await getEventTasks(eventId);

            setTasks(response.data || response);
        } catch (err) {
            console.error(err);
            setError("Failed to load tasks.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this task?")) {
            return;
        }

        try {
            await deleteTask(id);

            setTasks((previous) =>
                previous.filter((task) => task.id !== id)
            );

        } catch (err) {
            console.error(err);
            alert("Failed to delete task.");
        }
    };

    const handleStatusChange = async (task, status) => {

        try {

            await updateTask(task.id, {
                ...task,
                status,
            });

            setTasks((previous) =>
                previous.map((item) =>
                    item.id === task.id
                        ? { ...item, status }
                        : item
                )
            );

        } catch (err) {
            console.error(err);
            alert("Failed to update task.");
        }
    };

    const priorityStyle = {
        Low: "bg-green-100 text-green-700",
        Medium: "bg-yellow-100 text-yellow-700",
        High: "bg-red-100 text-red-700",
    };

    const statusStyle = {
        Pending: "bg-slate-100 text-slate-700",
        "In Progress": "bg-blue-100 text-blue-700",
        Completed: "bg-green-100 text-green-700",
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500">
                Loading tasks...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">

            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Event Tasks
                            </h1>

                            <p className="text-slate-500 mt-1">
                                Manage deadlines and task ownership.
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                window.location.href =
                                `/events/${eventId}/tasks/create`
                            }
                            className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                        >
                            + Create Task
                        </button>

                    </div>

                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-5">
                        {error}
                    </div>
                )}

                {/* Empty */}
                {tasks.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">

                        <div className="text-5xl mb-4">
                            📋
                        </div>

                        <h2 className="text-xl font-semibold text-slate-800">
                            No tasks yet
                        </h2>

                        <p className="text-slate-500 mt-2">
                            Create the first task for this event.
                        </p>

                    </div>
                ) : (

                    <div className="grid gap-4">

                        {tasks.map((task) => (

                            <div
                                key={task.id}
                                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 hover:shadow-md transition"
                            >

                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                                    <div className="flex-1">

                                        <div className="flex flex-wrap items-center gap-2">

                                            <h2 className="text-lg font-bold text-slate-800">
                                                {task.title}
                                            </h2>

                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${priorityStyle[task.priority] ||
                                                    "bg-slate-100 text-slate-700"
                                                    }`}
                                            >
                                                {task.priority}
                                            </span>

                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[task.status] ||
                                                    "bg-slate-100 text-slate-700"
                                                    }`}
                                            >
                                                {task.status}
                                            </span>

                                        </div>

                                        <p className="text-slate-600 mt-2">
                                            {task.description ||
                                                "No description"}
                                        </p>

                                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">

                                            <span>
                                                📅 {task.due_date || "No deadline"}
                                            </span>

                                            <span>
                                                🏷️ {task.category || "Other"}
                                            </span>

                                            <span>
                                                👤 {task.assigned_name ||
                                                    "Unassigned"}
                                            </span>

                                        </div>

                                    </div>

                                    {/* Controls */}
                                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2">

                                        <select
                                            value={task.status}
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    task,
                                                    e.target.value
                                                )
                                            }
                                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option>Pending</option>
                                            <option>In Progress</option>
                                            <option>Completed</option>
                                        </select>

                                        <button
                                            onClick={() =>
                                                handleDelete(task.id)
                                            }
                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium"
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>
                )}

            </div>
        </div>
    );
}

export default EventTasks;