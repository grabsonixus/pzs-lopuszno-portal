import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { pb } from "../services/pocketbase";
import { HomeSettings, SectionBlock, getImageUrl } from "../lib/types";
import DynamicIcon from "./DynamicIcon";
import heroBgPlaceholder from "../assets/tlo.png";

// Import bloków
import NewsBlock from "./blocks/NewsBlock";
import OfferBlock from "./blocks/OfferBlock";
import ProjectsBlock from "./blocks/ProjectsBlock";
import SeparatorBlock from "./blocks/SeparatorBlock";

const defaultSettings: HomeSettings = {
  id: "",
  collectionId: "",
  collectionName: "",
  hero_title: "Twoja przyszłość\nzaczyna się w Łopusznie",
  hero_subtitle:
    "Łączymy wieloletnią tradycję z nowoczesnym kształceniem zawodowym.",
  hero_bg: "",
  hero_overlay_opacity: 90,
  hero_buttons: [
    {
      label: "Sprawdź Ofertę",
      link: "/p/oferta",
      icon: "ArrowRight",
      style: "primary",
    },
    { label: "Wirtualny Spacer", link: "#", icon: "Globe", style: "glass" },
  ],
  quick_links: [
    {
      title: "E-Dziennik",
      link: "https://uonetplus.vulcan.net.pl/powiatkielecki",
      icon: "BookOpen",
      color_type: "custom",
      color: "bg-blue-600",
    },
    {
      title: "Kontakt",
      link: "/p/kontakt",
      icon: "Phone",
      color_type: "custom",
      color: "bg-indigo-600",
    },
    {
      title: "Oferta",
      link: "/p/oferta",
      icon: "BookCheck",
      color_type: "custom",
      color: "bg-blue-700",
    },
    {
      title: "Internat",
      link: "/p/internat",
      icon: "BedDouble",
      color_type: "custom",
      color: "bg-indigo-700",
    },
  ],
  sections: [
    { id: "s1", type: "news", visible: true },
    { id: "s2", type: "offer", visible: true },
    { id: "s3", type: "projects", visible: true },
  ],
};

const Home: React.FC = () => {
  const [settings, setSettings] = useState<HomeSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await pb
          .collection("home_settings")
          .getList<HomeSettings>(1, 1, {
            requestKey: null,
          });
        if (result.items.length > 0) {
          setSettings(result.items[0]);
        }
      } catch (error) {
        console.log("Using default settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const renderBlock = (block: SectionBlock) => {
    if (!block.visible) return null;
    switch (block.type) {
      case "news":
        return <NewsBlock key={block.id} />;
      case "offer":
        return <OfferBlock key={block.id} />;
      case "projects":
        return <ProjectsBlock key={block.id} />;
      case "separator":
        return <SeparatorBlock key={block.id} />;
      default:
        return null;
    }
  };

  const heroBgUrl =
    settings.hero_bg && settings.id
      ? getImageUrl(
          settings.collectionId,
          settings.id,
          settings.hero_bg,
          "1920x1080"
        )
      : heroBgPlaceholder;

  const linkCount = settings.quick_links.length;
  let gridColsClass = "";
  let containerWidthClass = "";

  if (linkCount === 1) {
    gridColsClass = "grid-cols-1";
    containerWidthClass = "max-w-md";
  } else if (linkCount === 2) {
    gridColsClass = "grid-cols-1 md:grid-cols-2";
    containerWidthClass = "max-w-3xl";
  } else if (linkCount === 3) {
    gridColsClass = "grid-cols-1 md:grid-cols-3";
    containerWidthClass = "max-w-5xl";
  } else {
    gridColsClass = "grid-cols-2 md:grid-cols-4";
    containerWidthClass = "max-w-full";
  }

  // Funkcja pomocnicza do pobierania klasy koloru tła
  const getLinkColorClass = (link: (typeof settings.quick_links)[0]) => {
    if (link.color_type === "primary") return "bg-school-primary";
    if (link.color_type === "secondary")
      return "bg-school-accent text-school-primary";
    return link.color || "bg-gray-600"; // Fallback
  };

  return (
    <div className="flex flex-col gap-0">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-school-primary text-white min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* ZMIANA: Używamy bg-school-primary zamiast bg-blue-900.
            Dzięki temu overlay będzie miał ten sam kolor co główny motyw strony.
          */}
          <div
            className="absolute inset-0 bg-school-primary z-10 transition-opacity duration-300"
            style={{ opacity: (settings.hero_overlay_opacity ?? 90) / 100 }}
          ></div>
          <img
            src={heroBgUrl}
            alt="Budynek szkoły"
            className="w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-700"
            loading="eager"
            fetchPriority="high"
          />
        </div>

        <div className="container mx-auto px-4 relative z-20 pt-10">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight whitespace-pre-line">
              {settings.hero_title}
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
              {settings.hero_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {settings.hero_buttons.map((btn, idx) =>
                btn.style === "primary" ? (
                  <Link
                    key={idx}
                    to={btn.link}
                    className="group relative bg-school-accent text-school-primary px-8 py-4 rounded-full font-bold text-lg overflow-hidden transition-all shadow-[0_0_20px_rgba(255,198,0,0.3)] hover:shadow-[0_0_30px_rgba(255,198,0,0.6)] hover:-translate-y-1 flex items-center justify-center gap-3"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine" />
                    <span className="relative z-10">{btn.label}</span>
                    <span className="relative z-10 group-hover:translate-x-1 transition-transform">
                        <DynamicIcon name={btn.icon} size={20} />
                    </span>
                  </Link>
                ) : (
                  <a
                    key={idx}
                    href={btn.link}
                    className="group bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 hover:border-white/40 transition-all flex items-center justify-center gap-3"
                  >
                    <span className="group-hover:-translate-x-1 transition-transform">
                        <DynamicIcon name={btn.icon} size={20} />
                    </span>
                    {btn.label}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- QUICK LINKS SECTION --- */}
      <section className="relative z-30 -mt-16 container mx-auto px-4 mb-20 transform-gpu">
        <div className={`mx-auto ${containerWidthClass}`}>
          <div
            className={`grid ${gridColsClass} gap-6`}
          >
            {settings.quick_links.map((link, idx) => (
              <a
                key={idx}
                href={link.link}
                className={`relative group overflow-hidden rounded-2xl ${getLinkColorClass(
                  link
                )} shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-40 flex flex-col items-center justify-center text-white`}
              >
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-white/10 blur-xl group-hover:bg-white/20 transition-colors"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-20 h-20 rounded-full bg-black/5 blur-lg"></div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                        <DynamicIcon name={link.icon} size={32} strokeWidth={1.5} className="group-hover:rotate-6 transition-transform duration-300" />
                    </div>
                    <span className="font-bold tracking-wide text-lg group-hover:tracking-widest transition-all duration-300">{link.title}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* --- DYNAMIC BLOCKS --- */}
      {settings.sections.map((block) => renderBlock(block))}
    </div>
  );
};

export default Home;
