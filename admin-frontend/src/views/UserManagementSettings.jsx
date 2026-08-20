"use client";

import { useState, useEffect } from 'react'
import { Search, Upload, User as UserIcon, Settings, Plus, Eye } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import { toast } from 'react-toastify'
import ProfileSettingsModal from '../components/ProfileSettingsModal'
import ViewProfileModal from '../components/ViewProfileModal'
import EditProfileModal from '../components/EditProfileModal'
import DeactivateUserModal from '../components/DeactivateUserModal'

export default function UserManagementSettings() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [errors, setErrors] = useState({})

  const [searchTerm, setSearchTerm] = useState('')
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [viewUser, setViewUser] = useState(null)
  const [editUser, setEditUser] = useState(null)
  const [deleteUser, setDeleteUser] = useState(null)
  
  const handleViewUser = (user) => setViewUser(user)
  const handleEditUser = (user) => setEditUser(user)
  const handleDeleteUser = (user) => setDeleteUser(user)

  const [newUser, setNewUser] = useState({
    fullName: '',
    contact: '',
    email: '',
    photo: null,
    role: 'select role',
    status: true,
    permissions: [],
  })

  const validateField = (name, value) => {
    let error = ""
    switch (name) {
      case 'fullName':
        if (!value.trim()) error = "Name is required"
        break
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value.trim()) error = "Email is required"
        else if (!emailRegex.test(value)) error = "Invalid email format"
        break
      case 'contact':
        const mobileRegex = /^\d{10}$/
        if (!value.trim()) error = "Contact is required"
        else if (!mobileRegex.test(value)) error = "Must be 10 digits"
        break
      case 'role':
        if (value === 'select role') error = "Please select a role"
        break
      default:
        break
    }
    setErrors(prev => ({ ...prev, [name]: error }))
    return error
  }

  useEffect(() => {
    fetchUsers()
    fetchProfile()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch (err) {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile')
      setProfile(res.data)
    } catch (err) {
      console.error('Failed to fetch profile', err)
    }
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u._id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddUser = async (e) => {
    e.preventDefault()
    const e1 = validateField('fullName', newUser.fullName)
    const e2 = validateField('email', newUser.email)
    const e3 = validateField('contact', newUser.contact)
    const e4 = validateField('role', newUser.role)

    if (e1 || e2 || e3 || e4) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', newUser.fullName)
      formData.append('mobile', newUser.contact)
      formData.append('email', newUser.email)
      formData.append('role', newUser.role.toUpperCase())
      formData.append('isActive', newUser.status)
      if (newUser.photo) formData.append('photo', newUser.photo)
      newUser.permissions.forEach(p => formData.append('permissions[]', p))

      const res = await api.post('/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUsers([...users, res.data])
      setNewUser({
        fullName: '',
        contact: '',
        email: '',
        photo: null,
        role: 'select role',
        status: true,
        permissions: [],
      })
      setErrors({})
      toast.success('User added successfully!')
    } catch (err) {
      if (err.response?.data?.message === "User already exists") {
        setErrors(prev => ({ ...prev, contact: "User already exists" }))
      }
      toast.error(err.response?.data?.message || 'Failed to add user')
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">Analytics & Settings › User Management & Settings</p>
        <h1 className="text-xl font-black text-gray-800">User Management & Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: USER PROFILE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
              <UserIcon size={20} />
            </div>
            <h3 className="font-bold text-gray-800">Your Current Profile</h3>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-32 h-32 rounded-full border-4 border-teal-50 overflow-hidden shadow-inner">
              {profile?.profilePhoto ? (
                <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                  <UserIcon size={48} />
                </div>
              )}
            </div>
            <div>
              <h5 className="text-lg font-bold text-gray-900">{profile?.name || 'Loading...'}</h5>
              <p className="text-sm text-teal-600 font-medium capitalize">{profile?.role || 'Admin'}</p>
            </div>
            <button
              onClick={() => navigate('/profile-settings')}
              className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition shadow-lg shadow-teal-100 flex items-center justify-center gap-2"
            >
              <Settings size={18} />
              Manage Your Profile
            </button>
          </div>
        </div>

        {/* SECTION 2: ADD NEW USER */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Plus size={20} />
            </div>
            <h3 className="font-bold text-gray-800">Create New User Account</h3>
          </div>

          <form className="space-y-4" onSubmit={handleAddUser}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={newUser.fullName}
                  onChange={(e) => {
                    setNewUser({...newUser, fullName: e.target.value})
                    validateField('fullName', e.target.value)
                  }}
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500 transition-all ${errors.fullName ? 'border-red-300' : 'border-transparent'}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Profile Photo</label>
                <div 
                  onClick={() => document.getElementById('user-photo-upload').click()}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-100 transition"
                >
                  <Upload size={16} className="text-gray-400 mr-2" />
                  <span className="text-xs text-gray-500 truncate max-w-[120px]">
                    {newUser.photo ? newUser.photo.name : 'Upload file'}
                  </span>
                </div>
                <input id="user-photo-upload" type="file" accept="image/*" className="hidden" 
                  onChange={(e) => e.target.files[0] && setNewUser({...newUser, photo: e.target.files[0]})} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Contact Number</label>
                <input
                  type="text"
                  placeholder="10-digit number"
                  value={newUser.contact}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setNewUser({...newUser, contact: val})
                    validateField('contact', val)
                  }}
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500 transition-all ${errors.contact ? 'border-red-300' : 'border-transparent'}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={newUser.email}
                  onChange={(e) => {
                    setNewUser({...newUser, email: e.target.value})
                    validateField('email', e.target.value)
                  }}
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500 transition-all ${errors.email ? 'border-red-300' : 'border-transparent'}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Access Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => {
                    setNewUser({...newUser, role: e.target.value})
                    validateField('role', e.target.value)
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-teal-500 transition-all"
                >
                  <option value="select role">Select role...</option>
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Staff</option>
                  <option>Supervisor</option>
                  <option>Employee</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Account Status</label>
                <div className="flex items-center h-[42px] gap-3">
                  <div className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${newUser.status ? 'bg-teal-500' : 'bg-gray-300'}`}
                    onClick={() => setNewUser({...newUser, status: !newUser.status})}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${newUser.status ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{newUser.status ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Permissions</label>
              <div className="flex gap-6">
                {['View', 'Edit', 'Delete'].map(perm => (
                  <label key={perm} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={newUser.permissions.includes(perm)}
                      onChange={(e) => {
                        const next = e.target.checked 
                          ? [...newUser.permissions, perm] 
                          : newUser.permissions.filter(p => p !== perm)
                        setNewUser({...newUser, permissions: next})
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-teal-600 transition-colors">{perm}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition shadow-lg shadow-teal-50">Save Account</button>
              <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      {/* SECTION 3: USER MANAGEMENT TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-bold text-gray-800">All Project Users</h3>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact Details</th>
                <th className="px-6 py-4">Access Level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.profilePhoto || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full border bg-gray-100" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">ID: {user._id?.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">{user.email}</p>
                    <p className="text-xs text-gray-400">{user.mobile}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg uppercase tracking-wide">{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      <span className={`text-xs font-semibold ${user.isActive ? 'text-emerald-700' : 'text-gray-500'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.isMainAccount ? (
                      <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">ROOT ADMIN</span>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleViewUser(user)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Eye size={16} /></button>
                        <button onClick={() => handleEditUser(user)} className="p-2 text-gray-400 hover:text-orange-600 transition-colors"><Settings size={16} /></button>
                        <button onClick={() => handleDeleteUser(user)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isProfileModalOpen && (
          <ProfileSettingsModal 
            key="profile-modal"
            isOpen={isProfileModalOpen} 
            onClose={() => setIsProfileModalOpen(false)} 
          />
        )}
        {viewUser && (
          <ViewProfileModal 
            key="view-modal"
            isOpen={!!viewUser} 
            onClose={() => setViewUser(null)} 
            user={viewUser} 
            onEdit={handleEditUser} 
            onDelete={handleDeleteUser} 
          />
        )}
        {editUser && (
          <EditProfileModal 
            key="edit-modal"
            isOpen={!!editUser} 
            onClose={() => setEditUser(null)} 
            user={editUser} 
            onSave={async (updatedData) => {
              try {
                const formData = new FormData()
                formData.append('name', updatedData.name)
                formData.append('mobile', updatedData.mobile)
                formData.append('email', updatedData.email)
                formData.append('role', updatedData.role)
                formData.append('isActive', updatedData.isActive)
                if (updatedData.photo instanceof File) formData.append('photo', updatedData.photo)
                updatedData.permissions?.forEach(p => formData.append('permissions[]', p))
                const res = await api.put(`/users/${updatedData._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                setUsers(users.map(u => u._id === res.data._id ? res.data : u))
                setEditUser(null)
                toast.success('User updated successfully')
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to update user')
              }
            }} 
          />
        )}
        {deleteUser && (
          <DeactivateUserModal 
            key="delete-modal"
            isOpen={!!deleteUser} 
            onClose={() => setDeleteUser(null)} 
            user={deleteUser} 
            onDeactivate={async (user) => {
              try {
                await api.delete(`/users/${user._id}`)
                setUsers(users.filter(u => u._id !== user._id))
                setDeleteUser(null)
                toast.success('User deleted successfully')
              } catch (err) {
                toast.error('Failed to delete user')
              }
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function Trash2(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
}