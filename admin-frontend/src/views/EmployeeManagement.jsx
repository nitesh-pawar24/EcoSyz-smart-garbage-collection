"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Eye, Pencil, UserCheck, UserX, Users, Users2, UserMinus } from "lucide-react";

import { toast } from "react-toastify";
import api from "../api/axios";

import AddEmployeeModal from "../components/AddEmployeeModal";
import ViewEmployeeModal from "../components/ViewEmployeeModal";
import EditEmployeeModal from "../components/EditEmployeeModal";
import DeactivateEmployeeModal from "../components/DeactivateEmployeeModal";
import ActivateEmployeeModal from "../components/ActivateEmployeeModal";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [searchEmployee, setSearchEmployee] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showActivate, setShowActivate] = useState(false);

  /* ================= LOAD EMPLOYEES ================= */
  const loadEmployees = async () => {
    try {
      setLoading(true);

      const res = await api.get("/employees");


      if (!Array.isArray(res.data)) {
        console.error("Employees API did not return array");
        setEmployees([]);
        return;
      }

      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  /* ================= SEARCH FILTER ================= */
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      emp.employeeCode?.toLowerCase().includes(searchEmployee.toLowerCase())
  );

  /* ================= ACTIONS ================= */

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleEditEmployee = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleEditFromTable = (employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const openDeactivateModal = async (employeeId) => {
    try {
      const { data } = await api.get(`/employees/${employeeId}`);
      setSelectedEmployee(data);
      setShowDeactivate(true);
    } catch {
      toast.error("Failed to load employee details");
    }
  };

  const handleConfirmDeactivate = async (employeeId) => {
    try {
      await api.put(`/employees/${employeeId}/deactivate`);
      toast.success("Employee deactivated");
      setShowDeactivate(false);
      loadEmployees();
    } catch {
      toast.error("Failed to deactivate employee");
    }
  };

  const handleActivateEmployee = async (employee) => {
    setSelectedEmployee(employee);
    setShowActivate(true);
  };

  const handleConfirmActivate = async (employeeId) => {
    try {
      await api.put(`/employees/${employeeId}/activate`);
      toast.success("Employee activated");
      setShowActivate(false);
      loadEmployees();
    } catch {
      toast.error("Failed to activate employee");
    }
  };

  const handleDeactivateFromView = () => {
    setIsViewModalOpen(false);
    setShowDeactivate(true);
  };


  /* ================= UI ================= */
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const inactiveEmployees = totalEmployees - activeEmployees;

  return (
    <div className="space-y-6">
      {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Main › Operational Management › Employee Management</p>
              <h1 className="text-xl font-black text-gray-800">Employee Management</h1>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-semibold text-sm shadow-lg btn-lift"
              style={{ background: 'linear-gradient(135deg, #1f9e9a, #16a34a)', boxShadow: '0 4px 16px rgba(31,158,154,0.3)' }}
            >
              <Plus size={17} />
              Add Employee
            </button>
          </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label: 'Total Employees', value: totalEmployees, icon: Users, color: 'from-[#1f9e9a] to-[#16847f]' },
              { label: 'Active', value: activeEmployees, icon: UserCheck, color: 'from-emerald-500 to-emerald-700' },
              { label: 'Inactive', value: inactiveEmployees, icon: UserMinus, color: 'from-rose-500 to-rose-700' },
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

          {/* Search + Table card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Card toolbar */}
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Employee List</h2>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2 w-72" style={{ border: '1.5px solid transparent' }}
                onFocusCapture={(e) => e.currentTarget.style.borderColor = 'rgba(31,158,154,0.35)'}
                onBlurCapture={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or code…"
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                  className="flex-1 outline-none text-sm bg-transparent text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {['Code', 'Name', 'Role', 'Ward(s)', 'Contact', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3.5 text-left text-white text-[10px] font-bold uppercase tracking-wider bg-[#1f9e9a]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-400 text-sm">Loading employees…</td></tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-400 text-sm">No employees found</td></tr>
                  ) : (
                    filteredEmployees.map((emp, idx) => (
                      <tr key={emp._id} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-teal-50/30`}>
                        <td className="px-6 py-3.5">
                          <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{emp.employeeCode}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #1f9e9a, #22c55e)' }}
                            >
                              {emp.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-800 text-sm">{emp.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600">{emp.role}</td>
                        <td className="px-6 py-3.5 text-sm text-gray-600">
                          {emp.wards && emp.wards.length > 0 ? emp.wards.join(", ") : emp.ward || '—'}
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600">{emp.phone}</td>
                        <td className="px-6 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            emp.status === 'active'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-red-50 text-red-500 border-red-100'
                          }`}>
                            {emp.status === 'active' ? '● Active' : '● Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleViewEmployee(emp)}
                              title="View"
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleEditFromTable(emp)}
                              title="Edit"
                              className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors"
                            >
                              <Pencil size={15} />
                            </button>
                            {emp.status === 'active' ? (
                              <button
                                onClick={() => openDeactivateModal(emp._id)}
                                title="Deactivate"
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <UserX size={15} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateEmployee(emp)}
                                title="Activate"
                                className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors"
                              >
                                <UserCheck size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        {/* MODALS */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadEmployees}
      />

      <ViewEmployeeModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        employee={selectedEmployee}
        onEdit={handleEditEmployee}
        onDeactivate={handleDeactivateFromView}
        onActivate={() => handleActivateEmployee(selectedEmployee)}
      />

      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={selectedEmployee}
        onSuccess={loadEmployees}
      />

      <DeactivateEmployeeModal
        isOpen={showDeactivate}
        onClose={() => setShowDeactivate(false)}
        employee={selectedEmployee}
        onConfirm={handleConfirmDeactivate}
      />

      <ActivateEmployeeModal
        isOpen={showActivate}
        onClose={() => setShowActivate(false)}
        employee={selectedEmployee}
        onConfirm={handleConfirmActivate}
      />
    </div>
  );
}
