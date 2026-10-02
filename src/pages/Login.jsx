import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    if (!formData.username || !formData.password) {
      setError("Enter mobile number and password");
      return;
    }

    try {

      setLoading(true);

      const response = await api.post("/login", {
        username: formData.username,
        password: formData.password,
      });

      // Backend returns JWT as a raw string
      const token = response.data;

      localStorage.setItem("JWT_TOKEN", token);

      console.log("Login successful");

      navigate("/role");

    } catch (error) {

      console.error("Login error:", error);

      if (error.response) {

        setError(
          error.response.data?.message ||
          "Invalid mobile number or password"
        );

      } else {

        setError("Cannot connect to backend");

      }

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center text-green-600">
          WorkHistory
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Welcome back
        </p>

        {error && (
          <div className="mt-5 bg-red-50 text-red-600 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >

          <div>

            <label className="block mb-2 font-medium">
              Mobile Number
            </label>

            <input
              type="tel"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter mobile number"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-400"
            />

          </div>

          <div>

            <label className="block mb-2 font-medium">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-400"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center mt-6 text-gray-600">

          Don't have an account?

          <Link
            to="/signup"
            className="ml-2 text-green-600 font-semibold"
          >
            Create Account
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;