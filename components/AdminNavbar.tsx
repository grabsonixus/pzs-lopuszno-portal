import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pb } from '../services/pocketbase';
import { LayoutDashboard, Newspaper, LogOut, Waypoints, Pencil } from 'lucide-react';
import { AdminEditContext } from '../lib/AdminEditContext';

const AdminNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { pageId, pageType } = useContext(AdminEditContext);

  const handleLogout = () => {
    pb.authStore.clear();
    navigate('/');
  };

  const editUrl = pageType === 'news' ? `/admin/news/edit/${pageId}` : `/admin/subpages/edit/${pageId}`;

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-lg">Panel Admina</span>
            <Link to="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link to="/admin/news" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
              <Newspaper size={18} />
              Artykuły
            </Link>
            <Link to="/admin/subpages" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
              <Newspaper size={18} />
              Podstrony
            </Link>
            <Link to="/admin/navigation" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
              <Waypoints size={18} />
              Nawigacja
            </Link>
            {pageId && pageType && (
              <Link to={editUrl} className="flex items-center gap-2 bg-green-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                <Pencil size={18} />
                Edytuj stronę
              </Link>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 bg-red-600"
          >
            <LogOut size={18} />
            Wyloguj
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
