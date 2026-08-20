"use client";

import { useEffect, useState } from "react";
import { X, UserPlus, Camera, FileText, Car, Upload } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", employeeCode: "", phone: "", address: "",
    role: "Collector", wards: [], joiningDate: "",
  });
  const [errors, setErrors] = useState({});
  const [wards, setWards] = useState([]);
  const [files, setFiles] = useState({ photo: null, idProof: null, license: null });
  const [preview, setPreview] = useState({ photo: null, idProof: null, license: null });

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isOpen]);

  useEffect(() => {
    api.get("/wards").then(res => setWards(res.data)).catch(() => { });
  }, []);

  useEffect(() => {
    return () => Object.values(preview).forEach(p => { if (p?.url) URL.revokeObjectURL(p.url); });
  }, [preview]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = e.target.name;
    // Validate file type
    const isPhoto = name === 'photo';
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedDocTypes = [...allowedImageTypes, 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (isPhoto && !allowedImageTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [name]: 'Only JPG, PNG, GIF or WEBP images are allowed.' }));
      e.target.value = '';
      return;
    }
    if (!isPhoto && !allowedDocTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [name]: 'Only PDF, JPG, PNG, DOC or DOCX files are allowed.' }));
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [name]: 'File size must be under 5 MB.' }));
      e.target.value = '';
      return;
    }
    setFiles(p => ({ ...p, [name]: file }));
    setPreview(p => ({ ...p, [name]: { url: URL.createObjectURL(file), type: file.type, name: file.name, key: Date.now() } }));
    e.target.value = "";
  };
  const toggleWard = (name) => {
    setForm(p => {
      const newWards = p.wards.includes(name) ? p.wards.filter(w => w !== name) : [...p.wards, name];
      if (newWards.length > 0) setErrors(prev => ({ ...prev, wards: "" }));
      return { ...p, wards: newWards };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.employeeCode.trim()) newErrors.employeeCode = "Code is required";

    const phoneRegex = /^\d{10}$/;
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    else if (!phoneRegex.test(form.phone)) newErrors.phone = "Invalid 10-digit phone";

    if (!form.address.trim()) newErrors.address = "Address is required";
    if (form.wards.length === 0) newErrors.wards = "Select at least one ward";
    if (!form.joiningDate) newErrors.joiningDate = "Joining date is required";

    if (!files.photo) newErrors.photo = "Photo is required";
    if (!files.idProof) newErrors.idProof = "ID proof is required";
    if (form.role === "Driver" && !files.license) newErrors.license = "License is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'wards') v.forEach(w => fd.append("wards", w));
        else fd.append(k, v);
      });
      fd.append("photo", files.photo);
      fd.append("idProof", files.idProof);
      if (files.license) fd.append("license", files.license);
      await api.post("/employees", fd);
      toast.success("Employee added successfully");
      setForm({ name: "", employeeCode: "", phone: "", address: "", role: "Collector", wards: [], joiningDate: "" });
      setFiles({ photo: null, idProof: null, license: null });
      setPreview({ photo: null, idProof: null, license: null });
      setErrors({});
      onClose(); onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Add employee failed");
    } finally { setLoading(false); }
  };

  return (
    <>
 <div className="fixed inset-0 modal-overlay bg-black/50 backdrop-blur-sm z-[9999]" onClick={onClose} /> 
 <div className="fixed inset-0 modal-overlay z-[9999] flex items-center justify-center p-4"> 
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 animate-fade-in-up overflow-hidden max-h-[92vh] flex flex-col">

          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1f9e9a, #22c55e)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <UserPlus size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider">New Record</p>
                <h2 className="text-white font-bold">Add Employee</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">

            {/* Basic Info */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Basic Information</p>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Employee Name *" error={errors.name}>
                  <StyledInput name="name" value={form.name} onChange={handleChange} placeholder="Full name" error={errors.name} />
                </FormField>
                <FormField label="Employee Code *" error={errors.employeeCode}>
                  <StyledInput name="employeeCode" value={form.employeeCode} onChange={handleChange} placeholder="EMP-001" error={errors.employeeCode} />
                </FormField>
                <FormField label="Phone Number *" error={errors.phone}>
                  <StyledInput name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number" error={errors.phone} />
                </FormField>
                <FormField label="Joining Date *" error={errors.joiningDate}>
                  <StyledInput type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} error={errors.joiningDate} />
                </FormField>
                <FormField label="Role *" full error={errors.role}>
                  <StyledSelect name="role" value={form.role} onChange={handleChange} error={errors.role}>
                    <option>Collector</option>
                    <option>Driver</option>
                    <option>Supervisor</option>
                    <option>Helper</option>
                  </StyledSelect>
                </FormField>
                <FormField label="Address *" full error={errors.address}>
                  <StyledTextarea name="address" rows={2} value={form.address} onChange={handleChange} placeholder="Full address" error={errors.address} />
                </FormField>
              </div>
            </div>

            {/* Ward Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ward Assignment *</p>
                {errors.wards && <span className="text-[10px] text-red-500 font-bold">{errors.wards}</span>}
              </div>
              <div className={`flex flex-wrap gap-2 p-3 bg-gray-50 border rounded-xl min-h-[52px] transition-colors ${errors.wards ? 'border-red-200 bg-red-50/20' : 'border-gray-100'}`}>
                {wards.map(w => {
                  const checked = form.wards.includes(w.name);
                  return (
                    <label key={w._id} onClick={() => toggleWard(w.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all text-sm font-medium select-none ${checked ? 'bg-teal-50 border-teal-400 text-teal-700' : 'bg-white border-gray-200 text-gray-700 hover:border-teal-200'
                        }`}>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${checked ? 'bg-teal-500 border-teal-500' : 'border-gray-300'}`}>
                        {checked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      {w.name}
                    </label>
                  );
                })}
                {wards.length === 0 && <p className="text-gray-400 text-xs py-1">No wards found...</p>}
              </div>
            </div>

            {/* Documents */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Documents</p>
              <div className="grid grid-cols-1 gap-3">
                <UploadCard icon={<Camera size={14} />} label="Employee Photo *" name="photo" file={files.photo} preview={preview.photo} onChange={handleFileChange} error={errors.photo} accept="image/*" />
                <UploadCard icon={<FileText size={14} />} label="ID Proof *" name="idProof" file={files.idProof} preview={preview.idProof} onChange={handleFileChange} error={errors.idProof} accept="image/*,.pdf,.doc,.docx" />
                {form.role === "Driver" && (
                  <UploadCard icon={<Car size={14} />} label="Driving License *" name="license" file={files.license} preview={preview.license} onChange={handleFileChange} error={errors.license} accept="image/*,.pdf,.doc,.docx" />
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-4 border-t border-gray-50 flex gap-3 flex-shrink-0">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #1f9e9a, #22c55e)' }}>
              {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><UserPlus size={14} /> Add Employee</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function FormField({ label, children, full, error }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
        {error && <span className="text-[10px] text-red-500 font-bold">{error}</span>}
      </div>
      {children}
    </div>
  );
}
function StyledInput({ error, ...props }) {
  return <input {...props} className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition-all placeholder-gray-300 ${error ? 'border-red-300 focus:ring-red-400/20 focus:border-red-400' : 'border-gray-200 focus:ring-teal-400/30 focus:border-teal-400'}`} />;
}
function StyledTextarea({ error, ...props }) {
  return <textarea {...props} className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white resize-none focus:outline-none focus:ring-2 transition-all placeholder-gray-300 ${error ? 'border-red-300 focus:ring-red-400/20 focus:border-red-400' : 'border-gray-200 focus:ring-teal-400/30 focus:border-teal-400'}`} />;
}
function StyledSelect({ children, error, ...props }) {
  return <select {...props} className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-300 focus:ring-red-400/20 focus:border-red-400' : 'border-gray-200 focus:ring-teal-400/30 focus:border-teal-400'}`}>{children}</select>;
}
function UploadCard({ icon, label, name, file, preview, onChange, error, accept }) {
  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${error ? 'border-red-200 bg-red-50/10' : 'border-gray-100'}`}>
      <label className="flex items-center gap-3 p-3 bg-gray-50 cursor-pointer hover:bg-teal-50/30 transition-all group">
        <div className={`w-8 h-8 rounded-lg bg-white border flex items-center justify-center flex-shrink-0 transition-colors ${error ? 'border-red-300 text-red-500' : 'border-gray-200 text-teal-500 group-hover:border-teal-300'}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700">{label}</p>
            {error && <span className="text-[10px] text-red-500 font-bold">{error}</span>}
          </div>
          <p className="text-[10px] text-gray-400 truncate">{file ? file.name : 'Click to upload file'}</p>
        </div>
        <Upload size={14} className={`transition-colors flex-shrink-0 ${error ? 'text-red-300' : 'text-gray-300 group-hover:text-teal-400'}`} />
        <input type="file" name={name} onChange={onChange} accept={accept} className="hidden" />
      </label>
      {preview && (
        <div className="px-3 pb-3">
          {preview.type?.startsWith("image/") && (
            <img src={preview.url} alt="preview" className="h-24 rounded-lg border border-gray-100 object-cover mt-1" />
          )}
          {preview.type === "application/pdf" && (
            <iframe key={preview.key} src={preview.url} className="w-full h-32 border rounded-lg mt-1" />
          )}
        </div>
      )}
    </div>
  );
}
