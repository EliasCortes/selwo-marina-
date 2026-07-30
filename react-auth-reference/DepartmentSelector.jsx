import React from 'react';
import { useAuth } from './AuthContext';

export const DepartmentSelector = () => {
  const { departments, activeDepartment, setActiveDepartment } = useAuth();

  if (!departments || departments.length <= 1) {
    // Si no tiene departamentos o solo tiene uno, no mostramos el selector
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="dept-select" className="text-sm text-gray-300 font-medium">
        Área:
      </label>
      <select
        id="dept-select"
        value={activeDepartment?.id || ''}
        onChange={(e) => {
          const selected = departments.find(d => d.id === e.target.value);
          if (selected) setActiveDepartment(selected);
        }}
        className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
      >
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </select>
    </div>
  );
};
