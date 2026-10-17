import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function EventCommittee() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [committee, setCommittee] = useState([]);
    const [positions, setPositions] = useState([]);
    const [users, setUsers] = useState([]);

    const [selectedUser, setSelectedUser] = useState("");
    const [selectedPosition, setSelectedPosition] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editingPosition, setEditingPosition] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!eventId) {
            setError("Event ID is missing.");
            setLoading(false);
            return;
        }

        fetchData();
    }, [eventId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                committeeResponse,
                positionsResponse,
                usersResponse
            ] = await Promise.all([
                fetch(`${API_URL}/committee/events/${eventId}/members`),
                fetch(`${API_URL}/committee/positions`),
                fetch(`${API_URL}/users`)
            ]);

            const committeeData = await committeeResponse.json();
            const positionsData = await positionsResponse.json();
            const usersData = await usersResponse.json();

            if (!committeeResponse.ok) {
                throw new Error(
                    committeeData.message ||
                    "Failed to fetch committee members"
                );
            }

            if (!positionsResponse.ok) {
                throw new Error(
                    positionsData.message ||
                    "Failed to fetch positions"
                );
            }

            if (!usersResponse.ok) {
                throw new Error(
                    usersData.message ||
                    "Failed to fetch users"
                );
            }

            setCommittee(committeeData);
            setPositions(positionsData);
            setUsers(usersData);

        } catch (err) {
            console.error("Fetch committee data error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addCommitteeMember = async (e) => {
        e.preventDefault();

        if (!selectedUser || !selectedPosition) {
            setError("Please select a member and position.");
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/committee/events/${eventId}/members`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: Number(selectedUser),
                        position_id: Number(selectedPosition)
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to add committee member"
                );
            }

            setMessage("Committee member added successfully.");
            setSelectedUser("");
            setSelectedPosition("");

            fetchData();

        } catch (err) {
            console.error("Add committee member error:", err);
            setError(err.message);
        }
    };

    const startEditing = (member) => {
        setEditingId(member.id);
        setEditingPosition(member.position_id);
        setError("");
        setMessage("");
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingPosition("");
    };

    const updateCommitteeMember = async (memberId) => {
        if (!editingPosition) {
            setError("Please select a position.");
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/committee/members/${memberId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        position_id: Number(editingPosition)
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update committee member"
                );
            }

            setMessage("Committee member updated successfully.");
            setEditingId(null);
            setEditingPosition("");

            fetchData();

        } catch (err) {
            console.error("Update committee member error:", err);
            setError(err.message);
        }
    };

    const removeCommitteeMember = async (memberId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to remove this committee member?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/committee/members/${memberId}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to remove committee member"
                );
            }

            setMessage("Committee member removed successfully.");

            fetchData();

        } catch (err) {
            console.error("Remove committee member error:", err);
            setError(err.message);
        }
    };

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

                    <p className="text-slate-600 font-medium">
                        Loading committee...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ================= HEADER ================= */}

            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

                        <div>
                            <div className="flex items-center gap-3 mb-2">

                                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-2xl">
                                    👥
                                </div>

                                <h1 className="text-3xl font-bold">
                                    Event Committee
                                </h1>

                            </div>

                            <p className="text-blue-100">
                                Manage committee members and their positions.
                            </p>

                        </div>

                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition shadow-sm"
                        >
                            ← Back
                        </button>

                    </div>

                </div>
            </div>


            {/* ================= MAIN CONTENT ================= */}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* ================= ALERTS ================= */}

                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">

                        <span className="text-lg">
                            ⚠️
                        </span>

                        <div>
                            <p className="font-semibold">
                                Error
                            </p>

                            <p className="text-sm mt-1">
                                {error}
                            </p>
                        </div>

                    </div>
                )}


                {message && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-green-700">

                        <span className="text-lg">
                            ✓
                        </span>

                        <div>
                            <p className="font-semibold">
                                Success
                            </p>

                            <p className="text-sm mt-1">
                                {message}
                            </p>
                        </div>

                    </div>
                )}


                {/* ================= ADD MEMBER ================= */}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8">

                    <div className="px-6 py-5 border-b border-slate-200">

                        <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                                +
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    Add Committee Member
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Assign a member to a committee position.
                                </p>
                            </div>

                        </div>

                    </div>


                    <form
                        onSubmit={addCommitteeMember}
                        className="p-6"
                    >

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* MEMBER */}

                            <div>

                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Select Member
                                </label>

                                <select
                                    value={selectedUser}
                                    onChange={(e) =>
                                        setSelectedUser(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                >

                                    <option value="">
                                        -- Select Member --
                                    </option>

                                    {users
                                        .filter(
                                            user =>
                                                !committee.some(
                                                    member =>
                                                        member.user_id ===
                                                        user.id
                                                )
                                        )
                                        .map(user => (

                                            <option
                                                key={user.id}
                                                value={user.id}
                                            >
                                                {user.full_name} ({user.email})
                                            </option>

                                        ))}

                                </select>

                            </div>


                            {/* POSITION */}

                            <div>

                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Select Position
                                </label>

                                <select
                                    value={selectedPosition}
                                    onChange={(e) =>
                                        setSelectedPosition(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                >

                                    <option value="">
                                        -- Select Position --
                                    </option>

                                    {positions
                                        .filter(
                                            position =>
                                                !committee.some(
                                                    member =>
                                                        member.position_id ===
                                                        position.id
                                                )
                                        )
                                        .map(position => (

                                            <option
                                                key={position.id}
                                                value={position.id}
                                            >
                                                {position.position_name}
                                            </option>

                                        ))}

                                </select>

                            </div>

                        </div>


                        <div className="mt-6 flex justify-end">

                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
                            >
                                <span className="text-lg">
                                    +
                                </span>

                                Add Committee Member
                            </button>

                        </div>

                    </form>

                </div>


                {/* ================= COMMITTEE LIST ================= */}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* TITLE */}

                    <div className="px-6 py-5 border-b border-slate-200">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                            <div>

                                <h2 className="text-xl font-bold text-slate-800">
                                    Committee Members
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Members assigned to this event.
                                </p>

                            </div>

                            <span className="inline-flex items-center w-fit px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                                {committee.length} member
                                {committee.length !== 1 ? "s" : ""}
                            </span>

                        </div>

                    </div>


                    {/* EMPTY */}

                    {committee.length === 0 ? (

                        <div className="px-6 py-16 text-center">

                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center text-3xl">
                                👥
                            </div>

                            <h3 className="text-lg font-semibold text-slate-800">
                                No Committee Members
                            </h3>

                            <p className="text-sm text-slate-500 mt-2">
                                No committee members have been assigned
                                to this event yet.
                            </p>

                        </div>

                    ) : (

                        /* TABLE */

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">

                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                            #
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Member
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Email
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Position
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Actions
                                        </th>

                                    </tr>
                                </thead>


                                <tbody className="divide-y divide-slate-100">

                                    {committee.map(
                                        (member, index) => (

                                            <tr
                                                key={member.id}
                                                className="hover:bg-blue-50/40 transition"
                                            >

                                                {/* NUMBER */}

                                                <td className="px-6 py-4">

                                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
                                                        {index + 1}
                                                    </span>

                                                </td>


                                                {/* MEMBER */}

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                                            {member.full_name
                                                                ?.charAt(0)
                                                                ?.toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-slate-800">
                                                                {member.full_name}
                                                            </p>

                                                            <p className="text-xs text-slate-400">
                                                                Committee Member
                                                            </p>
                                                        </div>

                                                    </div>

                                                </td>


                                                {/* EMAIL */}

                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {member.email}
                                                </td>


                                                {/* POSITION */}

                                                <td className="px-6 py-4">

                                                    {editingId === member.id ? (

                                                        <select
                                                            value={editingPosition}
                                                            onChange={(e) =>
                                                                setEditingPosition(
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                                                        >

                                                            <option value="">
                                                                Select Position
                                                            </option>

                                                            {positions.map(
                                                                position => (

                                                                    <option
                                                                        key={
                                                                            position.id
                                                                        }
                                                                        value={
                                                                            position.id
                                                                        }
                                                                    >
                                                                        {
                                                                            position.position_name
                                                                        }
                                                                    </option>

                                                                )
                                                            )}

                                                        </select>

                                                    ) : (

                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                                                            {
                                                                member.position_name
                                                            }
                                                        </span>

                                                    )}

                                                </td>


                                                {/* ACTIONS */}

                                                <td className="px-6 py-4">

                                                    {editingId === member.id ? (

                                                        <div className="flex items-center gap-2">

                                                            <button
                                                                onClick={() =>
                                                                    updateCommitteeMember(
                                                                        member.id
                                                                    )
                                                                }
                                                                className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                                                            >
                                                                Save
                                                            </button>

                                                            <button
                                                                onClick={
                                                                    cancelEditing
                                                                }
                                                                className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition"
                                                            >
                                                                Cancel
                                                            </button>

                                                        </div>

                                                    ) : (

                                                        <div className="flex items-center gap-2">

                                                            <button
                                                                onClick={() =>
                                                                    startEditing(
                                                                        member
                                                                    )
                                                                }
                                                                className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition"
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    removeCommitteeMember(
                                                                        member.id
                                                                    )
                                                                }
                                                                className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition"
                                                            >
                                                                Remove
                                                            </button>

                                                        </div>

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

            </main>

        </div>
    );
}

export default EventCommittee;
