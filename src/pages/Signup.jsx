import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Signup() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    number: "",
    password: "",
    confirmPassword: "",
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

    if (!formData.name.trim()) {
      setError("Enter your name");
      return;
    }

    if (!/^\d{10}$/.test(formData.number)) {
      setError("Enter a valid 10 digit mobile number");
      return;
    }

    if (!formData.password) {
      setError("Enter your password");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {

      setLoading(true);

      const response = await api.post("/signup", {
        name: formData.name,
        number: formData.number,
        password: formData.password,
      });

      console.log("Signup successful:", response.data);

      alert("Account created successfully!");

      navigate("/login");

    } catch (error) {

      console.error("Signup error:", error);

      if (error.response) {

        setError(
          error.response.data?.message ||
          "Signup failed"
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
          Create your account
        </p>

        {error && (
          <div className="mt-5 bg-red-50 text-red-600 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >

          <div>

            <label className="block mb-1 font-medium">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-400"
            />

          </div>

          <div>

            <label className="block mb-1 font-medium">
              Mobile Number
            </label>

            <input
              type="tel"
              name="number"
              value={formData.number}
              onChange={handleChange}
              placeholder="10 digit mobile number"
              maxLength="10"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-400"
            />

          </div>

          <div>

            <label className="block mb-1 font-medium">
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

          <div>

            <label className="block mb-1 font-medium">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-400"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >

            {loading
              ? "Creating..."
              : "Create Account"
            }

          </button>

        </form>

        <p className="text-center mt-6 text-gray-600">

          Already have an account?

          <Link
            to="/login"
            className="ml-2 text-green-600 font-semibold"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Signup;