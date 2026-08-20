"use client";

import { useEffect, useState } from "react";
import { Search, Plus, MapPin, Truck, User, Route, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";
import AddRouteModal from "../components/AddRouteModal";
import EditRouteModal from "../components/EditRouteModal";
import DeleteRouteModal from "../components/DeleteRouteModal";

export default function RouteManagement() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/routes");
      setRoutes(res.data);
    } catch (err) {
      toast.error("Failed to load routes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRoutes(); }, []);

  const handleEdit = (route) => { setSelectedRoute(route); setIsEditModalOpen(true); };
  const handleDeleteClick = (route) => { setRouteToDelete(route); setIsDeleteModalOpen(true); };

  const confirmDelete = async () => {
    if (!routeToDelete) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/routes/${routeToDelete._id}`);
      toast.success("Route deleted successfully");
      setIsDeleteModalOpen(false);
      setRouteToDelete(null);
      loadRoutes();
    } catch (err) {
      toast.error("Failed to delete route");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedRoute(null);
  };

  const filteredRoutes = routes.filter(r =>
    r.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.routeCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeRoutes = routes.filter(r => r.status === 'active').length;
  const totalStops = routes.reduce((acc, r) => acc + (r.stops?.length || 0), 0);

  return (
    <div className="space-y-6 p-8">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-0.5">Main › Operational Management › Route Management</p>
          <h1 className="text-xl font-black text-gray-800">Route Management</h1>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-semibold text-sm shadow-lg btn-lift transition-all"
          style={{ background: 'linear-gradient(135deg, #1f9e9a, #16a34a)', boxShadow: '0 4px 16px rgba(31,158,154,0.3)' }}
        >
          <Plus size={17} /> Add Route
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Routes', value: routes.length, icon: Route, color: 'from-[#1f9e9a] to-[#16847f]' },
          { label: 'Active Routes', value: activeRoutes, icon: CheckCircle, color: 'from-emerald-500 to-emerald-700' },
          { label: 'Total Stops', value: totalStops, icon: MapPin, color: 'from-blue-500 to-blue-700' },
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

      {/* Search bar */}
      <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm w-full max-w-md">
        <Search size={16} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by route name or code…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
        />
      </div>

      {/* Route cards grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading routes…</div>
      ) : filteredRoutes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Route size={36} className="mb-3 opacity-30" />
          <p className="text-sm font-medium">No routes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoutes.map((route) => (
            <div
              key={route._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group"
            >
              {/* Card accent top bar */}
              <div className="h-1" style={{ background: route.status === 'active' ? 'linear-gradient(90deg, #1f9e9a, #22c55e)' : 'linear-gradient(90deg, #9ca3af, #d1d5db)' }} />

              <div className="p-5">
                {/* Route name + status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 pr-2">
                    <h3 className="font-bold text-gray-800 text-base truncate">{route.routeName}</h3>
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded mt-0.5 inline-block">{route.routeCode}</span>
                  </div>
                  <span className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    route.status === 'active'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-gray-50 text-gray-400 border-gray-200'
                  }`}>
                    {route.status === 'active' ? <CheckCircle size={9} /> : <XCircle size={9} />}
                    {route.status}
                  </span>
                </div>

                {/* Info rows */}
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-start gap-2">
                    <MapPin size={13} className="text-teal-500 mt-0.5 flex-shrink-0" />
                    <span className="truncate">
                      {route.stops && route.stops.length > 0
                        ? `${route.stops[0].stopName} → ${route.stops[route.stops.length - 1].stopName} (${route.stops.length} stops)`
                        : 'No stops defined'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-blue-400 flex-shrink-0" />
                    <span className="truncate">Driver: {route.assignedDriver?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={13} className="text-orange-400 flex-shrink-0" />
                    <span>Vehicle: {route.assignedVehicle || 'N/A'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2 justify-end">
                  <button
                    onClick={() => handleEdit(route)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-500 bg-orange-50 hover:bg-orange-100 transition-colors"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(route)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddRouteModal isOpen={isAddModalOpen} onClose={handleModalClose} onSuccess={loadRoutes} />
      <EditRouteModal isOpen={isEditModalOpen} onClose={handleModalClose} onSuccess={loadRoutes} route={selectedRoute} />
      <DeleteRouteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} route={routeToDelete} onConfirmDelete={confirmDelete} loading={deleteLoading} />
    </div>
  );
}
