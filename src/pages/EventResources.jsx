import React, { useEffect, useState } from "react";

import {
    getResources,
    createResource,
    deleteResource,
} from "../services/calendarApi";

function EventResources({ eventId }) {

    const [resources, setResources] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        name: "",
        type: "Equipment",
        description: "",
    });

    const loadResources = async () => {

        try {

            const response = await getResources();

            setResources(response.data || response);

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadResources();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await createResource(form);

            setForm({
                name: "",
                type: "Equipment",
                description: "",
            });

            setShowForm(false);

            loadResources();

        } catch (error) {
            console.error(error);
            alert("Failed to create resource.");
        }
    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this resource?")) {
            return;
        }

        try {

            await deleteResource(id);

            setResources((previous) =>
                previous.filter((resource) => resource.id !== id)
            );

        } catch (error) {
            console.error(error);
            alert("Failed to delete resource.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">

            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Event Resources
                            </h1>

                            <p className="text-slate-500 mt-1">
                                Manage venues, equipment, staff and other resources.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                        >
                            {showForm ? "Cancel" : "+ Add Resource"}
                        </button>

                    </div>

                </div>

                {/* Form */}
                {showForm && (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6"
                    >

                        <h2 className="text-lg font-bold text-slate-800 mb-5">
                            Add Resource
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Resource name"
                                required
                                className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className="border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option>Venue</option>
                                <option>Equipment</option>
                                <option>Staff</option>
                                <option>Vehicle</option>
                                <option>Other</option>
                            </select>

                        </div>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Description"
                            rows="3"
                            className="w-full mt-5 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />

                        <button
                            type="submit"
                            className="mt-5 px-5 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
                        >
                            Save Resource
                        </button>

                    </form>
                )}

                {/* Resource Cards */}
                {resources.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <div className="text-5xl mb-4">📦</div>

                        <h2 className="text-xl font-bold text-slate-800">
                            No resources
                        </h2>

                        <p className="text-slate-500 mt-2">
                            Add resources that can be booked for events.
                        </p>
                    </div>
                ) : (

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                        {resources.map((resource) => (

                            <div
                                key={resource.id}
                                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 hover:shadow-md transition"
                            >

                                <div className="flex items-start justify-between gap-3">

                                    <div>

                                        <h2 className="text-lg font-bold text-slate-800">
                                            {resource.name}
                                        </h2>

                                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                            {resource.type}
                                        </span>

                                    </div>

                                    <button
                                        onClick={() =>
                                            handleDelete(resource.id)
                                        }
                                        className="text-red-500 hover:text-red-700 font-medium"
                                    >
                                        Delete
                                    </button>

                                </div>

                                <p className="text-slate-500 mt-4">
                                    {resource.description ||
                                        "No description"}
                                </p>

                            </div>

                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}

export default EventResources;