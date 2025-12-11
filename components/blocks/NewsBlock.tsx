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
          sort: "-created",
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
    <section className="relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="container mx-auto px-4 py-12 mb-12 relative">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-serif text-3xl font-bold text-school-primary mb-2">
              Aktualności
            </h2>
            <div className="h-1 w-20 bg-school-accent rounded-full"></div>
          </div>
          <Link
            to="/aktualnosci"
            className="hidden md:flex items-center text-school-primary font-semibold hover:text-blue-700 transition-colors gap-1"
          >
            Zobacz wszystkie <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 bg-gray-100 rounded animate-pulse"
              ></div>
            ))}
          </div>
        ) : latestPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full group"
              >
                <div className="relative overflow-hidden h-48 shrink-0 bg-gray-100">
                  {post.cover_image ? (
                    <img
                      src={getImageUrl(
                        post.collectionId,
                        post.id,
                        post.cover_image
                      )}
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <BookOpen size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-school-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {post.category || "Wydarzenia"}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-gray-500 text-xs mb-3 flex items-center gap-2">
                    <Calendar size={14} />{" "}
                    {post.date
                      ? formatDate(post.date)
                      : formatDate(post.created)}
                  </div>
                  <h3 className="font-serif font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-school-primary transition-colors">
                    {post.title}
                  </h3>
                  <div
                    className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow prose prose-sm"
                    dangerouslySetInnerHTML={{
                      __html:
                        post.excerpt || post.content?.substring(0, 100) + "...",
                    }}
                  ></div>
                  <Link
                    to={`/aktualnosci/${post.slug}`}
                    className="inline-flex items-center text-school-primary font-semibold text-sm hover:underline mt-auto"
                  >
                    Czytaj więcej <ArrowRight size={14} className="ml-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
            Brak aktualności.
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsBlock;
