import React, { useState, useEffect } from "react";
import { pb } from "../services/pocketbase";
import { Category } from "../lib/types";
import { Plus, Trash2, Edit2, Loader } from "lucide-react";
import InputModal from "./InputModal";
import ConfirmationModal from "./ConfirmationModal";
import Toast from "./Toast";

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const result = await pb.collection("categories").getFullList<Category>({
        sort: "name",
      });
      setCategories(result);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Nie udało się pobrać kategorii.");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ł/g, "l")
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleAddCategory = async (name: string) => {
    try {
      setError("");
      const slug = generateSlug(name);
      await pb.collection("categories").create({ name, slug });
      setSuccess("Kategoria została dodana.");
      setAddModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error("Error creating category:", err);
      setError("Nie udało się dodać kategorii. Sprawdź czy taka już nie istnieje.");
    }
  };

  const handleEditCategory = async (name: string) => {
    if (!editCategory) return;
    try {
      setError("");
      const slug = generateSlug(name);
      await pb.collection("categories").update(editCategory.id, { name, slug });
      setSuccess("Kategoria została zaktualizowana.");
      setEditCategory(null);
      fetchCategories();
    } catch (err) {
      console.error("Error updating category:", err);
      setError("Nie udało się zaktualizować kategorii.");
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteId) return;
    try {
      setError("");
      await pb.collection("categories").delete(deleteId);
      setSuccess("Kategoria została usunięta.");
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Nie udało się usunąć kategorii.");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kategorie Aktualności</h1>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Dodaj kategorię
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
            <Loader className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {categories.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nazwa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditCategory(category)}
                        className="text-indigo-600 hover:text-indigo-900 mx-2"
                        title="Edytuj"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteId(category.id)}
                        className="text-red-600 hover:text-red-900 mx-2"
                        title="Usuń"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Brak kategorii. Dodaj pierwszą kategorię.
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <InputModal
        isOpen={isAddModalOpen}
        title="Dodaj nową kategorię"
        inputPlaceholder="Np. Wydarzenia"
        onConfirm={handleAddCategory}
        onCancel={() => setAddModalOpen(false)}
        confirmText="Dodaj"
      />

      <InputModal
        isOpen={!!editCategory}
        title="Edytuj kategorię"
        defaultValue={editCategory?.name}
        onConfirm={handleEditCategory}
        onCancel={() => setEditCategory(null)}
        confirmText="Zapisz"
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        title="Usuń kategorię"
        message="Czy na pewno chcesz usunąć tę kategorię? Artykuły przypisane do tej kategorii nie zostaną usunięte, ale mogą stracić przypisanie."
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeleteId(null)}
        confirmText="Usuń"
      />

      <Toast
         message={success || error}
         type={error ? "error" : "success"}
         onClose={() => { setSuccess(""); setError(""); }}
         duration={4000}
      />
    </div>
  );
};

export default AdminCategories;
