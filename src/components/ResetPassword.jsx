import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import authService from "../appwrite/auth.js"; 
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import Logo from "../components/Logo.jsx";

function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const userId = params.get("userId");
  const secret = params.get("secret");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password.trim().length < 8) {
      setMessage("⚠️ Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setMessage("");

    const res = await authService.updatePassword({
      userId,
      secret,
      newPassword: password,
    });

    if (res.success) {
      setMessage("🎉 Password updated successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 2500);
    } else {
      setMessage(res.message || "❌ Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-gradient-to-b from-blue-100/10 via-blue-200/10 to-blue-300/10 rounded-3xl p-6 sm:p-8 md:p-10 border border-blue-300/40 shadow-[0_0_40px_rgba(147,197,253,0.3)] backdrop-blur-md hover:shadow-[0_0_60px_rgba(147,197,253,0.4)] transition-all">
        
        {/* Logo */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <span className="inline-block w-full max-w-[80px] sm:max-w-[100px] md:max-w-[120px]">
            <Logo width="100%" />
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-sky-300 to-blue-400 text-transparent bg-clip-text drop-shadow-lg">
            Reset Password
          </h2>
          <p className="mt-2 text-blue-100/90 text-sm sm:text-base">
            Enter a strong new password 🛡️
          </p>
        </div>

        {/* Success / Error Message */}
        {message && (
          <div className="bg-blue-500/10 border border-blue-400/40 rounded-lg p-3 mb-5 text-center shadow-[0_0_15px_rgba(147,197,253,0.3)]">
            <p className="text-blue-200 text-xs sm:text-sm">{message}</p>
          </div>
        )}

        {/* Reset Password Form */}
        <form onSubmit={handleReset} className="space-y-5 sm:space-y-6">
          <Input
            label="New Password"
            type="password"
            placeholder="Enter strong new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-blue-100/10 border border-blue-300/40 focus:border-sky-300 text-blue-50 placeholder-blue-200/60 rounded-xl focus:ring-2 focus:ring-sky-400/60 transition-all text-sm sm:text-base"
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-gray-900 font-semibold py-3 rounded-2xl text-base sm:text-lg tracking-wide transition-all duration-300 transform hover:scale-105 shadow-[0_0_25px_rgba(147,197,253,0.5)]"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </div>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-blue-200/20 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-blue-200/70 hover:text-blue-100 hover:underline text-sm sm:text-base transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
