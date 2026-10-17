import React, {
    useEffect,
    useState
} from "react";

import {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} from "../services/userManagementApi";
import OrganizerNavbar from "../components/OrganizerNavbar";    

function UserManagement() {

    // ==================================================
    // USERS
    // ==================================================

    const [users, setUsers] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // ==================================================
    // SEARCH & FILTER
    // ==================================================

    const [search, setSearch] =
        useState("");

    const [roleFilter, setRoleFilter] =
        useState("");


    // ==================================================
    // ADD MEMBER
    // ==================================================

    const [showAddModal, setShowAddModal] =
        useState(false);

    const [addingUser, setAddingUser] =
        useState(false);

    const [newUser, setNewUser] =
        useState({
            full_name: "",
            email: "",
            password: "",
            role: "attendee"
        });


    // ==================================================
    // EDIT MEMBER
    // ==================================================

    const [editingUser, setEditingUser] =
        useState(null);

    const [updatingUser, setUpdatingUser] =
        useState(false);


    // ==================================================
    // DELETE
    // ==================================================

    const [deletingUserId, setDeletingUserId] =
        useState(null);


    // ==================================================
    // LOAD USERS
    // ==================================================

    const loadUsers = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getUsers(
                    search,
                    roleFilter
                );

            setUsers(
                data.users || []
            );

        } catch (err) {

            console.error(
                "User loading error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load users"
            );

        } finally {

            setLoading(false);

        }
    };


    // ==================================================
    // LOAD ON SEARCH / FILTER
    // ==================================================

    useEffect(() => {

        const timer =
            setTimeout(() => {
                loadUsers();
            }, 300);

        return () =>
            clearTimeout(timer);

    }, [search, roleFilter]);


    // ==================================================
    // CLEAR MESSAGES
    // ==================================================

    const clearMessages = () => {

        setError("");
        setSuccess("");

    };


    // ==================================================
    // ADD MEMBER
    // ==================================================

    const handleAddUser = async (e) => {

        e.preventDefault();

        try {

            clearMessages();

            setAddingUser(true);


            if (
                newUser.password.length < 6
            ) {

                setError(
                    "Password must contain at least 6 characters"
                );

                return;
            }


            await createUser(newUser);


            setSuccess(
                "Member added successfully"
            );


            // Reset form

            setNewUser({
                full_name: "",
                email: "",
                password: "",
                role: "attendee"
            });


            // Close modal

            setShowAddModal(false);


            // Refresh list

            await loadUsers();

        } catch (err) {

            console.error(
                "Add member error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to add member"
            );

        } finally {

            setAddingUser(false);

        }
    };


    // ==================================================
    // EDIT USER
    // ==================================================

    const handleUpdateUser = async (e) => {

        e.preventDefault();

        try {

            clearMessages();

            setUpdatingUser(true);


            await updateUser(
                editingUser.id,
                {
                    full_name:
                        editingUser.full_name,

                    email:
                        editingUser.email,

                    role:
                        editingUser.role
                }
            );


            setSuccess(
                "User updated successfully"
            );


            setEditingUser(null);


            await loadUsers();

        } catch (err) {

            console.error(
                "Update user error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to update user"
            );

        } finally {

            setUpdatingUser(false);

        }
    };


    // ==================================================
    // DELETE USER
    // ==================================================

    const handleDeleteUser = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this user?"
            );


        if (!confirmed) {
            return;
        }


        try {

            clearMessages();

            setDeletingUserId(id);


            await deleteUser(id);


            setSuccess(
                "User deleted successfully"
            );


            await loadUsers();

        } catch (err) {

            console.error(
                "Delete user error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to delete user"
            );

        } finally {

            setDeletingUserId(null);

        }
    };


    // ==================================================
    // FORMAT DATE
    // ==================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date)
            .toLocaleDateString(
                "en-US",
                {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                }
            );
    };


    // ==================================================
    // CLOSE ADD MODAL
    // ==================================================

    const closeAddModal = () => {

        setShowAddModal(false);

        setNewUser({
            full_name: "",
            email: "",
            password: "",
            role: "attendee"
        });

    };


    // ==================================================
    // RETURN
    // ==================================================

    return (
<>
     <OrganizerNavbar />
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">

            <div className="mx-auto max-w-7xl">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                            User Management
                        </h1>

                        <p className="mt-2 text-sm text-slate-500 sm:text-base">
                            Manage EVENTORA members,
                            roles and accounts.
                        </p>

                    </div>


                    <button
                        onClick={() => {
                            clearMessages();
                            setShowAddModal(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >

                        <span className="text-xl">
                            +
                        </span>

                        Add Member

                    </button>

                </div>


                {/* ==================================================
                    SUCCESS MESSAGE
                ================================================== */}

                {success && (

                    <div className="mb-5 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">

                        <span>
                            {success}
                        </span>

                        <button
                            onClick={() =>
                                setSuccess("")
                            }
                            className="ml-4 text-green-700 hover:text-green-900"
                        >
                            ×
                        </button>

                    </div>

                )}


                {/* ==================================================
                    ERROR MESSAGE
                ================================================== */}

                {error && (

                    <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">

                        <span>
                            {error}
                        </span>

                        <button
                            onClick={() =>
                                setError("")
                            }
                            className="ml-4 text-red-700 hover:text-red-900"
                        >
                            ×
                        </button>

                    </div>

                )}


                {/* ==================================================
                    FILTER SECTION
                ================================================== */}

                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">


                        {/* SEARCH */}

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Search Users
                            </label>

                            <div className="relative">

                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search name or email..."
                                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />

                            </div>

                        </div>


                        {/* ROLE FILTER */}

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Role
                            </label>

                            <select
                                value={roleFilter}
                                onChange={(e) =>
                                    setRoleFilter(
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            >

                                <option value="">
                                    All Roles
                                </option>

                                <option value="attendee">
                                    Attendee
                                </option>

                                <option value="organizer">
                                    Organizer
                                </option>

                            </select>

                        </div>


                        {/* TOTAL USERS */}

                        <div className="rounded-lg bg-blue-50 p-4">

                            <p className="text-sm font-medium text-blue-600">
                                Total Users
                            </p>

                            <p className="mt-1 text-2xl font-bold text-blue-800">
                                {users.length}
                            </p>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    USERS TABLE
                ================================================== */}

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">


                    {/* LOADING */}

                    {loading ? (

                        <div className="flex flex-col items-center justify-center p-12">

                            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                            <p className="text-slate-500">
                                Loading users...
                            </p>

                        </div>


                    ) : users.length === 0 ? (


                        /* ==================================================
                           NO USERS
                        ================================================== */

                        <div className="flex flex-col items-center justify-center p-12 text-center">

                            <div className="mb-4 text-5xl">
                                👥
                            </div>

                            <h3 className="text-lg font-semibold text-slate-800">
                                No users found
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Try changing your search
                                or role filter.
                            </p>

                        </div>


                    ) : (


                        /* ==================================================
                           TABLE
                        ================================================== */

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[850px]">

                                <thead className="border-b border-slate-200 bg-slate-100">

                                    <tr>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            User
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            Email
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            Role
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            Joined
                                        </th>

                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {users.map(
                                        (user) => (

                                            <tr
                                                key={user.id}
                                                className="border-b border-slate-100 transition hover:bg-slate-50"
                                            >


                                                {/* USER */}

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">

                                                            {user.full_name
                                                                ?.charAt(0)
                                                                ?.toUpperCase()}

                                                        </div>

                                                        <div>

                                                            <p className="font-semibold text-slate-800">
                                                                {user.full_name}
                                                            </p>

                                                            <p className="text-xs text-slate-500">
                                                                User ID #{user.id}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* EMAIL */}

                                                <td className="px-6 py-4">

                                                    <span className="text-sm text-slate-600">
                                                        {user.email}
                                                    </span>

                                                </td>


                                                {/* ROLE */}

                                                <td className="px-6 py-4">

                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                            user.role ===
                                                            "organizer"
                                                                ? "bg-purple-100 text-purple-700"
                                                                : "bg-green-100 text-green-700"
                                                        }`}
                                                    >

                                                        {user.role ===
                                                        "organizer"
                                                            ? "Organizer"
                                                            : "Attendee"}

                                                    </span>

                                                </td>


                                                {/* JOINED */}

                                                <td className="px-6 py-4 text-sm text-slate-600">

                                                    {formatDate(
                                                        user.created_at
                                                    )}

                                                </td>


                                                {/* ACTIONS */}

                                                <td className="px-6 py-4">

                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            onClick={() => {
                                                                clearMessages();

                                                                setEditingUser({
                                                                    ...user
                                                                });
                                                            }}
                                                            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                                        >
                                                            Edit
                                                        </button>


                                                        <button
                                                            onClick={() =>
                                                                handleDeleteUser(
                                                                    user.id
                                                                )
                                                            }
                                                            disabled={
                                                                deletingUserId ===
                                                                user.id
                                                            }
                                                            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >

                                                            {deletingUserId ===
                                                            user.id
                                                                ? "Deleting..."
                                                                : "Delete"}

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>


            {/* ======================================================
                ADD MEMBER MODAL
            ====================================================== */}

            {showAddModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">


                        {/* MODAL HEADER */}

                        <div className="mb-6 flex items-start justify-between">

                            <div>

                                <h2 className="text-xl font-bold text-slate-800">
                                    Add New Member
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Create a new EVENTORA account.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeAddModal}
                                className="text-2xl text-slate-400 transition hover:text-slate-700"
                            >
                                ×
                            </button>

                        </div>


                        {/* ADD FORM */}

                        <form
                            onSubmit={handleAddUser}
                            className="space-y-5"
                        >


                            {/* FULL NAME */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        newUser.full_name
                                    }
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            full_name:
                                                e.target.value
                                        })
                                    }
                                    placeholder="Enter full name"
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />

                            </div>


                            {/* EMAIL */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={
                                        newUser.email
                                    }
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            email:
                                                e.target.value
                                        })
                                    }
                                    placeholder="Enter email address"
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />

                            </div>


                            {/* PASSWORD */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    value={
                                        newUser.password
                                    }
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            password:
                                                e.target.value
                                        })
                                    }
                                    placeholder="Minimum 6 characters"
                                    minLength={6}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />

                                <p className="mt-1 text-xs text-slate-400">
                                    Password must contain at least 6 characters.
                                </p>

                            </div>


                            {/* ROLE */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Role
                                </label>

                                <select
                                    value={
                                        newUser.role
                                    }
                                    onChange={(e) =>
                                        setNewUser({
                                            ...newUser,
                                            role:
                                                e.target.value
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                >

                                    <option value="attendee">
                                        Attendee
                                    </option>

                                    <option value="organizer">
                                        Organizer
                                    </option>

                                </select>

                            </div>


                            {/* BUTTONS */}

                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                                <button
                                    type="button"
                                    onClick={closeAddModal}
                                    disabled={addingUser}
                                    className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={addingUser}
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {addingUser
                                        ? "Adding..."
                                        : "Add Member"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ======================================================
                EDIT USER MODAL
            ====================================================== */}

            {editingUser && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">


                        {/* HEADER */}

                        <div className="mb-6 flex items-start justify-between">

                            <div>

                                <h2 className="text-xl font-bold text-slate-800">
                                    Edit User
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Update member information.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setEditingUser(null)
                                }
                                className="text-2xl text-slate-400 hover:text-slate-700"
                            >
                                ×
                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={
                                handleUpdateUser
                            }
                            className="space-y-5"
                        >


                            {/* NAME */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        editingUser.full_name
                                    }
                                    onChange={(e) =>
                                        setEditingUser({
                                            ...editingUser,
                                            full_name:
                                                e.target.value
                                        })
                                    }
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />

                            </div>


                            {/* EMAIL */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={
                                        editingUser.email
                                    }
                                    onChange={(e) =>
                                        setEditingUser({
                                            ...editingUser,
                                            email:
                                                e.target.value
                                        })
                                    }
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />

                            </div>


                            {/* ROLE */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Role
                                </label>

                                <select
                                    value={
                                        editingUser.role
                                    }
                                    onChange={(e) =>
                                        setEditingUser({
                                            ...editingUser,
                                            role:
                                                e.target.value
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                >

                                    <option value="attendee">
                                        Attendee
                                    </option>

                                    <option value="organizer">
                                        Organizer
                                    </option>

                                </select>

                            </div>


                            {/* BUTTONS */}

                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditingUser(null)
                                    }
                                    disabled={
                                        updatingUser
                                    }
                                    className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        updatingUser
                                    }
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {updatingUser
                                        ? "Saving..."
                                        : "Save Changes"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
        </>
    );
}

export default UserManagement;
