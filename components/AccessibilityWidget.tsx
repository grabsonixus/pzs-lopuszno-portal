import React, { useState, useEffect } from "react";
import { Eye, Type, Underline, RotateCcw, Accessibility } from "lucide-react";

const AccessibilityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState<0 | 1 | 2>(0); // 0: normal, 1: medium, 2: large
  const [contrast, setContrast] = useState<"normal" | "high" | "inverted">(
    "normal"
  );
  const [highlightLinks, setHighlightLinks] = useState(false);

  // Aplikowanie zmian do elementu HTML
  useEffect(() => {
    const root = document.documentElement;

    // Reset klas
    root.classList.remove("wcag-fontsize-medium", "wcag-fontsize-large");
    root.classList.remove("wcag-contrast-high", "wcag-contrast-inverted");
    root.classList.remove("wcag-highlight-links");

    // Aplikuj nowe klasy
    if (fontSize === 1) root.classList.add("wcag-fontsize-medium");
    if (fontSize === 2) root.classList.add("wcag-fontsize-large");

    if (contrast === "high") root.classList.add("wcag-contrast-high");
    if (contrast === "inverted") root.classList.add("wcag-contrast-inverted");

    if (highlightLinks) root.classList.add("wcag-highlight-links");
  }, [fontSize, contrast, highlightLinks]);

  const resetSettings = () => {
    setFontSize(0);
    setContrast("normal");
    setHighlightLinks(false);
  };

  return (
    <>
      <style>{`
        /* Style WCAG wstrzykiwane dynamicznie */
        
        /* Rozmiar czcionki */
        html.wcag-fontsize-medium { font-size: 110%; }
        html.wcag-fontsize-large { font-size: 125%; }

        /* Wysoki Kontrast (Żółty na Czarnym) */
        html.wcag-contrast-high body, 
        html.wcag-contrast-high div, 
        html.wcag-contrast-high p, 
        html.wcag-contrast-high h1, html.wcag-contrast-high h2, html.wcag-contrast-high h3,
        html.wcag-contrast-high span,
        html.wcag-contrast-high li,
        html.wcag-contrast-high button,
        html.wcag-contrast-high input {
          background-color: #000000 !important;
          color: #FFFF00 !important;
          border-color: #FFFF00 !important;
        }
        
        html.wcag-contrast-high a {
          color: #00FF00 !important;
          text-decoration: underline !important;
        }

        html.wcag-contrast-high img {
            filter: grayscale(100%);
        }

        /* Kontrast Odwrócony (Biały na Czarnym) */
        html.wcag-contrast-inverted {
            filter: invert(100%);
        }
        html.wcag-contrast-inverted img, 
        html.wcag-contrast-inverted video {
            filter: invert(100%); /* Zapobiega odwróceniu kolorów zdjęć */
        }

        /* Podkreślanie linków */
        html.wcag-highlight-links a {
          text-decoration: underline !important;
          text-decoration-thickness: 2px !important;
          text-underline-offset: 4px !important;
        }
      `}</style>

      <div className="fixed right-0 top-1/3 z-[100] print:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-school-primary text-white p-3 rounded-l-lg shadow-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
          aria-label="Otwórz panel ułatwień dostępu"
          title="Ułatwienia dostępu"
        >
          <Accessibility size={24} />
        </button>

        {isOpen && (
          <div className="absolute right-full top-0 mr-2 bg-white rounded-lg shadow-xl p-4 w-64 border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-800">Dostępność</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Zamknij</span>
                &times;
              </button>
            </div>

            {/* Rozmiar tekstu */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Type size={16} /> Rozmiar tekstu
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFontSize(0)}
                  className={`flex-1 py-1 border rounded ${
                    fontSize === 0
                      ? "bg-blue-100 border-blue-500"
                      : "hover:bg-gray-50"
                  }`}
                  aria-label="Normalny rozmiar tekstu"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize(1)}
                  className={`flex-1 py-1 border rounded text-lg ${
                    fontSize === 1
                      ? "bg-blue-100 border-blue-500"
                      : "hover:bg-gray-50"
                  }`}
                  aria-label="Powiększony rozmiar tekstu"
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize(2)}
                  className={`flex-1 py-1 border rounded text-xl font-bold ${
                    fontSize === 2
                      ? "bg-blue-100 border-blue-500"
                      : "hover:bg-gray-50"
                  }`}
                  aria-label="Duży rozmiar tekstu"
                >
                  A++
                </button>
              </div>
            </div>

            {/* Kontrast */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Eye size={16} /> Kontrast
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setContrast("normal")}
                  className={`flex-1 py-2 border rounded bg-white text-black ${
                    contrast === "normal" ? "ring-2 ring-blue-500" : ""
                  }`}
                  title="Normalny"
                >
                  A
                </button>
                <button
                  onClick={() => setContrast("high")}
                  className={`flex-1 py-2 border rounded bg-black text-yellow-400 font-bold ${
                    contrast === "high" ? "ring-2 ring-blue-500" : ""
                  }`}
                  title="Wysoki kontrast"
                >
                  A
                </button>
                <button
                  onClick={() => setContrast("inverted")}
                  className={`flex-1 py-2 border rounded bg-black text-white ${
                    contrast === "inverted" ? "ring-2 ring-blue-500" : ""
                  }`}
                  title="Odwrócone kolory"
                >
                  A
                </button>
              </div>
            </div>

            {/* Linki */}
            <div>
              <button
                onClick={() => setHighlightLinks(!highlightLinks)}
                className={`w-full py-2 border rounded flex items-center justify-center gap-2 transition-colors ${
                  highlightLinks
                    ? "bg-blue-100 border-blue-500 text-blue-900"
                    : "hover:bg-gray-50"
                }`}
              >
                <Underline size={16} />
                Podkreśl linki
              </button>
            </div>

            {/* Reset */}
            <div className="pt-2 border-t">
              <button
                onClick={resetSettings}
                className="w-full py-2 text-sm text-gray-600 hover:text-red-600 flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} /> Przywróć domyślne
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AccessibilityWidget;
