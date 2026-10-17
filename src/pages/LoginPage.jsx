import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      // Save JWT token
      localStorage.setItem("token", data.token);

      // Save logged-in user
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful!");

      // Redirect according to role
      if (data.user.role === "organizer") {
        navigate("/organizer-dashboard");
      } else {
        navigate("/attendee-dashboard");
      }

    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-wide text-indigo-600">
            EVENTORA
          </h1>

          <p className="mt-2 text-slate-500">
            Event Management System
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">

          <div className="text-center mb-7">
            <h2 className="text-2xl font-bold text-slate-800">
              Welcome Back 👋
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue to your account
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 rounded-lg bg-red-100 border border-red-300 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg
                outline-none transition
                focus:ring-2 focus:ring-indigo-500
                focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg
                outline-none transition
                focus:ring-2 focus:ring-indigo-500
                focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between text-sm">

              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-indigo-600"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Forgot password?
              </Link>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg
              font-semibold
              hover:bg-indigo-700
              disabled:bg-indigo-400
              active:scale-[0.98]
              transition duration-200
              shadow-md hover:shadow-lg"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

          </form>

          <div className="mt-7 text-center text-sm text-slate-600">
            Don't have an account?{" "}

            <Link
              to="/register"
              className="text-indigo-600 font-semibold hover:text-indigo-700"
            >
              Create an account
            </Link>
          </div>

        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 Eventora. All rights reserved.
        </p>

      </div>
    </div>
  );
}

export default LoginPage;