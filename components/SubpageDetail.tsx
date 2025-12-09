import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { pb } from "../services/pocketbase";
import { Subpage } from "../lib/types";
import { ArrowLeft, Home, ChevronRight } from "lucide-react";
import { AdminEditContext } from "../lib/AdminEditContext";

const SubpageDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [subpage, setSubpage] = useState<Subpage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { setPageId, setPageType } = useContext(AdminEditContext);

  useEffect(() => {
    const controller = new AbortController();
    const fetchSubpage = async () => {
      if (!slug) return;
      setLoading(true);
      setError(false);
      try {
        const result = await pb
          .collection("subpages")
          .getFirstListItem<Subpage>(`slug="${slug}"`, {
            signal: controller.signal,
          });
        if (!controller.signal.aborted) {
          setSubpage(result);
          setPageId(result.id);
          setPageType("subpage");
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
      setPageId(null);
      setPageType(null);
    };
  }, [slug, setPageId, setPageType]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-200 rounded-xl w-full mb-8"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-8"></div>
          <div className="space-y-4">
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

  return (
    <article className="min-h-screen bg-gray-50">
      {/* Nowy Header */}
      <div className="relative bg-school-primary text-white overflow-hidden">
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
              {subpage.title}
            </span>
          </nav>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight drop-shadow-sm">
            {subpage.title}
          </h1>

          {/* Ozdobna linia */}
          <div className="h-1 w-24 bg-school-accent mx-auto rounded-full shadow-sm"></div>
        </div>
      </div>

      {/* Kontent w karcie nachodzącej na header */}
      <div className="container mx-auto px-4 pb-20 max-w-4xl relative z-20 -mt-20">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12">
          <div
            className="prose prose-lg prose-blue max-w-none prose-img:rounded-xl prose-headings:font-serif prose-headings:text-school-primary prose-a:text-school-primary hover:prose-a:text-blue-800"
            dangerouslySetInnerHTML={{ __html: subpage.content }}
          ></div>
        </div>
      </div>
    </article>
  );
};

export default SubpageDetail;
