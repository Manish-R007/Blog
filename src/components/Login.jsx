import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { login } from '../store/authSlice'
import authService from '../appwrite/auth'
import Logo from '../components/Logo'
import Button from '../components/Button'
import Input from '../components/Input'

function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const authStatus = useSelector((state) => state.auth.status)

    // Redirect if already logged in
    useEffect(() => {
        if (authStatus) {
            console.log("✅ User already logged in, redirecting to home")
            navigate("/")
        }
    }, [authStatus, navigate])

    const handleLogin = async (data) => {
        setLoading(true)
        setError("")

        try {
            console.log("🔐 Attempting login for:", data.email)
            
            const result = await authService.login({
                email: data.email,
                password: data.password
            })

            console.log("🔍 Login result:", result)

            if (result.success) {
                console.log("✅ Login successful, user data:", result.userData)
                
                // Dispatch to Redux store
                dispatch(login({ userData: result.userData }))
                
                console.log("✅ Redux state updated, navigating to home")
                navigate("/")
            } else {
                console.error("❌ Login failed:", result.error)
                setError(result.error || "Login failed. Please check your credentials.")
            }
        } catch (err) {
            console.error("💥 Login error:", err)
            setError("Login failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

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
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-blue-100/90 text-sm sm:text-base">
                        Sign in to your <span className="text-sky-300 font-semibold">BlogSphere</span> account ✨
                    </p>
                </div>

                {/* Don't have account */}
                <p className="text-center text-blue-200/70 mb-4 sm:mb-6 text-sm sm:text-base">
                    Don't have an account?{" "}
                    <Link
                        to="/signup"
                        className="font-semibold text-sky-300 hover:text-blue-100 transition-colors duration-200 hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-400/40 rounded-lg p-3 mb-4 sm:mb-6 text-center shadow-[0_0_15px_rgba(255,99,71,0.2)]">
                        <p className="text-red-200 text-xs sm:text-sm">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(handleLogin)} className="space-y-4 sm:space-y-5">
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

                    <Link to="/forgot-password" className="block text-sm text-left text-white hover:text-blue-100 hover:underline transition mb-2 ml-0">
                    forgot password?
                    </Link>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-gray-900 font-semibold py-3 rounded-2xl text-base sm:text-lg tracking-wide transition-all duration-300 transform hover:scale-105 shadow-[0_0_25px_rgba(147,197,253,0.5)]"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                                Logging In...
                            </div>
                        ) : (
                            "Login here"
                        )}
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
    )
}

export default Login