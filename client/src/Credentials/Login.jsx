import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("LOGIN DATA:", form);

    // TODO: connect backend here
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-zinc-800 rounded-2xl p-8 bg-zinc-950">
        {/* Title */}
        <h1
          className="text-yellow-400 font-black mb-6 text-center"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "32px",
            letterSpacing: "1px",
          }}
        >
          GUARD LOGIN
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="bg-black border border-zinc-700 focus:border-yellow-400 outline-none px-4 py-3 rounded-lg text-sm"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="bg-black border border-zinc-700 focus:border-yellow-400 outline-none px-4 py-3 rounded-lg text-sm"
          />

          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-lg mt-2"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "1px",
            }}
          >
            ENTER SYSTEM
          </button>
        </form>

        {/* Switch */}
        <p className="text-zinc-500 text-sm text-center mt-6">
          New guard?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-yellow-400 cursor-pointer"
          >
            Request Access
          </span>
        </p>
      </div>
    </div>
  );
}
