import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pb } from "../services/pocketbase";
import { Post, getImageUrl, Category } from "../lib/types";
import { Plus, Edit, Trash } from "lucide-react";

const AdminNews: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Batch selections
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 20;
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    pb.collection("categories").getFullList<Category>({ sort: "name" })
        .then(setCategories)
        .catch(console.error);
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when category changes
  useEffect(() => {
    setPage(1);
  }, [category]);

  // Fetch Posts
  useEffect(() => {
    const controller = new AbortController();
    fetchPosts(controller.signal);
    return () => {
      controller.abort();
    };
  }, [page, debouncedSearch, category]);

  const fetchPosts = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      let filterRule = ""; // Empty implies all
      const filters = [];
      
      if (debouncedSearch) filters.push(`title ~ "${debouncedSearch}"`);
      if (category) filters.push(`category = "${category}"`);
      
      if (filters.length > 0) filterRule = filters.join(" && ");

      const result = await pb.collection("posts").getList<Post>(page, ITEMS_PER_PAGE, {
        sort: "-date,-created",
        fields: "id,title,date,created,published", // OPTYMALIZACJA
        filter: filterRule,
        signal,
      });
      
      if (!signal?.aborted) {
        setPosts(result.items);
        setTotalPages(result.totalPages);
        // Clear selection if page changes/refreshed (optional, simpler for now)
        setSelectedPosts([]); 
      }
    } catch (error: any) {
      if (!error.isAbort) {
        console.error("Error fetching news:", error);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Czy na pewno chcesz usunąć ten artykuł?")) {
      try {
        await pb.collection("posts").delete(id);
        fetchPosts();
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Nie udało się usunąć artykułu.");
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // --- Batch Logic ---

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedPosts(posts.map(p => p.id));
    } else {
        setSelectedPosts([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedPosts(prev => 
        prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = async () => {
    if (!window.confirm(`Czy na pewno chcesz usunąć zaznaczone artykuły (${selectedPosts.length})?`)) return;

    try {
        await Promise.all(selectedPosts.map(id => pb.collection("posts").delete(id)));
        setSelectedPosts([]);
        fetchPosts();
    } catch (error) {
        console.error("Batch delete error:", error);
        alert("Wystąpił błąd podczas usuwania.");
    }
  };

  const handleBatchPublish = async (publish: boolean) => {
    try {
        await Promise.all(selectedPosts.map(id => pb.collection("posts").update(id, { published: publish })));
        setSelectedPosts([]);
        fetchPosts();
    } catch (error) {
        console.error("Batch publish error:", error);
        alert("Wystąpił błąd podczas aktualizacji statusu.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Zarządzaj aktualnościami</h1>
        <Link
          to="/admin/news/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 whitespace-nowrap"
        >
          <Plus size={18} />
          Dodaj nowy
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
            <input 
                type="text" 
                placeholder="Szukaj po tytule..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
        </div>
        <div className="w-full md:w-64">
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
                <option value="">Wszystkie kategorie</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Batch Actions Bar */}
      {selectedPosts.length > 0 && (
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-4 flex items-center justify-between animate-fade-in">
              <span className="text-sm font-medium text-indigo-800 ml-2">
                  Zaznaczono: {selectedPosts.length}
              </span>
              <div className="flex gap-2">
                  <button 
                      onClick={() => handleBatchPublish(true)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                      Opublikuj
                  </button>
                  <button 
                      onClick={() => handleBatchPublish(false)}
                      className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                      Ukryj
                  </button>
                  <button 
                      onClick={handleBatchDelete}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1"
                  >
                      <Trash size={14} /> Usuń
                  </button>
              </div>
          </div>
      )}

      {loading ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden animate-pulse">
            <div className="h-12 bg-gray-100 border-b border-gray-200"></div>
            <div className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center p-4">
                        <div className="w-16 px-6">
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex-1 px-6">
                            <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        <div className="w-32 px-6">
                            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                        </div>
                        <div className="w-40 px-6">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
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
        <>
        <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                    <input 
                        type="checkbox" 
                        checked={posts.length > 0 && selectedPosts.length === posts.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 bg-white"
                    />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tytuł
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Data Publikacji
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Akcje</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className={selectedPosts.includes(post.id) ? "bg-indigo-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                        type="checkbox" 
                        checked={selectedPosts.includes(post.id)}
                        onChange={() => handleSelectOne(post.id)}
                        className="rounded border-gray-300 text-indigo-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 line-clamp-2 min-w-[200px]">
                      {post.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.published
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {post.published ? "Opublikowany" : "Szkic"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(post.date ? post.date : post.created)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                        <button
                          onClick={() => navigate(`/admin/news/edit/${post.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edytuj"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Usuń"
                        >
                          <Trash size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {posts.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                  Brak artykułów spełniających kryteria.
              </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                     // Simple pagination: show all if not too many, otherwise show simple range? 
                     // For now, let's just show Previous/Next and current info to correspond with typical heavy usage.
                     // Or easier:
                     return null; 
                 })}
                 
                 <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                 >
                     Poprzednia
                 </button>
                 <span className="text-sm text-gray-700">
                     Strona {page} z {totalPages}
                 </span>
                 <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                 >
                     Następna
                 </button>
            </div>
        )}
        </>
      )}
    </div>
  );
};

export default AdminNews;
