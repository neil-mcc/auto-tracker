import React from "react";
import { FaCar, FaCalendarCheck, FaExclamationTriangle, FaShieldAlt, FaTools, FaSyncAlt } from "react-icons/fa";

const badgeClass = (color) => `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 dark:bg-${color}-900 dark:text-${color}-200`;

const VehicleCard = ({ vehicle, onEdit, onDelete, onRefreshMOT, refreshing }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col gap-3 hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700">
    <div className="flex items-center gap-2 mb-1">
      <FaCar className="text-blue-500 dark:text-blue-300 text-lg" />
      <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{vehicle.makeModel}</span>
    </div>
    <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Reg: <span className="font-mono text-gray-700 dark:text-gray-200">{vehicle.registration}</span></div>
    <div className="flex flex-wrap gap-2 mt-1">
      <span className={badgeClass("yellow")}><FaCalendarCheck className="inline" /> MOT: {vehicle.motExpiry}</span>
      <span className={badgeClass(vehicle.taxStatus === "Valid" ? "green" : "red")}><FaExclamationTriangle className="inline" /> Tax: {vehicle.taxStatus}</span>
      <span className={badgeClass("green")}><FaShieldAlt className="inline" /> Insurance: {vehicle.insuranceExpiry}</span>
    </div>
    <div className="mt-1">
      <span className={badgeClass("blue")}><FaTools className="inline" /> Next Service: {vehicle.nextService}</span>
    </div>
    <div className="flex gap-2 mt-4">
      <button onClick={onEdit} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs font-semibold">Edit</button>
      <button onClick={onDelete} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-semibold">Delete</button>
      {onRefreshMOT && (
        <button
          onClick={onRefreshMOT}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold flex items-center gap-1"
          disabled={refreshing}
        >
          <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh MOT"}
        </button>
      )}
    </div>
  </div>
);

export default VehicleCard; 