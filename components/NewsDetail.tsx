import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pb } from '../services/pocketbase';
import { Post, getImageUrl } from '../lib/types';
import { Calendar, ArrowLeft, Share2 } from 'lucide-react';
import { AdminEditContext } from '../lib/AdminEditContext';

const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { setPageId, setPageType } = useContext(AdminEditContext);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      setError(false);
      try {
        const result = await pb.collection('posts').getFirstListItem<Post>(`slug="${slug}"`, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setPost(result);
          setPageId(result.id);
          setPageType('news');
        }
      } catch (err: any) {
        if (!err.isAbort) {
          console.error("Error fetching post:", err);
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPost();
    window.scrollTo(0, 0);

    return () => {
      controller.abort();
      setPageId(null);
      setPageType(null);
    };
  }, [slug, setPageId, setPageType]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-3xl">
         <div className="animate-pulse space-y-4">
           <div className="h-8 bg-gray-200 rounded w-3/4"></div>
           <div className="h-4 bg-gray-200 rounded w-1/4"></div>
           <div className="h-96 bg-gray-200 rounded w-full mt-8"></div>
           <div className="space-y-2 mt-8">
             <div className="h-4 bg-gray-200 rounded w-full"></div>
             <div className="h-4 bg-gray-200 rounded w-full"></div>
             <div className="h-4 bg-gray-200 rounded w-5/6"></div>
           </div>
         </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="text-2xl font-bold text-school-primary mb-4">Nie znaleziono artykułu</h2>
        <p className="text-gray-600 mb-8">Artykuł, którego szukasz nie istnieje lub został usunięty.</p>
        <Link to="/aktualnosci" className="inline-flex items-center text-white bg-school-primary px-6 py-2 rounded-md hover:bg-blue-800 transition-colors">
          <ArrowLeft size={18} className="mr-2" />
          Wróć do aktualności
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen">
      {/* Header */}
      {post.cover_image ? (
        <div className="w-full h-64 md:h-96 relative overflow-hidden">
          <img
            src={getImageUrl(post.collectionId, post.id, post.cover_image)}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-4 md:p-12">
            <div className="container mx-auto max-w-4xl">
              <span className="bg-school-accent text-school-primary px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                {post.category || 'Wydarzenia'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative py-12">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]"></div>
          <div className="relative container mx-auto px-4 max-w-4xl text-center">
            <span className="bg-school-accent text-school-primary px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-3 inline-block">
              {post.category || 'Wydarzenia'}
            </span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Navigation */}
        <Link to="/aktualnosci" className="inline-flex items-center text-gray-500 hover:text-school-primary mb-8 transition-colors text-sm font-medium">
          <ArrowLeft size={16} className="mr-1" />
          Wróć do listy
        </Link>

        {/* Title & Meta */}
        <header className="mb-10">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-gray-500 border-b border-gray-100 pb-8">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-school-primary" />
              <span>{post.date ? formatDate(post.date) : formatDate(post.created)}</span>
            </div>
            {/* Share placeholder */}
            <button className="flex items-center gap-2 hover:text-school-primary transition-colors ml-auto">
              <Share2 size={18} />
              <span className="text-sm">Udostępnij</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div 
          className="prose prose-lg prose-blue max-w-none prose-img:rounded-xl prose-headings:font-serif prose-headings:text-school-primary"
          dangerouslySetInnerHTML={{ __html: post.content }}
        ></div>

        {/* Gallery */}
        {post.gallery && post.gallery.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Galeria</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {post.gallery.map((image, index) => (
                <a key={index} href={getImageUrl(post.collectionId, post.id, image)} target="_blank" rel="noopener noreferrer">
                  <img
                    src={getImageUrl(post.collectionId, post.id, image)}
                    alt={`${post.title} gallery image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg shadow-md hover:opacity-90 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default NewsDetail;