import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      setError("");
      const payload = { ...form };
      if (!payload.dob) delete payload.dob;

      await API.post("/auth/register", payload);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100">
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-10 w-[420px]">

        <h1 className="text-4xl font-bold text-center text-purple-600 mb-2">
          Join CoverMate
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Create your insurance profile
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Full Name</label>
          <input
            name="name"
            placeholder="Your name"
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-400"
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-400"
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Password</label>
          <input
            name="password"
            type="password"
            placeholder="Create strong password"
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-400"
            onChange={handleChange}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-1">
            Date of Birth (Optional)
          </label>
          <input
            name="dob"
            type="date"
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-400"
            onChange={handleChange}
          />
        </div>

        <button
          onClick={handleRegister}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold shadow-md"
        >
          Register
        </button>

        <p className="text-center text-sm mt-6 text-gray-500">
          Already have an account?{" "}
          <Link to="/" className="text-purple-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
