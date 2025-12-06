import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Panel administratora</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/news" className="p-4 bg-white rounded-lg shadow-md hover:bg-gray-100">
          <h2 className="text-lg font-semibold">Zarządzaj aktualnościami</h2>
          <p className="text-gray-600">Dodawaj, edytuj i usuwaj aktualności.</p>
        </Link>
        <Link to="/admin/navigation" className="p-4 bg-white rounded-lg shadow-md hover:bg-gray-100">
          <h2 className="text-lg font-semibold">Zarządzaj nawigacją</h2>
          <p className="text-gray-600">Dodawaj, edytuj i usuwaj pozycje w menu.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;