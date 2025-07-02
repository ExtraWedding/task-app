import React, { useEffect, useState } from 'react'
import {toast, ToastContainer} from 'react-toastify'
import { BACK_BUTTON, DANGER_BTN, FULL_BUTTON, INPUT_WRAPPER, personalFields, SECTION_WRAPPER, securityFields } from '../assets/dummy'
import { ChevronLeft, CircleDotDashed, Key, Lock, LogOut, Save, Shield, UserCircle } from 'lucide-react'
import {  useNavigate } from 'react-router-dom' // Tambahkan ini
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL;

const Profile = ({setCurrentUser, onLogout}) => {

  const navigate = useNavigate() // Tambahkan ini
  const [profile, setProfile] = useState({name: "", email: ""})
  const [password, setPassword] =useState({current: "", new: "", confirm: ""})

  useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) return
      axios.get(`${API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
      })
      .then(({ data }) => {
          if (data.success) {
              setProfile({ name: data.user.name, email: data.user.email })
          } else {
              toast.error(data.message);
          }
      })
      .catch(() => toast.error("UNABLE TO LOAD PROFILE"))
  }, [])

  const saveProfile = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("You are not logged in.");
        return;
      }

      const { data } = await axios.put(
        `${API_URL}/api/user/profile`,
        {
          name: profile.name,
          email: profile.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setCurrentUser((prev) => ({
          ...prev,
          name:profile.name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`
        }))
        toast.success("Profile Update");
      } else {
        toast.error(data.message || "Failed to update profile.");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Profile update failed";
      toast.error(msg);
    }
  };

    const changePassword = async (e) => {
      e.preventDefault();
      if (password.new !== password.confirm) {
        return toast.error("Passwords do not match");
      }
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
          `${API_URL}/api/user/password`,
          {
            currentPassword: password.current,
            newPassword: password.new
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (response.data.success) {
          toast.success("Password changed successfully");
          setPassword({ current: "", new: "", confirm: "" });
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        const msg = error.response?.data?.message || "Password change failed";
        toast.error(msg);
      }
    };

  return (
    <div className='min-h-screen bg-gray-50'>
      <ToastContainer position='top-center' autoClose={3000} />
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => navigate(-1)} className={BACK_BUTTON}>
          <ChevronLeft className='w-5 h-5 mr-1' />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {profile.name? profile.name[0].toUpperCase() : "U"}          
          </div>
          <div>
            <h1 className=" text-3xl font-bold to-gray-800">Account Setting</h1>
            <p className=" text-gray-400 text-sm">Manage your profile and security settings</p>
          </div>
        </div>

        <div className=" grid md:grid-cols-2 gap-8">
          <section className={SECTION_WRAPPER}>
            <div className=' flex items-center gap-2 mb-6'>
              <UserCircle className=' text-purple-500 w-5 h-5' />
              <h2 className=" text-xl font-semibold text-gray-800">Personal Informasi</h2>
            </div>

            {/* PERSONAL INFOMASITION */}
            <form onSubmit={saveProfile} className=' space-y-4'>
              {personalFields.map(({name, type, placeholder, icon: Icon}) => (
                <div key={name} className={INPUT_WRAPPER}>
                  {Icon && <Icon className=' text-purple-500 w-5 h-5 mr-2' />}
                  <input type={type} placeholder={placeholder} value={profile[name]} onChange={(e) => setProfile({...profile, [name]: e.target.value})} className=' w-full focus:outline-none text-sm' required />
                </div>
              ))}
              <button className={FULL_BUTTON}>
                <Save className=' w-4 h-4' /> Save Change
              </button>
            </form>
          </section>

          <section className={SECTION_WRAPPER}>
            <div className=' flex items-center gap-2 mb-6'>
              <Shield className=' text-purple-500 w-5 h-5' />
              <h2 className=" text-xl font-semibold text-gray-800">Security Password</h2>
            </div>

            <form onSubmit={changePassword} className=' space-y-4'>
              {securityFields.map(({name, placeholder})=> (
                <div key={name} className={INPUT_WRAPPER}>
                  <Lock className=' text-purple-500 w-5 h5 mr-2'  />
                  <input type="password" placeholder={placeholder} value={password[name]} onChange={(e) => setPassword({...password, [name]: e.target.value})} className=' w-full focus:outline-none text-sm' required />
                </div>
              ))}
              <button className={FULL_BUTTON}>
                <Shield className=' w-4 h-4' /> Change Password
              </button>

              <div className="mt-8 pt-6 border-t border-purple-100">
                <h3 className="text-red-600 font-semibold mb-4 flex items-center gap-2">
                    <LogOut className=' w-4 h-4' /> Danger
                </h3>
                <button className={DANGER_BTN} onClick={onLogout}>
                  Logout
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Profile