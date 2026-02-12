import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pb } from '../services/pocketbase';
import { Subpage } from '../lib/types';
import { Plus, Edit, Trash } from 'lucide-react';

const AdminSubpages: React.FC = () => {
  const [subpages, setSubpages] = useState<Subpage[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    fetchSubpages(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  const fetchSubpages = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const result = await pb.collection('subpages').getList<Subpage>(1, 50, {
        sort: '-created',
        fields: 'id,title,created', // OPTYMALIZACJA
        signal,
      });
      if (!signal?.aborted) {
        setSubpages(result.items);
      }
    } catch (error: any) {
      if (!error.isAbort) {
        console.error("Error fetching subpages:", error);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę podstronę?')) {
      try {
        await pb.collection('subpages').delete(id);
        fetchSubpages(); // Refetch subpages after deletion
      } catch (error) {
        console.error("Error deleting subpage:", error);
        alert('Nie udało się usunąć podstrony.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zarządzaj podstronami</h1>
        <Link 
          to="/admin/subpages/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          <Plus size={18} />
          Dodaj nową podstronę
        </Link>
      </div>

      {loading ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden animate-pulse">
            <div className="h-10 bg-gray-100 border-b border-gray-200"></div>
            <div className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center p-4">
                        <div className="flex-1">
                            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="w-32 px-6">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                         <div className="w-24 px-6 flex gap-3 justify-end">
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                         </div>
                    </div>
                ))}
            </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tytuł</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Akcje</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subpages.map((subpage) => (
                <tr key={subpage.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{subpage.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(subpage.created)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => navigate(`/admin/subpages/edit/${subpage.id}`)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(subpage.id)} className="text-red-600 hover:text-red-900">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSubpages;
