import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/OrganizerNavbar";
function CreateEvent() {
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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];

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
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setImage(file);
  };


  const handleDocumentChange = (e) => {
    const file = e.target.files[0];

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
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Document must be less than 10MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setDocument(file);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.title ||
      !formData.eventDate ||
      !formData.eventTime ||
      !formData.location ||
      !formData.capacity
    ) {
      setError(
        "Please fill in all required fields."
      );
      return;
    }


    const token = localStorage.getItem("token");

    if (!token) {
      setError(
        "You are not logged in. Please login first."
      );
      return;
    }


    try {
      setLoading(true);

      const data = new FormData();

      data.append("title", formData.title);

      data.append(
        "description",
        formData.description
      );

      data.append(
        "eventDate",
        formData.eventDate
      );

      data.append(
        "eventTime",
        formData.eventTime
      );

      data.append(
        "location",
        formData.location
      );

      data.append(
        "capacity",
        formData.capacity
      );

      data.append(
        "category",
        formData.category
      );


      // Optional image
      if (image) {
        data.append("image", image);
      }


      // Optional PDF/document
      if (document) {
        data.append("document", document);
      }


      const response = await fetch(
        "http://localhost:5000/api/events",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: data,
        }
      );


      const result = await response.json();


      if (!response.ok) {
        setError(
          result.message ||
            "Failed to create event."
        );
        return;
      }


      setSuccess(
        "Event created successfully!"
      );


      // Clear form
      setFormData({
        title: "",
        description: "",
        eventDate: "",
        eventTime: "",
        location: "",
        capacity: "",
        category: "",
      });

      setImage(null);
      setDocument(null);


      // Redirect
      setTimeout(() => {
        navigate("/my-events");
      }, 1000);

    } catch (error) {
      console.error(
        "Create event error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-slate-100">

      


      {/* Main */}
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="bg-white rounded-2xl shadow-lg p-8">

          <h1 className="text-3xl font-bold text-slate-800">
            Create Event
          </h1>

          <p className="text-slate-500 mt-2 mb-8">
            Create a new event and provide the event details.
          </p>


          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}


          {/* Success */}
          {success && (
            <div className="mb-5 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}


          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Title */}
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


            {/* Description */}
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


            {/* Date and Time */}
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


            {/* Location */}
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


            {/* Capacity and Category */}
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


            {/* Image */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Event Image
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
                  Selected: {image.name}
                </p>
              )}
            </div>


            {/* Document */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Event Document / PDF
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
                  Selected: {document.name}
                </p>
              )}
            </div>


            {/* Buttons */}
            <div className="flex gap-4 pt-4">

              <Link
                to="/my-events"
                className="flex-1 text-center border border-slate-300 text-slate-700 py-3 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {loading
                  ? "Creating Event..."
                  : "Create Event"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
    </>
  );
}

export default CreateEvent;