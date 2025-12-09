import React, { useEffect, useState } from "react";
import { pb } from "../services/pocketbase";
import { NavItem } from "../types";
import { Plus, Edit, Trash } from "lucide-react";
import AdminNavigationForm from "./AdminNavigationForm";

const AdminNavigation: React.FC = () => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Partial<NavItem> | null>(
    null
  );

  useEffect(() => {
    fetchNavItems();
  }, []);

  const fetchNavItems = async () => {
    setLoading(true);
    try {
      const result = await pb
        .collection("navigation_items")
        .getFullList<NavItem>({
          sort: "order",
          requestKey: null,
        });
      setNavItems(result);
    } catch (error) {
      console.error("Error fetching navigation items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setSelectedItem(null);
    fetchNavItems();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę pozycję?")) {
      try {
        await pb.collection("navigation_items").delete(id);
        fetchNavItems();
      } catch (error) {
        console.error("Error deleting navigation item:", error);
        alert("Nie udało się usunąć pozycji.");
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zarządzaj nawigacją</h1>
        <button
          onClick={() => setSelectedItem({})}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          <Plus size={18} />
          Dodaj nową pozycję
        </button>
      </div>

      {loading ? (
        <p>Ładowanie...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Kolejność
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nazwa
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  URL
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rodzic
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Akcje</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {navItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.order}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.href}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.parent_id
                      ? navItems.find((p) => p.id === item.parent_id)?.name
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedItem && (
        <AdminNavigationForm
          item={selectedItem}
          onSave={handleSave}
          onCancel={() => setSelectedItem(null)}
          navItems={navItems}
        />
      )}
    </div>
  );
};

export default AdminNavigation;
