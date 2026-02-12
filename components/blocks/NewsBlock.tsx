import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { pb } from "../../services/pocketbase";
import { Post, getImageUrl } from "../../lib/types";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";

const NewsBlock: React.FC = () => {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPosts = async () => {
      try {
        const result = await pb.collection("posts").getList<Post>(1, 3, {
          sort: "-date,-created",
          filter: "published = true",
          signal: controller.signal,
        });
        setLatestPosts(result.items);
      } catch (error: any) {
        if (!error.isAbort) console.error("Error fetching posts:", error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchPosts();
    return () => controller.abort();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Tło sekcji: Gradient + Grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-100"></div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-school-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-school-primary/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-serif text-4xl font-bold text-school-primary mb-3">
              Aktualności
            </h2>
            <div className="h-1.5 w-24 bg-school-accent rounded-full"></div>
          </div>
          <Link
            to="/aktualnosci"
            className="hidden md:flex items-center text-school-primary font-bold hover:text-blue-700 transition-colors gap-2 group"
          >
            Zobacz wszystkie <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 bg-gray-100 rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : latestPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestPosts.map((post) => (
              <Link
                key={post.id}
                to={`/aktualnosci/${post.slug}`}
                className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-school-primary/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
              >
                <div className="relative overflow-hidden h-56 shrink-0 bg-gray-100">
                  {post.cover_image ? (
                    <img
                      src={getImageUrl(
                        post.collectionId,
                        post.id,
                        post.cover_image
                      )}
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-school-primary/5 to-school-accent/10 group-hover:from-school-primary/10 group-hover:to-school-accent/20 transition-colors duration-500">
                      <BookOpen size={48} className="text-school-primary/20 group-hover:text-school-primary/30 transition-colors" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-school-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm z-10 border border-gray-100">
                    {post.category || "Wydarzenia"}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-gray-500 text-xs mb-3 flex items-center gap-2 font-medium">
                    <Calendar size={14} className="text-school-accent" />
                    {post.date
                      ? formatDate(post.date)
                      : formatDate(post.created)}
                  </div>
                  <h3 className="font-serif font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-school-primary transition-colors leading-tight">
                    {post.title}
                  </h3>
                  <div
                    className="text-gray-600 text-sm line-clamp-3 mb-5 flex-grow prose prose-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html:
                        post.excerpt || post.content?.substring(0, 100) + "...",
                    }}
                  ></div>
                  <div className="inline-flex items-center text-school-primary font-bold text-sm group-hover:translate-x-2 transition-transform mt-auto">
                    Czytaj więcej <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
            <BookOpen className="mx-auto mb-4 opacity-20" size={48} />
            <p className="font-medium">Brak aktualności do wyświetlenia.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsBlock;
