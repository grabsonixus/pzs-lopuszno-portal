import React from "react";
import { Link } from "react-router-dom";
import {
  Newspaper,
  Waypoints,
  Home,
  FileText,
  Settings,
  LayoutTemplate,
  FileIcon,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Panel administratora
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Link
          to="/admin/home"
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
        >
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Home size={24} />
          </div>
          <h2 className="text-xl font-bold mb-2">Strona Główna</h2>
          <p className="text-gray-600 text-sm">
            Edytuj nagłówek, tło, przyciski i układ sekcji.
          </p>
        </Link>

        <Link
          to="/admin/news"
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
        >
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Newspaper size={24} />
          </div>
          <h2 className="text-xl font-bold mb-2">Aktualności</h2>
          <p className="text-gray-600 text-sm">
            Zarządzaj artykułami i ich publikacją.
          </p>
        </Link>

        <Link
          to="/admin/categories"
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
        >
          <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
            <FileIcon size={24} />
          </div>
          <h2 className="text-xl font-bold mb-2">Kategorie</h2>
          <p className="text-gray-600 text-sm">
            Zarządzaj kategoriami aktualności.
          </p>
        </Link>

        <Link
          to="/admin/subpages"
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
        >
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <FileText size={24} />
          </div>
          <h2 className="text-xl font-bold mb-2">Podstrony</h2>
          <p className="text-gray-600 text-sm">
            Twórz statyczne podstrony informacyjne.
          </p>
        </Link>

        <Link
          to="/admin/navigation"
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
        >
          <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <Waypoints size={24} />
          </div>
          <h2 className="text-xl font-bold mb-2">Nawigacja</h2>
          <p className="text-gray-600 text-sm">
            Zarządzaj menu głównym i kolejnością linków.
          </p>
        </Link>

        <Link
          to="/admin/footer"
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
        >
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <LayoutTemplate size={24} />
          </div>
          <h2 className="text-xl font-bold mb-2">Stopka</h2>
          <p className="text-gray-600 text-sm">
            Edytuj kolumny, linki i dane kontaktowe w stopce.
          </p>
        </Link>

        <Link
          to="/admin/settings"
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
        >
          <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-slate-600 group-hover:text-white transition-colors">
            <Settings size={24} />
          </div>
          <h2 className="text-xl font-bold mb-2">Wygląd i Ustawienia</h2>
          <p className="text-gray-600 text-sm">
            Kolory, czcionki, logo, favicon i dostępność.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
