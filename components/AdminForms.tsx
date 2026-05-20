import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pb } from "../services/pocketbase";
import { CustomForm } from "../lib/types";
import { Plus, Edit, Trash2, MessageSquare, AlertCircle } from "lucide-react";

const AdminForms: React.FC = () => {
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const records = await pb.collection("forms").getFullList<CustomForm>({
        sort: "-created",
        requestKey: null,
      });
      setForms(records);
    } catch (error) {
      console.error("Błąd podczas pobierania formularzy:", error);
      // Fallback for demo/dev purposes if collection doesn't exist
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Czy na pewno chcesz usunąć ten formularz? Zostaną również usunięte wszystkie jego odpowiedzi.")) {
      try {
        await pb.collection("forms").delete(id);
        fetchForms();
      } catch (error) {
        console.error("Błąd podczas usuwania formularza:", error);
        alert("Wystąpił błąd podczas usuwania.");
      }
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Formularze</h1>
          <p className="text-gray-500 mt-1">Zarządzaj formularzami kontaktowymi i rekrutacyjnymi.</p>
        </div>
        <Link
          to="/admin/forms/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} /> Nowy Formularz
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Ładowanie formularzy...</div>
      ) : forms.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 font-semibold text-gray-600">Nazwa formularza</th>
                  <th className="py-4 px-6 font-semibold text-gray-600">Krótki kod (Slug)</th>
                  <th className="py-4 px-6 font-semibold text-gray-600">Pola</th>
                  <th className="py-4 px-6 font-semibold text-gray-600">Status</th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {forms.map((form) => (
                  <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-800">{form.title}</td>
                    <td className="py-4 px-6 text-gray-500">{form.slug}</td>
                    <td className="py-4 px-6 text-gray-500">{form.fields?.length || 0}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${form.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {form.is_active ? 'Aktywny' : 'Nieaktywny'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/forms/${form.id}/submissions`}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Odpowiedzi"
                        >
                          <MessageSquare size={18} />
                        </Link>
                        <Link
                          to={`/admin/forms/edit/${form.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edytuj"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(form.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Usuń"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Brak formularzy</h3>
          <p className="text-gray-500 mb-6">Nie masz jeszcze żadnych formularzy.</p>
          <Link
            to="/admin/forms/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} /> Utwórz pierwszy formularz
          </Link>
        </div>
      )}
    </div>
  );
};

export default AdminForms;
