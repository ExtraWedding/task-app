import { Eye, EyeOff, Lock, LogIn, Mail, AlertTriangle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const INITIAL_FORM = { email: "", password: "" }

const Login = ({ onSubmit, onSwitchMode}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")
    if (token) {
        (async () => {
          try {
             const {data} = await axios.get(`${API_URL}/api/user/me`, {
              headers: {Authorization: `Bearer ${token}`},
             })
             if (data.success) {
                onSubmit?.({token, userId, ...data.user})
                toast.success("Session restored, Redirecting...")
                navigate('/')
             } else{
                localStorage.clear()
             }
          } catch {
             localStorage.clear()
          }
        })()
    }
  }, [navigate, onSubmit, API_URL])

  const handleSubmit = async (e) => {
    e.preventDefault();  
    if (!rememberMe) {
      toast.error('You must enable "Remember Me" to login')
      return
    } 
    setLoading(true)

    try {
      const {data} = await axios.post(`${API_URL}/api/user/login`, formData)
      if (!data.token) throw new Error(data.message || data.massage || 'Login Failed')

      localStorage.setItem("token", data.token)
      localStorage.setItem("userId", data.user.id)
      localStorage.setItem("role", data.user.role)
      setFormData(INITIAL_FORM)
      onSubmit?.({token:data.token, userId:data.user.id, ...data.user})
      toast.success("Login Successfully.")
      setTimeout(() => navigate('/'), 1000)
    } catch (error) {
      // Perbaikan utama di sini
      const errorMsg = error.response?.data?.message || error.response?.data?.massage || error.message;
      
      if (errorMsg.includes("Not Found") || errorMsg.includes("not found")) {
        toast.error(
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="font-medium text-gray-800">Account Not Found</p>
            <p className="text-center text-gray-600">The email you entered doesn't match any account</p>
          </div>,
          {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      } else {
        toast.error(errorMsg || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSwitchMode = () => {
    toast.dismiss()
    onSwitchMode?.()
  }

  const fields = [
    {
        name: "email",
        type: "email",
        placeholder: "Email",
        icon: Mail,
    },
    {
        name: "password",
        type: showPassword ? "text" : "password",
        placeholder: "Password",
        icon: Lock,
        isPassword: true
    }
  ]

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue to TaskOrganizer
          </p>
        </div>

        <div className="mt-8 bg-white py-6 px-4 sm:py-8 sm:px-6 shadow-xl rounded-xl sm:rounded-2xl border border-purple-100">
          <ToastContainer 
              position="top-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
          />

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {fields.map(({name, type, placeholder, icon: Icon, isPassword}) => (
              <div key={name} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {Icon && <Icon className="h-5 w-5 text-purple-500" />}
                </div>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={formData[name]}
                  onChange={(e) => setFormData({...formData, [name]: e.target.value})}
                  className="block w-full pl-10 pr-12 py-2 sm:py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all focus:outline-none"
                  required
                />
                {isPassword && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                )}
              </div>
            ))}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Remember Me
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-2 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                "Logging in..."
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                className="font-medium text-purple-600 hover:text-purple-700 hover:underline transition-colors"
                onClick={handleSwitchMode}
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login