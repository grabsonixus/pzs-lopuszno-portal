import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pb } from '../services/pocketbase';
import { Subpage } from '../lib/types';
import { ArrowLeft } from 'lucide-react';

const SubpageDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [subpage, setSubpage] = useState<Subpage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchSubpage = async () => {
      if (!slug) return;
      setLoading(true);
      setError(false);
      try {
        const result = await pb.collection('subpages').getFirstListItem<Subpage>(`slug="${slug}"`, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setSubpage(result);
        }
      } catch (err: any) {
        if (!err.isAbort) {
          console.error("Error fetching subpage:", err);
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSubpage();
    window.scrollTo(0, 0);

    return () => {
      controller.abort();
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl">
         <div className="animate-pulse space-y-4">
           <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto"></div>
           <div className="space-y-4 mt-12">
             <div className="h-4 bg-gray-200 rounded w-full"></div>
             <div className="h-4 bg-gray-200 rounded w-full"></div>
             <div className="h-4 bg-gray-200 rounded w-5/6"></div>
           </div>
         </div>
      </div>
    );
  }

  if (error || !subpage) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="text-2xl font-bold text-school-primary mb-4">Nie znaleziono podstrony</h2>
        <p className="text-gray-600 mb-8">Strona, której szukasz nie istnieje lub została usunięta.</p>
        <Link to="/" className="inline-flex items-center text-white bg-school-primary px-6 py-2 rounded-md hover:bg-blue-800 transition-colors">
          <ArrowLeft size={18} className="mr-2" />
          Wróć na stronę główną
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-gray-50">
      <div className="bg-school-primary-light py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-school-primary mb-4 leading-tight">
                {subpage.title}
            </h1>
        </div>
      </div>
      
      <div className="bg-white">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div 
            className="prose prose-lg max-w-none prose-img:rounded-xl prose-headings:font-serif prose-headings:text-school-primary"
            dangerouslySetInnerHTML={{ __html: subpage.content }}
            ></div>
        </div>
      </div>
    </article>
  );
};

export default SubpageDetail;
