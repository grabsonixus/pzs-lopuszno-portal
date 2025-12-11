import React, { useEffect, useState, createContext } from "react";
import { pb } from "../services/pocketbase";
import { SiteSettings, getImageUrl } from "../lib/types";

// Tworzymy kontekst, aby inne komponenty (np. Navbar) mogły łatwo dostać się do logo
export const ThemeContext = createContext<Partial<SiteSettings>>({});

export const ThemeManager: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await pb
          .collection("site_settings")
          .getList<SiteSettings>(1, 1, {
            requestKey: null,
          });
        if (result.items.length > 0) {
          setSettings(result.items[0]);
          applyTheme(result.items[0]);
        }
      } catch (error) {
        console.log("No site settings found, using defaults.");
      }
    };

    fetchSettings();

    // Subskrypcja zmian w czasie rzeczywistym (opcjonalne, ale fajne dla admina)
    pb.collection("site_settings").subscribe("*", function (e) {
      if (e.action === "update" || e.action === "create") {
        const newSettings = e.record as unknown as SiteSettings;
        setSettings(newSettings);
        applyTheme(newSettings);
      }
    });

    return () => {
      pb.collection("site_settings").unsubscribe("*");
    };
  }, []);

  const applyTheme = (theme: SiteSettings) => {
    const root = document.documentElement;

    // 1. Kolory
    if (theme.primary_color) {
      root.style.setProperty("--color-primary", theme.primary_color);
    }
    if (theme.accent_color) {
      root.style.setProperty("--color-accent", theme.accent_color);
    }

    // 2. Czcionki - aktualizacja zmiennych
    if (theme.header_font) {
      root.style.setProperty("--font-header", `'${theme.header_font}', serif`);
    }
    if (theme.body_font) {
      root.style.setProperty("--font-body", `'${theme.body_font}', sans-serif`);
    }

    // 3. Czcionki - ładowanie z Google Fonts
    // Weryfikujemy czy link już istnieje, żeby nie dublować
    const fontId = "dynamic-google-fonts";
    let link = document.getElementById(fontId) as HTMLLinkElement;

    if (!link) {
      link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    const fontsToLoad = [];
    if (theme.header_font)
      fontsToLoad.push(theme.header_font.replace(/ /g, "+") + ":wght@400;700");
    if (theme.body_font)
      fontsToLoad.push(
        theme.body_font.replace(/ /g, "+") + ":wght@300;400;500;700"
      );

    if (fontsToLoad.length > 0) {
      link.href = `https://fonts.googleapis.com/css2?family=${fontsToLoad.join(
        "&family="
      )}&display=swap`;
    }

    // 4. Favicon
    if (theme.favicon) {
      const faviconUrl = getImageUrl(
        theme.collectionId,
        theme.id,
        theme.favicon
      );
      let faviconLink = document.querySelector(
        "link[rel~='icon']"
      ) as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement("link");
        faviconLink.rel = "icon";
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = faviconUrl;
    }
  };

  return (
    <ThemeContext.Provider value={settings || {}}>
      {children}
    </ThemeContext.Provider>
  );
};
