import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../appwrite/auth.js";

function ForgotPasswordComponent() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email.trim()) {
      setMessage("⚠️ Please enter a valid email!");
      setLoading(false);
      return;
    }

    try {
      // Call the method with just email - the redirectUrl is already hardcoded in authService
      const result = await authService.forgotPassword({ email });
      
      if (result.success) {
        setMessage("📩 Reset link sent! Check your inbox.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setMessage(result.error || "❌ Something went wrong!");
      }
    } catch (error) {
      setMessage("❌ Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-md shadow-xl border border-gray-700 rounded-2xl p-8 text-white">
        
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-400">
          Recover Your Password
        </h1>

        <p className="text-gray-400 text-sm text-center mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="Enter your registered email"
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed active:scale-95 transition text-white font-medium py-2.5 rounded-lg shadow-md flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-center text-sm ${
            message.includes("✅") || message.includes("📩") 
              ? "bg-green-900/50 text-green-300 border border-green-800" 
              : "bg-red-900/50 text-red-300 border border-red-800"
          }`}>
            {message}
          </div>
        )}

        <button 
          onClick={() => navigate("/login")}
          className="block w-full text-sm text-blue-400 hover:text-blue-300 hover:underline mt-4 text-center transition"
          disabled={loading}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPasswordComponent;