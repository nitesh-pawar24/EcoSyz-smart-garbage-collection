"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Truck, User } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function EditRouteModal({ isOpen, onClose, onSuccess, route }) {
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [wards, setWards] = useState([]);

  const [formData, setFormData] = useState({
    routeName: "",
    ward: "",
    stops: [],
    assignedDriver: "",
    assignedVehicle: "",
  });
  const [allBins, setAllBins] = useState([]);
  const [filteredBins, setFilteredBins] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);

  // Load drivers and wards
  useEffect(() => {
    if (isOpen) {
      api.get("/employees?role=driver").then((res) => {
        setDrivers(res.data.filter(e => e.role?.toLowerCase().includes('driver') || e.role?.toLowerCase().includes('labour')));
      }).catch(err => console.error("Failed to load drivers", err));

      api.get("/wards").then((res) => {
        setWards(res.data);
      }).catch(err => console.error("Failed to load wards", err));

      api.get("/dustbins").then((res) => {
        setAllBins(res.data);
      }).catch(err => console.error("Failed to load dustbins", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.ward) {
      const bins = allBins.filter(b => b.ward === formData.ward);
      setFilteredBins(bins);
    } else {
      setFilteredBins([]);
    }
  }, [formData.ward, allBins]);

  // Pre-fill form data when route changes or modal opens
  useEffect(() => {
    if (isOpen && route) {
      // Try to determine the ward from stops if not present
      let initialWard = route.ward || "";
      if (!initialWard && route.stops && route.stops.length > 0) {
        // This is a heuristic, assuming all stops in a route are from the same ward
        // In the previous version, we didn't store ward on route explicitly
      }

      setFormData({
        routeName: route.routeName || "",
        ward: initialWard,
        stops: route.stops && route.stops.length > 0 ? route.stops : [],
        assignedDriver: route.assignedDriver?._id || route.assignedDriver || "",
        assignedVehicle: route.assignedVehicle || "",
      });
      setErrors({});
    }
  }, [isOpen, route]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const toggleBin = (bin) => {
    const binName = `${bin.locationText} (${bin.binCode})`;
    const isSelected = formData.stops.some(s => s.stopName === binName);
    
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        stops: prev.stops.filter(s => s.stopName !== binName)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        stops: [...prev.stops, { stopName: binName }]
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.routeName.trim()) newErrors.routeName = "Route name is required";

    const validStops = formData.stops.filter(s => s.stopName.trim() !== "");
    if (validStops.length < 2) newErrors.stops = "At least 2 valid stops required";

    if (!formData.assignedDriver) newErrors.assignedDriver = "Driver assignment is required";
    if (!formData.assignedVehicle.trim()) newErrors.assignedVehicle = "Vehicle number is required";

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
      const validStops = formData.stops.filter(s => s.stopName.trim() !== "");
      await api.put(`/routes/${route._id}`, { ...formData, stops: validStops });
      toast.success("Route updated successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update route");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
 <div className="fixed inset-0 modal-overlay bg-black/50 backdrop-blur-sm z-[9999]" onClick={onClose} /> 
 <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[9999] p-4 overflow-y-auto"> 
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 animate-fade-in-up overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <MapPin size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider">Edit Record</p>
                <h2 className="text-white font-bold text-sm">Edit Route</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Route Name *</label>
                  {errors.routeName && <span className="text-[10px] text-red-500 font-bold">{errors.routeName}</span>}
                </div>
                <input
                  type="text"
                  name="routeName"
                  value={formData.routeName}
                  onChange={handleChange}
                  placeholder="e.g. Ward 1 Morning"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.routeName ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-teal-500'}`}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Select Ward *</label>
                  {errors.ward && <span className="text-[10px] text-red-500 font-bold">{errors.ward}</span>}
                </div>
                <select
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none appearance-none bg-white text-sm transition-all ${errors.ward ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-teal-500'}`}
                >
                  <option value="">Select Ward</option>
                  {wards.map(ward => (
                    <option key={ward._id} value={ward.name}>{ward.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dynamic Stops (Dustbins) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Localities Covered (Dustbins) *</label>
                {errors.stops && <span className="text-[10px] text-red-500 font-bold">{errors.stops}</span>}
              </div>
              
              {!formData.ward ? (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
                  <p className="text-xs text-gray-400">Please select a ward to view available dustbins</p>
                </div>
              ) : filteredBins.length === 0 ? (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
                  <p className="text-xs text-gray-400">No dustbins found in this ward</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-100 rounded-xl">
                  {filteredBins.map(bin => {
                    const binName = `${bin.locationText} (${bin.binCode})`;
                    const isSelected = formData.stops.some(s => s.stopName === binName);
                    return (
                      <label key={bin._id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleBin(bin)}
                          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-xs font-medium text-gray-700 truncate">{binName}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              
              {formData.ward && filteredBins.length > 0 && (
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-[10px] text-gray-400 font-medium">{formData.stops.length} bins selected</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.stops.length === filteredBins.length) {
                        setFormData(prev => ({ ...prev, stops: [] }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          stops: filteredBins.map(b => ({ stopName: `${b.locationText} (${b.binCode})` }))
                        }));
                      }
                    }}
                    className="text-[11px] text-teal-600 font-bold hover:underline"
                  >
                    {formData.stops.length === filteredBins.length ? 'Deselect All' : 'Select All Bins'}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Assign Driver *</label>
                  {errors.assignedDriver && <span className="text-[10px] text-red-500 font-bold">{errors.assignedDriver}</span>}
                </div>
                <div className="relative">
                  <User className={`absolute left-3 top-2.5 transition-colors ${errors.assignedDriver ? 'text-red-400' : 'text-gray-400'}`} size={16} />
                  <select
                    name="assignedDriver"
                    value={formData.assignedDriver}
                    onChange={handleChange}
                    className={`w-full pl-9 px-3 py-2 border rounded-lg focus:ring-2 outline-none appearance-none bg-white text-sm transition-all ${errors.assignedDriver ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-teal-500'}`}
                  >
                    <option value="">Select Driver</option>
                    {drivers.map(driver => (
                      <option key={driver._id} value={driver._id}>{driver.name} ({driver.employeeCode})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Vehicle Assigned *</label>
                  {errors.assignedVehicle && <span className="text-[10px] text-red-500 font-bold">{errors.assignedVehicle}</span>}
                </div>
                <div className="relative">
                  <Truck className={`absolute left-3 top-2.5 transition-colors ${errors.assignedVehicle ? 'text-red-400' : 'text-gray-400'}`} size={16} />
                  <select
                    name="assignedVehicle"
                    value={formData.assignedVehicle}
                    onChange={handleChange}
                    className={`w-full pl-9 px-3 py-2 border rounded-lg focus:ring-2 outline-none appearance-none bg-white text-sm transition-all ${errors.assignedVehicle ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-teal-500'}`}
                  >
                    <option value="">Select Vehicle</option>
                    <option value="GA-01-AB-1234">Compact Refuse Collector (GA-01-AB-1234)</option>
                    <option value="GA-01-CD-5678">Side-Loader Truck (GA-01-CD-5678)</option>
                    <option value="GA-01-EF-9012">Mini Waste Tipper (GA-01-EF-9012)</option>
                    <option value="GA-02-XY-3456">Hydraulic Garbage Van (GA-02-XY-3456)</option>
                    <option value="GA-02-ZW-7890">E-Waste Collector (GA-02-ZW-7890)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-50 flex-shrink-0">
            <button onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="px-6 py-2.5 text-white font-bold rounded-xl text-sm disabled:opacity-50 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #1f9e9a, #16847f)' }}>
              {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating...</> : 'Update Route'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
