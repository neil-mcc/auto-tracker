import React, { useState } from "react";

const defaultVehicle = {
  registration: "",
  makeModel: "",
  motExpiry: "",
  taxStatus: "Valid",
  insuranceExpiry: "",
  nextService: "",
};

const VehicleForm = ({ onSave, onCancel, initialData }) => {
  const [vehicle, setVehicle] = useState(initialData || defaultVehicle);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!vehicle.registration) errs.registration = "Required";
    if (!vehicle.makeModel) errs.makeModel = "Required";
    if (!vehicle.motExpiry) errs.motExpiry = "Required";
    if (!vehicle.insuranceExpiry) errs.insuranceExpiry = "Required";
    if (!vehicle.nextService) errs.nextService = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setVehicle({ ...vehicle, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(vehicle);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded shadow flex flex-col gap-4 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{initialData ? "Edit Vehicle" : "Add Vehicle"}</h2>
      <div>
        <label className="block text-gray-700 dark:text-gray-200">Registration *</label>
        <input name="registration" value={vehicle.registration} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
        {errors.registration && <span className="text-red-500 text-xs">{errors.registration}</span>}
      </div>
      <div>
        <label className="block text-gray-700 dark:text-gray-200">Make/Model *</label>
        <input name="makeModel" value={vehicle.makeModel} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
        {errors.makeModel && <span className="text-red-500 text-xs">{errors.makeModel}</span>}
      </div>
      <div>
        <label className="block text-gray-700 dark:text-gray-200">MOT Expiry *</label>
        <input type="date" name="motExpiry" value={vehicle.motExpiry} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
        {errors.motExpiry && <span className="text-red-500 text-xs">{errors.motExpiry}</span>}
      </div>
      <div>
        <label className="block text-gray-700 dark:text-gray-200">Tax Status</label>
        <select name="taxStatus" value={vehicle.taxStatus} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <option value="Valid">Valid</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>
      <div>
        <label className="block text-gray-700 dark:text-gray-200">Insurance Expiry *</label>
        <input type="date" name="insuranceExpiry" value={vehicle.insuranceExpiry} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
        {errors.insuranceExpiry && <span className="text-red-500 text-xs">{errors.insuranceExpiry}</span>}
      </div>
      <div>
        <label className="block text-gray-700 dark:text-gray-200">Next Service *</label>
        <input type="date" name="nextService" value={vehicle.nextService} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
        {errors.nextService && <span className="text-red-500 text-xs">{errors.nextService}</span>}
      </div>
      <div className="flex gap-2 justify-end mt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-600">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{initialData ? "Save" : "Add"}</button>
      </div>
    </form>
  );
};

export default VehicleForm; 