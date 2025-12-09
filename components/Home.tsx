import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { pb } from "../services/pocketbase";
import { Post, getImageUrl } from "../lib/types";
import {
  Calendar,
  ArrowRight,
  BookOpen,
  Clock,
  Users,
  BedDouble,
  GraduationCap,
  Wrench,
  Book,
  Globe,
  Briefcase,
  Phone,
  BookCheck,
} from "lucide-react";
import heroBg from "../assets/tlo.png";

const Home: React.FC = () => {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        // Fetch 3 latest published posts
        const result = await pb.collection("posts").getList<Post>(1, 3, {
          sort: "-created",
          filter: "published = true",
          signal: controller.signal,
        });
        setLatestPosts(result.items);
      } catch (error: any) {
        if (!error.isAbort) {
          console.error("Error fetching posts:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
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
    <div className="flex flex-col gap-0">
      {/* Hero Section */}
      <section className="relative bg-school-primary text-white min-h-[600px] flex items-center overflow-hidden">
        {/* Abstract Background Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/20 z-10"></div>
          {/* Placeholder for actual school image */}
          <img
            src={heroBg}
            alt="Budynek szkoły"
            className="w-full h-full object-cover absolute top-0 left-0"
          />
        </div>

        <div className="container mx-auto px-4 relative z-20 pt-10">
          <div className="max-w-3xl">
            <div className="inline-block bg-school-accent/20 border border-school-accent/40 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
              <span className="text-school-accent font-semibold text-sm tracking-wide uppercase">
                Rekrutacja 2025/2026 trwa
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Twoja przyszłość <br />
              zaczyna się w Łopusznie
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
              Łączymy wieloletnią tradycję z nowoczesnym kształceniem zawodowym.
              Dołącz do społeczności, która wspiera Twoje pasje.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/p/oferta"
                className="bg-school-accent text-school-primary px-8 py-4 rounded-md font-bold text-lg hover:bg-yellow-400 transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2"
              >
                Sprawdź Ofertę
                <ArrowRight size={20} />
              </Link>
              <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-md font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                <Globe size={20} />
                Wirtualny Spacer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="relative z-30 -mt-16 container mx-auto px-4 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shadow-xl rounded-lg overflow-hidden">
          {[
            {
              name: "E-Dziennik",
              icon: BookOpen,
              color: "bg-blue-600",
              link: "https://uonetplus.vulcan.net.pl/powiatkielecki",
            },
            {
              name: "Kontakt",
              icon: Phone,
              color: "bg-indigo-600",
              link: "/p/kontakt",
            },
            {
              name: "Oferta",
              icon: BookCheck,
              color: "bg-blue-700",
              link: "/p/oferta",
            },
            {
              name: "Internat",
              icon: BedDouble,
              color: "bg-indigo-700",
              link: "/p/internat",
            },
          ].map((link, idx) => (
            <a
              key={idx}
              href={link.link}
              className={`${link.color} text-white p-6 flex flex-col items-center justify-center gap-3 hover:brightness-110 transition-all h-32 md:h-40 text-center`}
            >
              <link.icon size={32} strokeWidth={1.5} />
              <span className="font-semibold">{link.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* News Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]"></div>
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
                  className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden h-96"
                >
                  <div className="bg-gray-200 h-48 w-full"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestPosts.length > 0 ? (
                latestPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group"
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
                      <div className="flex items-center text-gray-500 text-xs mb-3 gap-2">
                        <Calendar size={14} />
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
                            post.excerpt ||
                            post.content?.substring(0, 100) + "...",
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
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  Brak aktualności do wyświetlenia.
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/aktualnosci"
              className="border border-school-primary text-school-primary px-6 py-2 rounded-md font-semibold hover:bg-school-primary hover:text-white transition-colors"
            >
              Zobacz wszystkie aktualności
            </Link>
          </div>
        </div>
      </section>

      {/* Offer Summary Section */}
      <section className="bg-neutral-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-3xl font-bold text-school-primary mb-4">
              Wybierz swoją ścieżkę
            </h2>
            <p className="text-gray-600">
              Oferujemy różnorodne profile kształcenia dopasowane do potrzeb
              rynku pracy. Znajdź kierunek, który pozwoli Ci rozwinąć skrzydła.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-blue-100 text-school-primary rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap size={32} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-gray-800 mb-3">
                Liceum Ogólnokształcące
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Przygotowanie do studiów wyższych. Profile humanistyczne, ścisłe
                i językowe. Rozwijaj pasje w kołach zainteresowań.
              </p>
              <Link
                to="/p/oferta"
                className="text-school-primary font-bold hover:text-blue-700 flex items-center gap-2"
              >
                Zobacz profile <ArrowRight size={16} />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-school-accent relative hover:-translate-y-2 transition-transform duration-300 transform scale-105 md:scale-110 z-10">
              <div className="absolute top-0 right-0 bg-school-accent text-school-primary text-xs font-bold px-3 py-1 rounded-bl-lg">
                Najpopularniejsze
              </div>
              <div className="w-16 h-16 bg-yellow-100 text-yellow-700 rounded-2xl flex items-center justify-center mb-6">
                <Wrench size={32} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-gray-800 mb-3">
                Technikum
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Zdobycie zawodu i matura w 5 lat. Praktyki u lokalnych
                przedsiębiorców i staże zagraniczne Erasmus+.
              </p>
              <Link
                to="/p/oferta"
                className="text-school-primary font-bold hover:text-blue-700 flex items-center gap-2"
              >
                Wszystkie zawody <ArrowRight size={16} />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-blue-100 text-school-primary rounded-2xl flex items-center justify-center mb-6">
                <Briefcase size={32} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-gray-800 mb-3">
                Szkoła Branżowa
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Szybkie zdobycie konkretnych kwalifikacji zawodowych. Nauka w
                systemie dualnym - szkoła i pracodawca.
              </p>
              <Link
                to="/p/oferta"
                className="text-school-primary font-bold hover:text-blue-700 flex items-center gap-2"
              >
                Lista zawodów <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Banner */}
      <section className="bg-school-primary text-white py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2">
            <div className="flex items-center gap-3 mb-4 text-school-accent">
              <Globe size={24} />
              <span className="font-bold tracking-wider uppercase text-sm">
                Okno na świat
              </span>
            </div>
            <h2 className="font-serif text-3xl font-bold mb-4">
              Projekty Międzynarodowe
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              Realizujemy projekty unijne Erasmus+, dzięki którym nasi uczniowie
              odbywają bezpłatne staże zagraniczne w Hiszpanii, Grecji i we
              Włoszech.
            </p>
          </div>
          <div className="md:w-1/2 bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-sm">
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="bg-blue-900 px-2 py-1">Erasmus+</span>
              </div>
              <div className="text-xl font-bold text-white border-2 border-white px-3 py-1 rounded">
                POWER
              </div>
              <div className="text-lg text-white font-serif italic">
                Powiat Kielecki
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link
                to="/projekty"
                className="text-sm font-semibold hover:text-school-accent transition-colors underline decoration-school-accent/50 underline-offset-4"
              >
                Dowiedz się więcej o naszych projektach
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
