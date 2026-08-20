"use client";

import { useEffect, useState } from "react";
import api from "../api/axios";
import { Edit2, Shield, Calendar, CreditCard, ChevronRight } from "lucide-react";
import DeactivateProfileModal from "../components/DeactivateProfileModal";
import { toast } from "react-toastify";
import { useTheme } from "../contexts/ThemeContext";

export default function ProfileSettings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState({});
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get("/auth/profile");
        setProfile(data);
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const toggleEdit = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateProfile = () => {
    if (!profile.contact?.trim()) {
      toast.error("Contact number is required");
      return false;
    }
    if (!profile.email?.trim()) {
      toast.error("Email is required");
      return false;
    }
    return true;
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "—";

  const saveProfile = async () => {
    if (saving) return;
    if (!validateProfile()) return;

    setSaving(true);
    const toastId = toast.loading("Updating profile...");

    try {
      await api.put("/auth/profile", {
        contact: profile.contact,
        email: profile.email,
      });
      toast.update(toastId, { render: "Profile updated successfully!", type: "success", isLoading: false, autoClose: 3000 });
      setIsEditing({});
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || "Profile update failed", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="p-10 text-center bg-white rounded-2xl border border-red-50 text-red-500 font-bold">
      Failed to retrieve profile data. Please try again later.
    </div>
  );

  const sub = profile.subscription;
  const isActive = sub?.status?.toLowerCase() === "active";

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">Main › Settings › Profile</p>
        <h1 className="text-xl font-black text-gray-800">Your Account Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg shadow-teal-100">
              {profile.name?.charAt(0) || 'A'}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mt-1">Panchayat Administrator</p>
            <div className="mt-6 pt-6 border-t border-gray-50 flex justify-center gap-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
                <p className="text-xs font-bold text-emerald-600">Verified</p>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Joined</p>
                <p className="text-xs font-bold text-gray-700">{formatDate(profile.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="p-2 bg-white/10 rounded-lg"><CreditCard size={18} /></div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {isActive ? 'Active Plan' : 'Expired'}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Current Subscription</p>
            <h3 className="text-xl font-black mt-1 mb-4">{sub?.plan || 'Basic Plan'}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Valid Until</span>
                <span className="font-bold">{formatDate(sub?.endDate)}</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detailed Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
              <h3 className="font-bold text-gray-800">Account Details</h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Contact Field */}
              <div className={`p-4 rounded-xl border transition-all ${isEditing.contact ? 'border-teal-500 ring-2 ring-teal-50' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <button onClick={() => toggleEdit('contact')} className="text-teal-600 hover:text-teal-700 p-1">
                    <Edit2 size={16} />
                  </button>
                </div>
                {isEditing.contact ? (
                  <input
                    value={profile.contact}
                    onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
                    className="w-full bg-transparent text-sm font-bold text-gray-900 outline-none"
                    autoFocus
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-800">{profile.contact || 'Not set'}</p>
                )}
              </div>

              {/* Email Field */}
              <div className={`p-4 rounded-xl border transition-all ${isEditing.email ? 'border-teal-500 ring-2 ring-teal-50' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                  <button onClick={() => toggleEdit('email')} className="text-teal-600 hover:text-teal-700 p-1">
                    <Edit2 size={16} />
                  </button>
                </div>
                {isEditing.email ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-transparent text-sm font-bold text-gray-900 outline-none"
                    autoFocus
                    placeholder="Enter email address"
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-800">{profile.email || 'Not set'}</p>
                )}
              </div>

              {/* Security Note */}
              <div className={`flex items-start gap-4 p-4 rounded-xl border ${isDark ? 'bg-blue-900/30 border-blue-800/50' : 'bg-blue-50 border-blue-100'}`}>
                <div className={`p-2 rounded-lg shadow-sm ${isDark ? 'bg-slate-800 text-blue-400' : 'bg-white text-blue-600'}`}>
                  <Shield size={18} />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isDark ? 'text-blue-200' : 'text-blue-900'}`}>Security & Privacy</h4>
                  <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                    Some account details like your Panchayat Name and Root Admin status are managed by Ecosyz Support.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between gap-4">
              <button
                onClick={() => setIsDeactivateOpen(true)}
                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
              >
                Permanently Delete Account
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition shadow-lg shadow-teal-100 disabled:opacity-50"
              >
                {saving ? "Updating..." : "Save All Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <DeactivateProfileModal
        isOpen={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
        profile={profile}
      />
    </div>
  );
}
