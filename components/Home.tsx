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
                    className="bg-school-accent text-school-primary px-8 py-4 rounded-md font-bold text-lg hover:bg-yellow-400 transition-all shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-1"
                  >
                    {btn.label} <DynamicIcon name={btn.icon} size={20} />
                  </Link>
                ) : (
                  <a
                    key={idx}
                    href={btn.link}
                    className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-md font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <DynamicIcon name={btn.icon} size={20} /> {btn.label}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- QUICK LINKS SECTION --- */}
      <section className="relative z-30 -mt-16 container mx-auto px-4 mb-20">
        <div className={`mx-auto ${containerWidthClass}`}>
          <div
            className={`grid ${gridColsClass} gap-4 shadow-xl rounded-lg overflow-hidden`}
          >
            {settings.quick_links.map((link, idx) => (
              <a
                key={idx}
                href={link.link}
                className={`${getLinkColorClass(
                  link
                )} text-white p-6 flex flex-col items-center justify-center gap-3 hover:brightness-110 transition-all h-32 md:h-40 text-center`}
              >
                <DynamicIcon name={link.icon} size={32} strokeWidth={1.5} />
                <span className="font-semibold">{link.title}</span>
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
