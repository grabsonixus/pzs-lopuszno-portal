import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { pb } from "../services/pocketbase";
import { Subpage } from "../lib/types";
import { ArrowLeft, Home, ChevronRight } from "lucide-react";
import { AdminEditContext } from "../lib/AdminEditContext";

// Simple in-memory cache
const subpageCache = new Map<string, Subpage>();

const SubpageDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [subpage, setSubpage] = useState<Subpage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { setPageId, setPageType } = useContext(AdminEditContext);
  
  // Track if we are navigating to a new slug to handle transition
  const previousSlug = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;

    // Reset state for new fetch
    if (previousSlug.current !== slug) {
       // Check cache first
       if (subpageCache.has(slug)) {
         setSubpage(subpageCache.get(slug)!);
         setLoading(false);
         setError(false);
       } else {
         // Only set loading if not in cache
         setLoading(true);
         setSubpage(null); 
         setError(false);
       }
       previousSlug.current = slug;
    }

    const controller = new AbortController();
    
    const fetchSubpage = async () => {
      // If we already have it from cache, we can skip fetch or background update
      // For now, let's just trust cache if present to be instant
      if (subpageCache.has(slug)) {
          setPageId(subpageCache.get(slug)!.id);
          setPageType("subpage");
          setLoading(false); 
          // Optional: Background re-fetch could go here
          return;
      }

      try {
        setLoading(true);
        const result = await pb
          .collection("subpages")
          .getFirstListItem<Subpage>(`slug="${slug}"`, {
            signal: controller.signal,
          });
          
        if (!controller.signal.aborted) {
          subpageCache.set(slug, result); // Save to cache
          setSubpage(result);
          setPageId(result.id);
          setPageType("subpage");
          setError(false);
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
      // Don't clear pageId immediately to prevent UI flicker on admin controls
      // setPageId(null); 
      // setPageType(null);
    };
  }, [slug, setPageId, setPageType]);

  const processContent = (html: string) => {
      if (!html) return "";
      return html.replace(
          /<img\s+([^>]+)>/gi,
          (match, attributes) => {
              const hasLoading = /loading=['"]/.test(attributes);
              const extraAttrs = hasLoading ? '' : 'loading="lazy" decoding="async"';
              return `<img ${attributes} ${extraAttrs} style="max-width: 100%; height: auto;" />`;
          }
      );
  };

  // If error, show error state
  if (error && !loading && !subpage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md mx-4">
          <h2 className="text-2xl font-bold text-school-primary mb-4">
            Nie znaleziono podstrony
          </h2>
          <p className="text-gray-600 mb-8">
            Strona, której szukasz nie istnieje lub została usunięta.
          </p>
          <Link
            to="/"
            className="inline-flex items-center text-white bg-school-primary px-6 py-2 rounded-md hover:bg-blue-800 transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Wróć na stronę główną
          </Link>
        </div>
      </div>
    );
  }

  // Render Skeleton or Content, but KEEP THE STRUCTURE STABLE
  return (
    <article className="min-h-screen bg-gray-50">
      {/* Header - Always visible */}
      <div className="relative bg-school-primary text-white overflow-hidden transition-all duration-300">
        {/* Dekoracyjne tło */}
        <div className="absolute inset-0 z-0">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl"></div>
            <div className="absolute top-1/2 -left-24 w-64 h-64 rounded-full bg-school-accent opacity-10 blur-3xl"></div>
             {/* Subtelny wzór kropkowany */}
             <div className="absolute inset-0 bg-[radial-gradient(#ffffff1a_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>

        <div className="relative container mx-auto px-4 pt-20 pb-32 max-w-5xl z-10 text-center">
          {/* Breadcrumbs */}
          <nav className="flex items-center justify-center gap-2 text-blue-200 text-sm mb-8 font-medium animate-fade-in-up">
            <Link
              to="/"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Home size={14} /> Strona główna
            </Link>
            <ChevronRight size={14} className="opacity-50" />
            <span className="text-white truncate max-w-[200px]">
              {loading && !subpage ? (
                <span className="inline-block w-24 h-4 bg-white/20 animate-pulse rounded"></span>
              ) : (
                subpage?.title
              )}
            </span>
          </nav>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight drop-shadow-sm min-h-[1.2em]">
             {loading && !subpage ? (
                 <div className="w-2/3 mx-auto h-12 bg-white/20 animate-pulse rounded"></div>
             ) : (
                 subpage?.title
             )}
          </h1>

          {/* Ozdobna linia */}
          <div className="h-1 w-24 bg-school-accent mx-auto rounded-full shadow-sm"></div>
        </div>
      </div>

      {/* Content Container - Always visible */}
      <div className="container mx-auto px-4 pb-20 max-w-4xl relative z-20 -mt-20">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12 min-h-[300px]">
           {loading && !subpage ? (
               // Content Skeleton
               <div className="space-y-4 animate-pulse">
                   <div className="h-4 bg-gray-200 rounded w-full"></div>
                   <div className="h-4 bg-gray-200 rounded w-full"></div>
                   <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                   <div className="h-48 bg-gray-200 rounded-xl w-full my-8"></div>
                   <div className="h-4 bg-gray-200 rounded w-full"></div>
                   <div className="h-4 bg-gray-200 rounded w-3/4"></div>
               </div>
           ) : (
               // Actual Content
               <div
                className="prose prose-lg prose-blue max-w-none prose-img:rounded-xl prose-headings:font-serif prose-headings:text-school-primary prose-a:text-school-primary hover:prose-a:text-blue-800 animate-fade-in"
                dangerouslySetInnerHTML={{ __html: subpage ? processContent(subpage.content) : "" }}
              ></div>
           )}
        </div>
      </div>
    </article>
  );
};

export default SubpageDetail;

