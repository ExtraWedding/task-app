import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { Pencil, Save, Lock, Shield, X, User, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';


const API_URL = import.meta.env.VITE_API_URL;
const USERS_PER_PAGE = 5;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const indexOfLastUser = currentPage * USERS_PER_PAGE;
  const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEdit = (user) => {
    setEditUser({ ...user });
    setPasswordData({ newPassword: '', confirmPassword: '' });
  };

  const handleCancel = () => {
    setEditUser(null);
    setPasswordData({ newPassword: '', confirmPassword: '' });
  };

  const handleSaveProfile = async () => {
    if (!editUser.name || !editUser.email) {
      return toast.error('Name and email cannot be empty');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editUser.email)) {
      return toast.error('Invalid email format');
    }

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(
        `${API_URL}/api/user/profile/${editUser._id}`,
        { name: editUser.name, email: editUser.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success('Profile updated successfully');
        fetchUsers();
        setEditUser(null);
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      return toast.error('Please fill in both password fields');
    }
    if (passwordData.newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(
        `${API_URL}/api/user/password/${editUser._id}`,
        { newPassword: passwordData.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success('Password reset successfully');
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setEditUser(null);
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-purple-700 flex items-center gap-2">
          <User className="w-8 h-8" /> User Management
        </h1>
        <div className="text-sm text-gray-600">
          Total Users: {users.length}
        </div>
      </div>

      {editUser ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Pencil className="w-5 h-5" /> Editing: {editUser.name}
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Save className="w-4 h-4" /> Save Profile
              </button>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-500" /> Password Reset
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={handleChangePassword}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                <Shield className="w-4 h-4" /> Reset Password
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User List</h2>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>
          <div className="divide-y">
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 bg-purple-100 text-purple-800 rounded-full p-3">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(user)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No users found
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {users.length > USERS_PER_PAGE && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ChevronLeft className="w-5 h-5" /> Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === number
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageUsers;