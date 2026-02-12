import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { pb } from '../services/pocketbase';
import { Post, getImageUrl, Category } from '../lib/types';
import { Calendar, ArrowRight, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const NewsList: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const ITEMS_PER_PAGE = 6;
  
  useEffect(() => {
    pb.collection("categories").getFullList<Category>({ sort: "name" })
        .then(setCategories)
        .catch(console.error);
  }, []);

  useEffect(() => {
    if (categorySlug && categories.length > 0) {
        const cat = categories.find(c => c.slug === categorySlug);
        if (cat) {
            setSelectedCategory(cat.name);
        }
    } else if (!categorySlug) {
        setSelectedCategory("");
    }
  }, [categorySlug, categories]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const catName = e.target.value;
      setSelectedCategory(catName);
      if (catName) {
          const cat = categories.find(c => c.name === catName);
          if (cat) {
              navigate(`/aktualnosci/kategoria/${cat.slug}`);
          }
      } else {
          navigate('/aktualnosci');
      }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedSearch(search);
        setPage(1); // Reset page on search change
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setPage(1); // Reset page on category change
  }, [selectedCategory]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let filterRule = 'published = true';
        if (debouncedSearch) {
            filterRule += ` && title ~ "${debouncedSearch}"`;
        }
        if (selectedCategory) {
            filterRule += ` && category = "${selectedCategory}"`;
        }

        const result = await pb.collection('posts').getList<Post>(page, ITEMS_PER_PAGE, {
          sort: '-date,-created',
          filter: filterRule,
        });
        setPosts(result.items);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    window.scrollTo(0, 0);
  }, [page, debouncedSearch, selectedCategory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-school-primary mb-2">Aktualności</h1>
        <div className="h-1 w-20 bg-school-accent rounded-full mb-10"></div>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
            <input 
                type="text" 
                placeholder="Szukaj aktualności..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-school-primary focus:border-school-primary"
            />
            <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="p-3 border border-gray-300 rounded-md focus:ring-school-primary focus:border-school-primary min-w-[200px]"
            >
                <option value="">Wszystkie kategorie</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
            </select>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm h-80">
                 <div className="bg-gray-200 h-40 rounded-t-lg"></div>
                 <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                 </div>
               </div>
             ))}
           </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group">
                  <div className="relative overflow-hidden h-56 shrink-0 bg-gray-100">
                    {post.cover_image ? (
                      <img 
                        src={getImageUrl(post.collectionId, post.id, post.cover_image)} 
                        alt={post.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-school-primary/5 to-school-accent/10 group-hover:from-school-primary/10 group-hover:to-school-accent/20 transition-colors duration-500">
                        <BookOpen size={40} className="text-school-primary/20 group-hover:text-school-primary/30 transition-colors" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-school-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {post.category || 'Wydarzenia'}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-gray-500 text-xs mb-3 gap-2">
                      <Calendar size={14} />
                      {post.date ? formatDate(post.date) : formatDate(post.created)}
                    </div>
                    <h2 className="font-serif font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-school-primary transition-colors">
                      <Link to={`/aktualnosci/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                      {post.excerpt || post.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...'}
                    </p>
                    <Link to={`/aktualnosci/${post.slug}`} className="inline-flex items-center text-school-primary font-semibold text-sm hover:underline mt-auto">
                      Czytaj więcej <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-full border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-medium text-gray-600">
                  Strona {page} z {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-full border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-100">
            <p className="text-gray-500">Nie znaleziono żadnych aktualności.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsList;