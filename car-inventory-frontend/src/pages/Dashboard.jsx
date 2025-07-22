import React, { useState, useEffect } from "react";
import VehicleCard from "../components/VehicleCard";
import DarkModeToggle from "../components/DarkModeToggle";
import VehicleForm from "../components/VehicleForm";
import * as api from "../api";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { FaCar } from "react-icons/fa";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("MOT");
  const [refreshingId, setRefreshingId] = useState(null);

  useEffect(() => {
    if (!user && !api.isLoggedIn()) {
      navigate("/login");
      return;
    }
    fetchVehicles();
    // eslint-disable-next-line
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getVehicles();
      setVehicles(data);
    } catch (e) {
      setError(e.error || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditVehicle(null);
    setShowForm(true);
  };

  const handleEdit = (vehicle) => {
    setEditVehicle(vehicle);
    setShowForm(true);
  };

  const handleDelete = async (vehicle) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteVehicle(vehicle.id);
      await fetchVehicles();
    } catch (e) {
      setError(e.error || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (vehicle) => {
    setLoading(true);
    setError(null);
    try {
      if (editVehicle) {
        await api.updateVehicle(editVehicle.id, vehicle);
      } else {
        await api.addVehicle(vehicle);
      }
      await fetchVehicles();
      setShowForm(false);
      setEditVehicle(null);
    } catch (e) {
      setError(e.error || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditVehicle(null);
  };

  const handleRefreshMOT = async (vehicle) => {
    setRefreshingId(vehicle.id);
    setError(null);
    try {
      await api.refreshMOT(vehicle.registration, vehicle.id);
      await fetchVehicles();
    } catch (e) {
      setError(e.error || "MOT refresh failed");
    } finally {
      setRefreshingId(null);
    }
  };

  // Filter and sort
  const filtered = vehicles.filter(
    (v) =>
      v.registration.toLowerCase().includes(filter.toLowerCase()) ||
      v.makeModel.toLowerCase().includes(filter.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "MOT") return a.motExpiry.localeCompare(b.motExpiry);
    if (sort === "Tax") return a.taxStatus.localeCompare(b.taxStatus);
    if (sort === "Insurance") return a.insuranceExpiry.localeCompare(b.insuranceExpiry);
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-0">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur flex flex-col sm:flex-row justify-between items-center px-6 py-4 shadow-md mb-8 gap-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <FaCar className="text-blue-600 dark:text-blue-400 text-3xl" />
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Car Inventory Dashboard</h1>
          <button onClick={logout} className="ml-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm shadow">Logout</button>
        </div>
        <DarkModeToggle />
      </header>
      <main className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Filter by registration or make/model..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-64 shadow"
            />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow"
            >
              <option value="MOT">Sort by MOT</option>
              <option value="Tax">Sort by Tax</option>
              <option value="Insurance">Sort by Insurance</option>
            </select>
          </div>
          <button onClick={handleAdd} className="px-6 py-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition font-semibold text-base">
            + Add Vehicle
          </button>
        </div>
        {loading && <div className="text-center text-gray-700 dark:text-gray-200">Loading...</div>}
        {error && <div className="text-center text-red-500 mb-4">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sorted.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={() => handleEdit(vehicle)}
              onDelete={() => handleDelete(vehicle)}
              onRefreshMOT={() => handleRefreshMOT(vehicle)}
              refreshing={refreshingId === vehicle.id}
            />
          ))}
        </div>
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <VehicleForm
              onSave={handleSave}
              onCancel={handleCancel}
              initialData={editVehicle}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard; 