import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../appwrite/auth.js"; // adjust path if needed

function ForgotPasswordComponent() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("⚠️ Please enter a valid email!");
      return;
    }

    const result = await authService.forgotPassword({
      email,
      redirectUrl: "http://localhost:5173/reset-password"
    });

    if (result.success) {
      setMessage("📩 Reset link sent! Check your inbox.");
      setTimeout(() => navigate("/login"), 2200);
    } else {
      setMessage(result.message || "❌ Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-md shadow-xl border border-gray-700 rounded-2xl p-8 text-white">
        
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-400">
          Recover Your Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Enter your registered email"
            className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 transition text-white font-medium py-2.5 rounded-lg shadow-md"
          >
            Send Reset Link
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-300 animate-fade-in">
            {message}
          </p>
        )}

        <button 
          onClick={() => navigate("/login")}
          className="block w-full text-sm text-blue-400 hover:underline mt-4 text-center"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPasswordComponent;
