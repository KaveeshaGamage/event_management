import React, {
    useEffect,
    useState
} from "react";

import {
    getProfile,
    updateProfile,
    changePassword
} from "../services/profileApi";
import OrganizerNavbar from "../components/OrganizerNavbar";

function OrganizerProfile() {

    // ==================================================
    // PROFILE STATE
    // ==================================================

    const [profile, setProfile] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // ==================================================
    // EDIT PROFILE
    // ==================================================

    const [editMode, setEditMode] =
        useState(false);

    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");


    // ==================================================
    // PASSWORD
    // ==================================================

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [passwordLoading, setPasswordLoading] =
        useState(false);


    // ==================================================
    // LOAD PROFILE
    // ==================================================

    useEffect(() => {

        loadProfile();

    }, []);


    const loadProfile = async () => {

        try {

            setLoading(true);

            setError("");

            const data =
                await getProfile();

            const user =
                data.user;

            setProfile(user);

            setName(
                user.full_name || ""
            );

            setEmail(
                user.email || ""
            );

        } catch (error) {

            console.error(
                "Profile loading error:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to load profile."
            );

        } finally {

            setLoading(false);

        }

    };


    // ==================================================
    // UPDATE PROFILE
    // ==================================================

    const handleUpdateProfile =
        async (e) => {

            e.preventDefault();

            try {

                setError("");

                setSuccess("");

                if (!name.trim()) {

                    setError(
                        "Full name is required."
                    );

                    return;

                }

                if (!email.trim()) {

                    setError(
                        "Email is required."
                    );

                    return;

                }


                const data =
                    await updateProfile({
                        full_name:
                            name.trim(),

                        email:
                            email.trim()
                    });


                setProfile(
                    data.user
                );

                setName(
                    data.user.full_name
                );

                setEmail(
                    data.user.email
                );

                setEditMode(false);

                setSuccess(
                    "Profile updated successfully."
                );

            } catch (error) {

                console.error(
                    "Profile update error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to update profile."
                );

            }

        };


    // ==================================================
    // CHANGE PASSWORD
    // ==================================================

    const handleChangePassword =
        async (e) => {

            e.preventDefault();

            setError("");

            setSuccess("");


            if (!currentPassword) {

                setError(
                    "Enter your current password."
                );

                return;

            }


            if (!newPassword) {

                setError(
                    "Enter a new password."
                );

                return;

            }


            if (
                newPassword.length < 6
            ) {

                setError(
                    "New password must contain at least 6 characters."
                );

                return;

            }


            if (
                newPassword !==
                confirmPassword
            ) {

                setError(
                    "New passwords do not match."
                );

                return;

            }


            try {

                setPasswordLoading(
                    true
                );


                await changePassword({

                    current_password:
                        currentPassword,

                    new_password:
                        newPassword

                });


                setCurrentPassword("");

                setNewPassword("");

                setConfirmPassword("");


                setSuccess(
                    "Password changed successfully."
                );


            } catch (error) {

                console.error(
                    "Password change error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to change password."
                );

            } finally {

                setPasswordLoading(
                    false
                );

            }

        };


    // ==================================================
    // FORMAT DATE
    // ==================================================

    const formatDate = (date) => {

        if (!date) {

            return "-";

        }


        const parsed =
            new Date(date);


        if (
            isNaN(
                parsed.getTime()
            )
        ) {

            return date;

        }


        return parsed.toLocaleDateString(
            "en-US",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    };


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-50 p-6">

                <div className="max-w-5xl mx-auto">

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">

                        <div className="text-4xl mb-4">
                            👤
                        </div>

                        <p className="text-slate-500">
                            Loading profile...
                        </p>

                        <div className="flex justify-center mt-5">

                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

                        </div>

                    </div>

                </div>

            </div>

        );

    }


    // ==================================================
    // ERROR
    // ==================================================

    if (
        error &&
        !profile
    ) {

        return (

            <div className="min-h-screen bg-slate-50 p-6">

                <div className="max-w-5xl mx-auto">

                    <div className="bg-white border border-red-200 rounded-2xl p-8 text-center">

                        <div className="text-4xl mb-3">
                            ⚠️
                        </div>

                        <h2 className="text-xl font-bold text-red-600">
                            Profile Error
                        </h2>

                        <p className="text-slate-500 mt-2">
                            {error}
                        </p>

                        <button
                            onClick={loadProfile}
                            className="mt-5 px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </div>

        );

    }


    if (!profile) {

        return null;

    }


    // ==================================================
    // UI
    // ==================================================

    return (
        <>
            <OrganizerNavbar />

        <div className="min-h-screen bg-slate-50 p-4 md:p-6">

            <div className="max-w-5xl mx-auto">


                {/* ======================================
                    HEADER
                ====================================== */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>

                            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                                EVENTORA
                            </p>

                            <h1 className="text-3xl font-bold text-slate-800 mt-1">
                                My Profile
                            </h1>

                            <p className="text-slate-500 mt-2">
                                Manage your organizer account
                            </p>

                        </div>


                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
                            👤
                        </div>

                    </div>

                </div>


                {/* ======================================
                    ALERTS
                ====================================== */}

                {success && (

                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-4">

                        <div className="flex items-center gap-2">

                            <span>
                                ✅
                            </span>

                            <span>
                                {success}
                            </span>

                        </div>

                    </div>

                )}


                {error && (

                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4">

                        <div className="flex items-center gap-2">

                            <span>
                                ⚠️
                            </span>

                            <span>
                                {error}
                            </span>

                        </div>

                    </div>

                )}


                {/* ======================================
                    PROFILE INFORMATION
                ====================================== */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

                    <div className="flex items-center justify-between mb-6">

                        <div>

                            <h2 className="text-xl font-bold text-slate-800">
                                Profile Information
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Your account details
                            </p>

                        </div>


                        {!editMode && (

                            <button
                                onClick={() => {

                                    setEditMode(
                                        true
                                    );

                                    setError("");

                                    setSuccess("");

                                }}
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                            >
                                ✏️ Edit Profile
                            </button>

                        )}

                    </div>


                    {!editMode ? (

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                            {/* NAME */}

                            <div className="bg-slate-50 rounded-xl p-4">

                                <p className="text-sm text-slate-500">
                                    Full Name
                                </p>

                                <p className="font-semibold text-slate-800 mt-1">
                                    {profile.full_name}
                                </p>

                            </div>


                            {/* EMAIL */}

                            <div className="bg-slate-50 rounded-xl p-4">

                                <p className="text-sm text-slate-500">
                                    Email Address
                                </p>

                                <p className="font-semibold text-slate-800 mt-1 break-all">
                                    {profile.email}
                                </p>

                            </div>


                            {/* ROLE */}

                            <div className="bg-slate-50 rounded-xl p-4">

                                <p className="text-sm text-slate-500">
                                    Account Role
                                </p>

                                <div className="mt-2">

                                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold capitalize">
                                        {profile.role}
                                    </span>

                                </div>

                            </div>


                            {/* CREATED */}

                            <div className="bg-slate-50 rounded-xl p-4">

                                <p className="text-sm text-slate-500">
                                    Account Created
                                </p>

                                <p className="font-semibold text-slate-800 mt-1">
                                    {formatDate(
                                        profile.created_at
                                    )}
                                </p>

                            </div>

                        </div>

                    ) : (

                        <form
                            onSubmit={
                                handleUpdateProfile
                            }
                            className="space-y-5"
                        >

                            {/* NAME */}

                            <div>

                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your full name"
                                />

                            </div>


                            {/* EMAIL */}

                            <div>

                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your email"
                                />

                            </div>


                            {/* BUTTONS */}

                            <div className="flex flex-wrap gap-3">

                                <button
                                    type="submit"
                                    className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                                >
                                    Save Changes
                                </button>


                                <button
                                    type="button"
                                    onClick={() => {

                                        setEditMode(
                                            false
                                        );

                                        setName(
                                            profile.full_name
                                        );

                                        setEmail(
                                            profile.email
                                        );

                                    }}
                                    className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    )}

                </div>


                {/* ======================================
                    ACCOUNT INFORMATION
                ====================================== */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">


                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">

                        <div className="text-2xl mb-3">
                            👤
                        </div>

                        <p className="text-sm text-blue-700">
                            User ID
                        </p>

                        <p className="text-2xl font-bold text-blue-700 mt-1">
                            #{profile.id}
                        </p>

                    </div>


                    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">

                        <div className="text-2xl mb-3">
                            🛡️
                        </div>

                        <p className="text-sm text-purple-700">
                            Account Type
                        </p>

                        <p className="text-2xl font-bold text-purple-700 mt-1 capitalize">
                            {profile.role}
                        </p>

                    </div>


                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5">

                        <div className="text-2xl mb-3">
                            📅
                        </div>

                        <p className="text-sm text-green-700">
                            Member Since
                        </p>

                        <p className="text-lg font-bold text-green-700 mt-1">
                            {formatDate(
                                profile.created_at
                            )}
                        </p>

                    </div>

                </div>


                {/* ======================================
                    CHANGE PASSWORD
                ====================================== */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                    <div className="mb-6">

                        <h2 className="text-xl font-bold text-slate-800">
                            Change Password
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Update your account password
                        </p>

                    </div>


                    <form
                        onSubmit={
                            handleChangePassword
                        }
                        className="space-y-5"
                    >


                        {/* CURRENT PASSWORD */}

                        <div>

                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Current Password
                            </label>

                            <input
                                type="password"
                                value={
                                    currentPassword
                                }
                                onChange={(e) =>
                                    setCurrentPassword(
                                        e.target.value
                                    )
                                }
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter current password"
                            />

                        </div>


                        {/* NEW PASSWORD */}

                        <div>

                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                New Password
                            </label>

                            <input
                                type="password"
                                value={
                                    newPassword
                                }
                                onChange={(e) =>
                                    setNewPassword(
                                        e.target.value
                                    )
                                }
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter new password"
                            />

                            <p className="text-xs text-slate-400 mt-1">
                                Minimum 6 characters
                            </p>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div>

                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Confirm New Password
                            </label>

                            <input
                                type="password"
                                value={
                                    confirmPassword
                                }
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Confirm new password"
                            />

                        </div>


                        {/* PASSWORD BUTTON */}

                        <button
                            type="submit"
                            disabled={
                                passwordLoading
                            }
                            className="px-5 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >

                            {passwordLoading
                                ? "Changing Password..."
                                : "Change Password"
                            }

                        </button>

                    </form>

                </div>


                {/* ======================================
                    FOOTER
                ====================================== */}

                <div className="text-center text-sm text-slate-400 py-6">

                    EVENTORA Event Management System

                    <br />

                    Organizer Profile

                </div>

            </div>

        </div>
</>
    );

}


export default OrganizerProfile;