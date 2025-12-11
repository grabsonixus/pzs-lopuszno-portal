import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pb } from "../services/pocketbase";
import {
  LayoutDashboard,
  Newspaper,
  LogOut,
  Waypoints,
  Pencil,
  Home,
  Settings,
  LayoutTemplate,
} from "lucide-react";
import { AdminEditContext } from "../lib/AdminEditContext";

const AdminNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { pageId, pageType } = useContext(AdminEditContext);

  const handleLogout = () => {
    pb.authStore.clear();
    navigate("/");
  };

  const editUrl =
    pageType === "news"
      ? `/admin/news/edit/${pageId}`
      : `/admin/subpages/edit/${pageId}`;

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-lg hidden md:block">
              Panel Admina
            </span>
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
            >
              <LayoutDashboard size={18} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              to="/admin/home"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
            >
              <Home size={18} />
              <span className="hidden sm:inline">Strona Główna</span>
            </Link>
            <Link
              to="/admin/news"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
            >
              <Newspaper size={18} />
              <span className="hidden sm:inline">Artykuły</span>
            </Link>
            <Link
              to="/admin/navigation"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
            >
              <Waypoints size={18} />
              <span className="hidden sm:inline">Nawigacja</span>
            </Link>
            <Link
              to="/admin/footer"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
            >
              <LayoutTemplate size={18} />
              <span className="hidden sm:inline">Stopka</span>
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
            >
              <Settings size={18} />
              <span className="hidden sm:inline">Ustawienia</span>
            </Link>
            {pageId && pageType && (
              <Link
                to={editUrl}
                className="flex items-center gap-2 bg-green-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700"
              >
                <Pencil size={18} />
                <span className="hidden sm:inline">Edytuj stronę</span>
              </Link>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 bg-red-600"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Wyloguj</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
