import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Newspaper,
  Waypoints,
  Home,
  FileText,
  Settings,
  LayoutTemplate,
  FileIcon,
  GitCommit,
  Clock,
  AlertCircle
} from "lucide-react";
import { pb } from "../services/pocketbase";
import { SystemUpdate } from "../lib/types";

const AdminDashboard: React.FC = () => {
  const [updates, setUpdates] = useState<SystemUpdate[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [currentVersion, setCurrentVersion] = useState<string>("1.0.0");

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const result = await pb.collection("system_updates").getList<SystemUpdate>(1, 5, {
          sort: "-date",
        });
        setUpdates(result.items);
        if (result.items.length > 0) {
            setCurrentVersion(result.items[0].version);
        }
      } catch (error) {
        console.error("Error fetching system updates:", error);
      } finally {
        setLoadingUpdates(false);
      }
    };

    fetchUpdates();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">
                Panel administratora
            </h1>
            <p className="text-gray-500 mt-1">Witaj w panelu zarządzania stroną.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 flex items-center gap-2 text-sm font-medium text-gray-600">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Wersja: <span className="text-gray-900">{currentVersion}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lewa kolumna - Opcje (2/3 szerokości) */}
        <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-gray-700 flex items-center gap-2">
                <Settings size={20} />
                Zarządzanie treścią
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                <Link
                to="/admin/home"
                className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Home size={20} />
                </div>
                <h2 className="text-lg font-bold mb-1">Strona Główna</h2>
                <p className="text-gray-500 text-xs">
                    Nagłówek, tło, sekcje.
                </p>
                </Link>

                <Link
                to="/admin/news"
                className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Newspaper size={20} />
                </div>
                <h2 className="text-lg font-bold mb-1">Aktualności</h2>
                <p className="text-gray-500 text-xs">
                    Artykuły i publikacje.
                </p>
                </Link>

                <Link
                to="/admin/categories"
                className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                    <FileIcon size={20} />
                </div>
                <h2 className="text-lg font-bold mb-1">Kategorie</h2>
                <p className="text-gray-500 text-xs">
                    Kategorie aktualności.
                </p>
                </Link>

                <Link
                to="/admin/subpages"
                className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <FileText size={20} />
                </div>
                <h2 className="text-lg font-bold mb-1">Podstrony</h2>
                <p className="text-gray-500 text-xs">
                    Statyczne strony info.
                </p>
                </Link>

                <Link
                to="/admin/navigation"
                className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <Waypoints size={20} />
                </div>
                <h2 className="text-lg font-bold mb-1">Nawigacja</h2>
                <p className="text-gray-500 text-xs">
                    Menu główne (header).
                </p>
                </Link>

                <Link
                to="/admin/footer"
                className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <LayoutTemplate size={20} />
                </div>
                <h2 className="text-lg font-bold mb-1">Stopka</h2>
                <p className="text-gray-500 text-xs">
                    Linki i kontakt w stopce.
                </p>
                </Link>

                <Link
                to="/admin/settings"
                className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-slate-600 group-hover:text-white transition-colors">
                    <Settings size={20} />
                </div>
                <h2 className="text-lg font-bold mb-1">Wygląd</h2>
                <p className="text-gray-500 text-xs">
                    Logo, kolory, czcionki.
                </p>
                </Link>
            </div>
        </div>

        {/* Prawa kolumna - Changelog (1/3 szerokości) */}
        <div className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4 text-gray-700 flex items-center gap-2">
                <GitCommit size={20} />
                Dziennik zmian
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loadingUpdates ? (
                    <div className="p-8 text-center text-gray-400">
                        Pobieranie historii zmian...
                    </div>
                ) : updates.length > 0 ? (
                    <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                        {updates.map((update) => (
                            <div key={update.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                        v{update.version}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock size={12} />
                                        {formatDate(update.date)}
                                    </span>
                                </div>
                                <div 
                                    className="text-sm text-gray-600 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0"
                                    dangerouslySetInnerHTML={{ __html: update.description }}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full text-gray-400 mb-3">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-gray-900 font-medium mb-1">Brak wpisów</h3>
                        <p className="text-gray-500 text-sm">
                            Historia zmian jest pusta.
                        </p>
                    </div>
                )}
            </div>
             <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <h3 className="text-sm font-bold text-indigo-900 mb-1">Potrzebujesz pomocy?</h3>
                <p className="text-xs text-indigo-700 mb-3">
                    Jeśli napotkasz problem lub masz pomysł na nową funkcję, skontaktuj się z administratorem technicznym.
                </p>
                <div className="text-xs font-medium text-indigo-800">
                    info@perfektusplus.pl
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
