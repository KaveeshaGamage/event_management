import React, { useEffect, useState } from "react";

import {
    createTask,
    getCommitteeMembers,
} from "../services/calendarApi";

function CreateTask({ eventId }) {

    const [members, setMembers] = useState([]);

    const [form, setForm] = useState({
        title: "",
        description: "",
        due_date: "",
        category: "Other",
        priority: "Medium",
        status: "Pending",
        assigned_to: "",
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadMembers();
    }, [eventId]);

    const loadMembers = async () => {

    try {

        if (!eventId) {
            setMembers([]);
            return;
        }

        const response = await getCommitteeMembers(eventId);

        console.log(
            "Members loaded for event:",
            eventId,
            response
        );

        if (Array.isArray(response)) {
            setMembers(response);
        } else if (Array.isArray(response.members)) {
            setMembers(response.members);
        } else {
            setMembers([]);
        }

    } catch (error) {

        console.error(
            "Failed to load committee members:",
            error
        );

        setMembers([]);
    }
};
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);

            await createTask(eventId, {
                ...form,
                assigned_to:
                    form.assigned_to === ""
                        ? null
                        : Number(form.assigned_to),
            });

            window.location.href = `/events/${eventId}/tasks`;

        } catch (error) {
            console.error(error);
            alert("Failed to create task.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">

            <div className="max-w-3xl mx-auto">

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="bg-blue-600 px-6 py-5 text-white">

                        <h1 className="text-2xl font-bold">
                            Create Task
                        </h1>

                        <p className="text-blue-100 mt-1">
                            Add a task and assign it to a committee member.
                        </p>

                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="p-6 space-y-5"
                    >

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Task Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                placeholder="Enter task title"
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Describe the task..."
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>

                        {/* Date + Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Due Date
                                </label>

                                <input
                                    type="datetime-local"
                                    name="due_date"
                                    value={form.due_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Category
                                </label>

                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option>Marketing</option>
                                    <option>Logistics</option>
                                    <option>Finance</option>
                                    <option>Committee</option>
                                    <option>Documentation</option>
                                    <option>Technical</option>
                                    <option>Other</option>
                                </select>
                            </div>

                        </div>

                        {/* Priority + Member */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Priority
                                </label>

                                <select
                                    name="priority"
                                    value={form.priority}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Assign To
                                </label>

                                <select
                                    name="assigned_to"
                                    value={form.assigned_to}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">
                                        Unassigned
                                    </option>

                                    {members.map((member) => (
                                        <option
                                            key={member.id}
                                            value={member.id}
                                        >
                                            {member.full_name ||
                                                member.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {saving
                                    ? "Creating..."
                                    : "Create Task"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    window.location.href =
                                    `/events/${eventId}/tasks`
                                }
                                className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default CreateTask;