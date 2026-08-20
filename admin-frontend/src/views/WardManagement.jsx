"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, MapPin, Search, X, Layers } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";
import WardDustbinsModal from "../components/WardDustbinsModal";

export default function WardManagement() {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // New state for delete modal
  const [selectedWard, setSelectedWard] = useState(null);
  const [wardDustbins, setWardDustbins] = useState([]);
  const [wardName, setWardName] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => { loadWards(); }, []);

  const loadWards = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wards");
      setWards(res.data);
    } catch (err) {
      toast.error("Failed to load wards");
    } finally {
      setLoading(false);
    }
  };

  const handleAddWard = async (e) => {
    e.preventDefault();
    if (!wardName.trim()) {
      setErrors({ wardName: "Ward name is required" });
      return;
    }
    try {
      await api.post("/wards", { name: wardName });
      toast.success("Ward added successfully");
      setWardName("");
      setErrors({});
      setIsAddModalOpen(false);
      loadWards();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add ward");
    }
  };

  const handleEditWard = async (e) => {
    e.preventDefault();
    if (!wardName.trim()) {
      setErrors({ wardName: "Ward name is required" });
      return;
    }
    try {
      await api.put(`/wards/${selectedWard._id}`, { name: wardName });
      toast.success("Ward updated successfully");
      setWardName("");
      setErrors({});
      setSelectedWard(null);
      setIsEditModalOpen(false);
      loadWards();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update ward");
    }
  };

  const handleDeleteWard = (ward) => { // Modified to open modal
    setSelectedWard(ward);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteWard = async () => { // New function for confirming delete
    try {
      await api.delete(`/wards/${selectedWard._id}`);
      toast.success("Ward deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedWard(null);
      loadWards();
    } catch (err) {
      toast.error("Failed to delete ward");
    }
  };

  const openViewModal = async (ward) => {
    try {
      setSelectedWard(ward);
      const res = await api.get(`/wards/${ward._id}/dustbins`);
      setWardDustbins(res.data);
      setIsViewModalOpen(true);
    } catch (err) {
      toast.error("Failed to load dustbin info");
    }
  };

  const filteredWards = wards.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBins = wards.reduce((acc, w) => acc + (w.dustbinCount || 0), 0);

  return (
    <div className="space-y-6 p-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-0.5">Main › Operational Management › Ward Management</p>
          <h1 className="text-xl font-black text-gray-800">Ward Management</h1>
        </div>
        <button
          onClick={() => { setIsAddModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-semibold text-sm shadow-lg btn-lift transition-all"
          style={{ background: 'linear-gradient(135deg, #1f9e9a, #16a34a)', boxShadow: '0 4px 16px rgba(31,158,154,0.3)' }}
        >
          <Plus size={17} /> Add Ward
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Wards', value: wards.length, icon: Layers, color: 'from-[#1f9e9a] to-[#16847f]' },
          { label: 'Total Dustbins', value: totalBins, icon: MapPin, color: 'from-emerald-500 to-emerald-700' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm flex-shrink-0`}>
              <Icon size={19} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-2xl font-black text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Ward List</h2>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 w-60 border border-transparent focus-within:border-teal-300/50">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search ward…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-xs bg-transparent text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['#', 'Ward Name', 'Dustbins', 'Actions'].map(h => (
                  <th key={h} className={`px-6 py-3.5 text-white text-[10px] font-bold uppercase tracking-wider bg-[#1f9e9a] ${h === 'Actions' ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 text-sm">Loading wards…</td></tr>
              ) : filteredWards.length > 0 ? (
                filteredWards.map((w, idx) => (
                  <tr key={w._id} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-teal-50/30`}>
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-bold text-gray-400">{String(idx + 1).padStart(2, '0')}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(31,158,154,0.1)' }}>
                          <MapPin size={14} className="text-teal-600" />
                        </div>
                        <span className="font-semibold text-gray-800">{w.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">{w.dustbinCount} Bins</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => openViewModal(w)}
                          className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => { setSelectedWard(w); setIsEditModalOpen(true); }}
                          className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteWard(w)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 text-sm">No wards found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WardDustbinsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        wardName={selectedWard?.name}
        dustbins={wardDustbins}
      />

      <AddWardModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setErrors({}); }}
        onSuccess={loadWards}
        wardName={wardName}
        setWardName={setWardName}
        handleAddWard={handleAddWard}
        errors={errors}
        setErrors={setErrors}
      />

      <EditWardModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setErrors({}); }}
        wardName={wardName}
        setWardName={setWardName}
        handleEditWard={handleEditWard}
        errors={errors}
        setErrors={setErrors}
      />

      <DeleteWardModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        ward={selectedWard}
        onConfirm={confirmDeleteWard}
      />
    </div>
  );
}

// LOCAL MODAL COMPONENTS
function AddWardModal({ isOpen, onClose, wardName, setWardName, handleAddWard, errors, setErrors }) {
  if (!isOpen) return null;
  return (
 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto modal-overlay"> 
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="p-5 border-b flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1f9e9a, #16a34a)' }}>
          <h3 className="text-white font-bold text-sm">Add New Ward</h3>
          <button onClick={onClose} className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleAddWard} className="p-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Ward Name</label>
            {errors.wardName && <span className="text-[10px] text-red-500 font-bold">{errors.wardName}</span>}
          </div>
          <input
            type="text"
            value={wardName}
            onChange={(e) => {
              setWardName(e.target.value);
              if (errors.wardName) setErrors(prev => ({ ...prev, wardName: "" }));
            }}
            placeholder="e.g. Aquem"
            className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${errors.wardName
              ? 'border-red-300 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 focus:border-teal-300 focus:ring-2 focus:ring-teal-100'
              }`}
            autoFocus
          />
          <button
            type="submit"
            className="w-full mt-5 py-3 rounded-xl text-white font-bold text-sm shadow-lg btn-lift"
            style={{ background: 'linear-gradient(135deg, #1f9e9a, #16a34a)' }}
          >
            Save Ward
          </button>
        </form>
      </div>
    </div>
  );
}

function EditWardModal({ isOpen, onClose, wardName, setWardName, handleEditWard, errors, setErrors }) {
  if (!isOpen) return null;
  return (
 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto modal-overlay"> 
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="p-5 border-b flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          <h3 className="text-white font-bold text-sm">Edit Ward</h3>
          <button onClick={onClose} className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleEditWard} className="p-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Ward Name</label>
            {errors.wardName && <span className="text-[10px] text-red-500 font-bold">{errors.wardName}</span>}
          </div>
          <input
            type="text"
            value={wardName}
            onChange={(e) => {
              setWardName(e.target.value);
              if (errors.wardName) setErrors(prev => ({ ...prev, wardName: "" }));
            }}
            placeholder="e.g. Aquem"
            className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${errors.wardName
              ? 'border-red-300 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100'
              }`}
            autoFocus
          />
          <button
            type="submit"
            className="w-full mt-5 py-3 rounded-xl text-white font-bold text-sm shadow-lg btn-lift"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            Update Ward
          </button>
        </form>
      </div>
    </div>
  );
}

function DeleteWardModal({ isOpen, onClose, ward, onConfirm }) {
  if (!isOpen) return null;
  return (
 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto modal-overlay"> 
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={30} />
        </div>
        <h3 className="text-lg font-black text-gray-800">Delete Ward?</h3>
        <p className="text-gray-500 text-sm mt-2 mb-6">Are you sure you want to delete <span className="font-bold text-gray-700">{ward?.name}</span>? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
