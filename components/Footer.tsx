import React, { useEffect, useState } from "react";
import { pb } from "../services/pocketbase";
import { FooterSettings, FooterBlock } from "../lib/types";
import {
  ContactBlockRenderer,
  TextBlockRenderer,
  LinksBlockRenderer,
  AdminBlockRenderer,
} from "./blocks/FooterBlockRenderers";

const defaultFooterData: FooterSettings = {
  id: "",
  collectionId: "",
  collectionName: "",
  columns_count: 4,
  columns: [
    {
      id: "c1",
      blocks: [
        {
          id: "b1",
          type: "contact",
          title: "Dane kontaktowe",
          data: {
            address:
              "Powiatowy Zespół Szkół\nul. Kasztanowa 1\n26-070 Łopuszno",
            phone: "+48 41 39 14 001",
            email: "sekretariat@pzs-lopuszno.pl",
          },
        },
      ],
    },
    {
      id: "c2",
      blocks: [
        {
          id: "b2",
          type: "links",
          title: "Informacje prawne",
          data: {
            links: [
              {
                label: "Biuletyn Informacji Publicznej (BIP)",
                url: "/kadra",
                icon: "FileText",
              },
              {
                label: "Klauzula informacyjna (RODO)",
                url: "#",
                icon: "Shield",
              },
              { label: "Deklaracja Dostępności", url: "#", icon: "Eye" },
            ],
          },
        },
      ],
    },
    {
      id: "c3",
      blocks: [
        {
          id: "b3",
          type: "links",
          title: "Na skróty",
          data: {
            links: [
              { label: "E-Dziennik Vulcan", url: "#" },
              { label: "Kadra pedagogiczna", url: "/kadra" },
              { label: "Projekty unijne", url: "/p/projekty" },
            ],
          },
        },
      ],
    },
    {
      id: "c4",
      blocks: [{ id: "b4", type: "admin", title: "Administracja", data: {} }],
    },
  ],
};

const Footer: React.FC = () => {
  const [settings, setSettings] = useState<FooterSettings>(defaultFooterData);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await pb
          .collection("footer_settings")
          .getList<FooterSettings>(1, 1, { requestKey: null });
        if (result.items.length > 0) {
          setSettings(result.items[0]);
        }
      } catch (e) {
        console.log("Using default footer settings");
      }
    };
    fetchSettings();
  }, []);

  const renderBlock = (block: FooterBlock) => {
    let content = null;
    switch (block.type) {
      case "contact":
        content = <ContactBlockRenderer data={block.data} />;
        break;
      case "text":
        content = <TextBlockRenderer data={block.data} />;
        break;
      case "links":
        content = <LinksBlockRenderer data={block.data} />;
        break;
      case "admin":
        content = <AdminBlockRenderer />;
        break;
      default:
        return null;
    }

    return (
      <div key={block.id} className="mb-8 last:mb-0">
        {block.title && (
          <h3 className="font-serif font-bold text-white text-lg mb-4 border-b border-white/20 pb-2 inline-block">
            {block.title}
          </h3>
        )}
        {content}
      </div>
    );
  };

  const getGridClass = (count: number) => {
    switch (count) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-3";
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      case 5:
        return "grid-cols-1 md:grid-cols-3 lg:grid-cols-5";
      default:
        return "grid-cols-1 md:grid-cols-4";
    }
  };

  return (
    <footer className="bg-school-primary text-white/90 text-sm">
      {/* Upper Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className={`grid ${getGridClass(settings.columns_count)} gap-8`}>
          {settings.columns.slice(0, settings.columns_count).map((col) => (
            <div key={col.id} className="flex flex-col">
              {col.blocks.map(renderBlock)}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer - Zmiana koloru na przyciemniony kolor główny */}
      <div className="relative bg-school-primary py-4">
        {/* Overlay przyciemniający (30% czerni) */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>

        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-white/70 relative z-10">
          <p>
            &copy; {currentYear} Powiatowy Zespół Szkół w Łopusznie. Wszelkie
            prawa zastrzeżone.
          </p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <span>
              Realizacja:&nbsp;
              <a
                href="https://www.perfektus.edu.pl"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:underline font-medium"
              >
                Perfektus System Sp. z o.o.
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
