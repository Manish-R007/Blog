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
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError("");
    
    try {
      console.log("🔐 Attempting Google signup...");
      await authService.googleLogin();
    } catch (err) {
      console.error("💥 Google signup error:", err);
      setError("Google signup failed. Please try again.");
      setGoogleLoading(false);
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
            {...register("name", { 
              required: "Full name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters"
              }
            })}
            className="w-full bg-blue-100/10 border border-blue-300/40 focus:border-sky-300 text-blue-50 placeholder-blue-200/60 rounded-xl focus:ring-2 focus:ring-sky-400/60 transition-all text-sm sm:text-base"
          />
          {errors.name && (
            <p className="text-red-200 text-xs mt-1 -mt-3">{errors.name.message}</p>
          )}

          <Input
            label="Email"
            placeholder="Enter your email"
            type="email"
            {...register("email", {
              required: "Email is required",
              validate: {
                matchPattern: (value) =>
                  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                  "Invalid email format",
              },
            })}
            className="w-full bg-blue-100/10 border border-blue-300/40 focus:border-sky-300 text-blue-50 placeholder-blue-200/60 rounded-xl focus:ring-2 focus:ring-sky-400/60 transition-all text-sm sm:text-base"
          />
          {errors.email && (
            <p className="text-red-200 text-xs mt-1 -mt-3">{errors.email.message}</p>
          )}

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            {...register("password", { 
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters"
              }
            })}
            className="w-full bg-blue-100/10 border border-blue-300/40 focus:border-sky-300 text-blue-50 placeholder-blue-200/60 rounded-xl focus:ring-2 focus:ring-sky-400/60 transition-all text-sm sm:text-base"
          />
          {errors.password && (
            <p className="text-red-200 text-xs mt-1 -mt-3">{errors.password.message}</p>
          )}

          <Input
            label="Date of Birth"
            type="date"
            {...register("DOB", { 
              required: "Date of birth is required",
              validate: {
                minAge: (value) => {
                  const age = new Date().getFullYear() - new Date(value).getFullYear();
                  return age >= 13 || "You must be at least 13 years old";
                }
              }
            })}
            className="w-full bg-blue-100/10 border border-blue-300/40 focus:border-sky-300 text-blue-50 placeholder-blue-200/60 rounded-xl focus:ring-2 focus:ring-sky-400/60 transition-all text-sm sm:text-base"
          />
          {errors.DOB && (
            <p className="text-red-200 text-xs mt-1 -mt-3">{errors.DOB.message}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-gray-900 font-semibold py-3 rounded-2xl text-base sm:text-lg tracking-wide transition-all duration-300 transform hover:scale-105 shadow-[0_0_25px_rgba(147,197,253,0.5)]"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        {/* Terms and Privacy */}
        <div className="mt-4 text-center">
          <p className="text-blue-200/60 text-xs">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="text-sky-300 hover:underline">Terms</Link> and{" "}
            <Link to="/privacy" className="text-sky-300 hover:underline">Privacy Policy</Link>
          </p>
        </div>

        {/* Divider */}
        <div className="my-6 sm:my-8 flex items-center">
          <div className="flex-1 border-t border-blue-200/20"></div>
          <span className="px-4 text-blue-200/60 text-sm">Or continue with</span>
          <div className="flex-1 border-t border-blue-200/20"></div>
        </div>

        {/* Google Signup Button - Beautiful Styling */}
        <div className="mb-4 sm:mb-6">
          <Button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white text-gray-700 font-semibold py-3 rounded-2xl text-base sm:text-lg tracking-wide transition-all duration-300 transform hover:scale-105 border border-gray-300/60 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group relative overflow-hidden"
            disabled={googleLoading}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            
            {googleLoading ? (
              <div className="flex items-center justify-center gap-2 relative z-10">
                <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                Connecting to Google...
              </div>
            ) : (
              <>
                <svg className="w-6 h-6 relative z-10 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="relative z-10 font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                  Sign up with Google
                </span>
              </>
            )}
          </Button>
          
          {/* Quick signup hint */}
          <p className="text-center text-blue-200/50 text-xs mt-2">
            ⚡ One-click signup - No forms to fill!
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-blue-200/20 text-center">
          <p className="text-blue-200/70 text-xs sm:text-sm">
            🔒 Your data is securely encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;