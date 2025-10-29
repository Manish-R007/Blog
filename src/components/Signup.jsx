import React, { useState } from "react";
import authService from "../appwrite/auth";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../store/authSlice";
import { Button, Input, Logo } from "./index.js";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";

function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const create = async (data) => {
    setError("");
    setLoading(true);
    try {
      const age = new Date(data.DOB).getFullYear();
      const currentYear = new Date().getFullYear();

      if (currentYear - age < 13) {
        alert("You must be at least 13 years old to use this application");
        return;
      }

      const userData = await authService.createAccount(data);
      if (userData) {
        const user = await authService.getCurrentUser();
        if (user) dispatch(login(user));
        navigate("/");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-gradient-to-b from-blue-100/10 via-blue-200/10 to-blue-300/10 rounded-3xl p-6 sm:p-8 md:p-10 border border-blue-300/40 shadow-[0_0_40px_rgba(147,197,253,0.3)] backdrop-blur-md hover:shadow-[0_0_60px_rgba(147,197,253,0.4)] transition-all">
        
        {/* Logo */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <span className="inline-block w-full max-w-[80px] sm:max-w-[100px] md:max-w-[120px]">
            <Logo width="100%" />
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-sky-300 to-blue-400 text-transparent bg-clip-text drop-shadow-lg">
            Create Your Account
          </h2>
          <p className="mt-2 text-blue-100/90 text-sm sm:text-base">
            Join <span className="text-sky-300 font-semibold">BlogSphere</span> and start your journey ✨
          </p>
        </div>

        {/* Already have account */}
        <p className="text-center text-blue-200/70 mb-4 sm:mb-6 text-sm sm:text-base">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-sky-300 hover:text-blue-100 transition-colors duration-200 hover:underline"
          >
            Sign In
          </Link>
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/40 rounded-lg p-3 mb-4 sm:mb-6 text-center shadow-[0_0_15px_rgba(255,99,71,0.2)]">
            <p className="text-red-200 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(create)} className="space-y-4 sm:space-y-5">
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            {...register("name", { required: true })}
            className="w-full bg-blue-100/10 border border-blue-300/40 focus:border-sky-300 text-blue-50 placeholder-blue-200/60 rounded-xl focus:ring-2 focus:ring-sky-400/60 transition-all text-sm sm:text-base"
          />
          <Input
            label="Email"
            placeholder="Enter your email"
            type="email"
            {...register("email", {
              required: true,
              validate: {
                matchPattern: (value) =>
                  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                  "Invalid email format",
              },
            })}
            className="w-full bg-blue-100/10 border border-blue-300/40 focus:border-sky-300 text-blue-50 placeholder-blue-200/60 rounded-xl focus:ring-2 focus:ring-sky-400/60 transition-all text-sm sm:text-base"
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            {...register("password", { required: true })}
            className="w-full bg-blue-100/10 border border-blue-300/40 focus:border-sky-300 text-blue-50 placeholder-blue-200/60 rounded-xl focus:ring-2 focus:ring-sky-400/60 transition-all text-sm sm:text-base"
          />
          <Input
            label="Date of Birth"
            type="date"
            {...register("DOB", { required: true })}
            className="w-full bg-blue-100/10 border border-blue-300/40 focus:border-sky-300 text-blue-50 placeholder-blue-200/60 rounded-xl focus:ring-2 focus:ring-sky-400/60 transition-all text-sm sm:text-base"
          />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-gray-900 font-semibold py-3 rounded-2xl text-base sm:text-lg tracking-wide transition-all duration-300 transform hover:scale-105 shadow-[0_0_25px_rgba(147,197,253,0.5)]"
          >
            {loading ? "Signing up..." : "Create Account"}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-blue-200/20 text-center">
          <p className="text-blue-200/70 text-xs sm:text-sm">
            🔒 Your data is securely encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;