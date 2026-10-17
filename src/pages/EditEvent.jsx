import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/OrganizerNavbar";

function EditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        eventDate: "",
        eventTime: "",
        location: "",
        capacity: "",
        category: "",
    });

    const [image, setImage] = useState(null);
    const [document, setDocument] = useState(null);

    const [existingImage, setExistingImage] = useState("");
    const [existingDocument, setExistingDocument] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ==========================================
    // LOAD EVENT
    // ==========================================

    useEffect(() => {
        const fetchEvent = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            if (!id) {
                setError("Event ID is missing.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                console.log("EDIT EVENT ID:", id);

                const response = await fetch(
                    `http://localhost:5000/api/events/${id}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    if (
                        response.status === 401 ||
                        response.status === 403
                    ) {
                        localStorage.removeItem("token");
                        navigate("/login");
                        return;
                    }

                    throw new Error(
                        result.message || "Failed to load event"
                    );
                }

                setFormData({
                    title: result.title || "",
                    description: result.description || "",
                    eventDate: result.event_date
                        ? String(result.event_date).substring(0, 10)
                        : "",
                    eventTime: result.event_time
                        ? String(result.event_time).substring(0, 5)
                        : "",
                    location: result.location || "",
                    capacity: result.capacity || "",
                    category: result.category || "",
                });

                setExistingImage(result.image || "");
                setExistingDocument(result.document || "");
            } catch (error) {
                console.error("Fetch event error:", error);

                setError(
                    error.message || "Unable to load event."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id, navigate]);

    // ==========================================
    // INPUT CHANGE
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ==========================================
    // IMAGE CHANGE
    // ==========================================

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            setImage(null);
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                "Please select a JPG, JPEG, PNG or WEBP image."
            );

            e.target.value = "";
            setImage(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be less than 5MB.");

            e.target.value = "";
            setImage(null);
            return;
        }

        setError("");
        setImage(file);
    };

    // ==========================================
    // DOCUMENT CHANGE
    // ==========================================

    const handleDocumentChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            setDocument(null);
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                "Please select a PDF, DOC or DOCX file."
            );

            e.target.value = "";
            setDocument(null);
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError("Document must be less than 10MB.");

            e.target.value = "";
            setDocument(null);
            return;
        }

        setError("");
        setDocument(file);
    };

    // ==========================================
    // SUBMIT
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        if (!id) {
            setError("Event ID is missing.");
            return;
        }

        if (
            !formData.title.trim() ||
            !formData.eventDate ||
            !formData.eventTime ||
            !formData.location.trim() ||
            !formData.capacity
        ) {
            setError(
                "Please fill in all required fields."
            );
            return;
        }

        try {
            setSaving(true);

            const data = new FormData();

            data.append("title", formData.title.trim());
            data.append(
                "description",
                formData.description.trim()
            );
            data.append("eventDate", formData.eventDate);
            data.append("eventTime", formData.eventTime);
            data.append(
                "location",
                formData.location.trim()
            );
            data.append("capacity", formData.capacity);
            data.append("category", formData.category);

            if (image) {
                data.append("image", image);
            }

            if (document) {
                data.append("document", document);
            }

            console.log("UPDATING EVENT:", id);

            const response = await fetch(
                `http://localhost:5000/api/events/${id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: data,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    localStorage.removeItem("token");
                    navigate("/login");
                    return;
                }

                throw new Error(
                    result.message ||
                    "Failed to update event"
                );
            }

            setSuccess(
                "Event updated successfully!"
            );

            setTimeout(() => {
                navigate("/my-events");
            }, 1000);
        } catch (error) {
            console.error(
                "Update event error:",
                error
            );

            setError(
                error.message ||
                "Unable to update event."
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <>
                <Navbar />

                <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-semibold text-indigo-600">
                            Loading event...
                        </div>

                        <p className="text-slate-500 mt-2">
                            Please wait.
                        </p>
                    </div>
                </div>
            </>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-slate-100">
                <div className="max-w-4xl mx-auto px-6 py-10">

                    <div className="bg-white rounded-2xl shadow-lg p-8">

                        {/* HEADER */}

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-800">
                                Edit Event
                            </h1>

                            <p className="text-slate-500 mt-2">
                                Update your event information.
                            </p>
                        </div>

                        {/* ERROR */}

                        {error && (
                            <div className="mb-5 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* SUCCESS */}

                        {success && (
                            <div className="mb-5 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
                                {success}
                            </div>
                        )}

                        {/* FORM */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >

                            {/* TITLE */}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Event Title *
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter event title"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            {/* DESCRIPTION */}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Describe your event"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            {/* DATE AND TIME */}

                            <div className="grid md:grid-cols-2 gap-5">

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Event Date *
                                    </label>

                                    <input
                                        type="date"
                                        name="eventDate"
                                        value={formData.eventDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Event Time *
                                    </label>

                                    <input
                                        type="time"
                                        name="eventTime"
                                        value={formData.eventTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>

                            </div>

                            {/* LOCATION */}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Location *
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Enter event location"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            {/* CAPACITY + CATEGORY */}

                            <div className="grid md:grid-cols-2 gap-5">

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Capacity *
                                    </label>

                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        min="1"
                                        placeholder="Maximum attendees"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Category
                                    </label>

                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        <option value="">
                                            Select category
                                        </option>

                                        <option value="Technology">
                                            Technology
                                        </option>

                                        <option value="Business">
                                            Business
                                        </option>

                                        <option value="Education">
                                            Education
                                        </option>

                                        <option value="Entertainment">
                                            Entertainment
                                        </option>

                                        <option value="Sports">
                                            Sports
                                        </option>

                                        <option value="Workshop">
                                            Workshop
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>
                                    </select>
                                </div>

                            </div>

                            {/* CURRENT IMAGE */}

                            {existingImage && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Current Event Image
                                    </label>

                                    <img
                                        src={`http://localhost:5000/uploads/images/${existingImage}`}
                                        alt="Current event"
                                        className="w-full max-w-md h-48 object-cover rounded-lg border"
                                    />
                                </div>
                            )}

                            {/* REPLACE IMAGE */}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Replace Event Image
                                    <span className="text-slate-400 font-normal">
                                        {" "} (Optional)
                                    </span>
                                </label>

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                                />

                                <p className="text-xs text-slate-500 mt-2">
                                    JPG, JPEG, PNG or WEBP. Maximum 5MB.
                                </p>

                                {image && (
                                    <p className="text-sm text-green-600 mt-2">
                                        New image: {image.name}
                                    </p>
                                )}
                            </div>

                            {/* CURRENT DOCUMENT */}

                            {existingDocument && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Current Event Document
                                    </label>

                                    <a
                                        href={`http://localhost:5000/uploads/documents/${existingDocument}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        📄 View Current Document
                                    </a>
                                </div>
                            )}

                            {/* REPLACE DOCUMENT */}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Replace Event Document
                                    <span className="text-slate-400 font-normal">
                                        {" "} (Optional)
                                    </span>
                                </label>

                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleDocumentChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                                />

                                <p className="text-xs text-slate-500 mt-2">
                                    PDF, DOC or DOCX. Maximum 10MB.
                                </p>

                                {document && (
                                    <p className="text-sm text-green-600 mt-2">
                                        New document: {document.name}
                                    </p>
                                )}
                            </div>

                            {/* BUTTONS */}

                            <div className="flex gap-4 pt-4">

                                <Link
                                    to="/my-events"
                                    className="flex-1 text-center border border-slate-300 text-slate-700 py-3 rounded-lg hover:bg-slate-100"
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400"
                                >
                                    {saving
                                        ? "Saving Changes..."
                                        : "Save Changes"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            </div>
        </>
    );
}

export default EditEvent;