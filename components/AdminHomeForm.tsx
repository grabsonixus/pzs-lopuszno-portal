import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { pb } from "../services/pocketbase";
import {
  HomeSettings,
  HeroButton,
  QuickLinkItem,
  SectionBlock,
  getImageUrl,
} from "../lib/types";
import { Trash, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

const AVAILABLE_ICONS = [
  "ArrowRight",
  "Globe",
  "BookOpen",
  "Phone",
  "BookCheck",
  "BedDouble",
  "GraduationCap",
  "Wrench",
  "Briefcase",
  "Mail",
  "MapPin",
];

const AdminHomeForm: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Partial<HomeSettings>>({
    hero_title: "",
    hero_subtitle: "",
    hero_overlay_opacity: 90,
    hero_buttons: [],
    quick_links: [],
    sections: [],
  });
  const [heroBgFile, setHeroBgFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await pb
        .collection("home_settings")
        .getList<HomeSettings>(1, 1);
      if (result.items.length > 0) {
        setSettings(result.items[0]);
        if (result.items[0].hero_bg) {
          setBgPreview(
            getImageUrl(
              result.items[0].collectionId,
              result.items[0].id,
              result.items[0].hero_bg
            )
          );
        }
      } else {
        setSettings({
          hero_title: "Twoja przyszłość\nzaczyna się w Łopusznie",
          hero_subtitle:
            "Łączymy wieloletnią tradycję z nowoczesnym kształceniem zawodowym.",
          hero_overlay_opacity: 90,
          hero_buttons: [
            {
              label: "Sprawdź Ofertę",
              link: "/p/oferta",
              icon: "ArrowRight",
              style: "primary",
            },
            {
              label: "Wirtualny Spacer",
              link: "#",
              icon: "Globe",
              style: "glass",
            },
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
          ],
          sections: [
            { id: "1", type: "news", visible: true },
            { id: "2", type: "offer", visible: true },
            { id: "3", type: "projects", visible: true },
          ],
        });
      }
    } catch (e) {
      console.error("Could not load settings", e);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("hero_title", settings.hero_title || "");
      formData.append("hero_subtitle", settings.hero_subtitle || "");
      formData.append(
        "hero_overlay_opacity",
        String(settings.hero_overlay_opacity ?? 90)
      );
      formData.append("hero_buttons", JSON.stringify(settings.hero_buttons));
      formData.append("quick_links", JSON.stringify(settings.quick_links));
      formData.append("sections", JSON.stringify(settings.sections));

      if (heroBgFile) {
        formData.append("hero_bg", heroBgFile);
      }

      let record;
      if (settings.id) {
        record = await pb
          .collection("home_settings")
          .update(settings.id, formData);
      } else {
        record = await pb.collection("home_settings").create(formData);
      }
      setSettings(record as HomeSettings);
      if (record.hero_bg) {
        setBgPreview(
          getImageUrl(record.collectionId, record.id, record.hero_bg)
        );
      }
      setMessage("Zapisano zmiany!");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      console.error(e);
      setMessage("Błąd podczas zapisywania.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCancelModalOpen(true);
  };

  const confirmCancel = () => {
    navigate("/admin/dashboard");
    setCancelModalOpen(false);
  };

  // Dodana brakująca funkcja
  const closeCancelModal = () => {
    setCancelModalOpen(false);
  };

  // --- Handlers ---

  const addHeroButton = () => {
    setSettings((prev) => ({
      ...prev,
      hero_buttons: [
        ...(prev.hero_buttons || []),
        {
          label: "Nowy przycisk",
          link: "/",
          icon: "ArrowRight",
          style: "primary",
        },
      ],
    }));
  };
  const updateHeroButton = (
    index: number,
    field: keyof HeroButton,
    value: string
  ) => {
    const newBtns = [...(settings.hero_buttons || [])];
    // @ts-ignore
    newBtns[index][field] = value;
    setSettings((prev) => ({ ...prev, hero_buttons: newBtns }));
  };
  const removeHeroButton = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      hero_buttons: prev.hero_buttons?.filter((_, i) => i !== index),
    }));
  };

  const addQuickLink = () => {
    setSettings((prev) => ({
      ...prev,
      quick_links: [
        ...(prev.quick_links || []),
        {
          title: "Nowy link",
          link: "/",
          icon: "BookOpen",
          color_type: "primary",
          color: "bg-blue-600",
        },
      ],
    }));
  };
  const updateQuickLink = (
    index: number,
    field: keyof QuickLinkItem,
    value: string
  ) => {
    const newLinks = [...(settings.quick_links || [])];
    // @ts-ignore
    newLinks[index][field] = value;
    setSettings((prev) => ({ ...prev, quick_links: newLinks }));
  };
  const removeQuickLink = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      quick_links: prev.quick_links?.filter((_, i) => i !== index),
    }));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...(settings.sections || [])];
    if (direction === "up" && index > 0) {
      [newSections[index], newSections[index - 1]] = [
        newSections[index - 1],
        newSections[index],
      ];
    } else if (direction === "down" && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [
        newSections[index + 1],
        newSections[index],
      ];
    }
    setSettings((prev) => ({ ...prev, sections: newSections }));
  };
  const toggleSection = (index: number) => {
    const newSections = [...(settings.sections || [])];
    newSections[index].visible = !newSections[index].visible;
    setSettings((prev) => ({ ...prev, sections: newSections }));
  };
  const addSection = (type: SectionBlock["type"]) => {
    setSettings((prev) => ({
      ...prev,
      sections: [
        ...(prev.sections || []),
        { id: Date.now().toString(), type, visible: true },
      ],
    }));
  };
  const removeSection = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      sections: prev.sections?.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8 items-start">
      <main>
        <h1 className="text-2xl font-bold mb-6">Edycja Strony Głównej</h1>

        {message && (
          <div
            className={`p-4 mb-6 rounded ${
              message.includes("Błąd")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-8">
          {/* --- HERO SETTINGS --- */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
            <h2 className="text-xl font-bold mb-4">Sekcja Główna (Hero)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tytuł główny
                  </label>
                  <textarea
                    rows={2}
                    value={settings.hero_title}
                    onChange={(e) =>
                      setSettings({ ...settings, hero_title: e.target.value })
                    }
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Podtytuł
                  </label>
                  <textarea
                    rows={3}
                    value={settings.hero_subtitle}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hero_subtitle: e.target.value,
                      })
                    }
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 flex justify-between">
                    <span>Przezroczystość nakładki (przyciemnienie tła)</span>
                    <span className="font-bold">
                      {settings.hero_overlay_opacity ?? 90}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.hero_overlay_opacity ?? 90}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        hero_overlay_opacity: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    0% = brak przyciemnienia, 100% = pełny kolor główny
                    (primary).
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tło (Zdjęcie)
                </label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center relative h-48 bg-gray-50 flex flex-col items-center justify-center">
                  {bgPreview ? (
                    <img
                      src={bgPreview}
                      className="absolute inset-0 w-full h-full object-cover rounded"
                      alt="Preview"
                    />
                  ) : (
                    <ImageIcon className="text-gray-400 mb-2" size={32} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setHeroBgFile(e.target.files[0]);
                        setBgPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                    className="z-10 opacity-0 w-full h-full cursor-pointer absolute inset-0"
                  />
                  <span className="relative z-10 bg-white/80 px-2 py-1 rounded text-sm pointer-events-none mt-auto">
                    Kliknij aby zmienić
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Przyciski w Hero</label>
                <button
                  onClick={addHeroButton}
                  className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100"
                >
                  + Dodaj przycisk
                </button>
              </div>
              <div className="space-y-3">
                {settings.hero_buttons?.map((btn, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 items-center bg-gray-50 p-3 rounded border"
                  >
                    <input
                      type="text"
                      value={btn.label}
                      onChange={(e) =>
                        updateHeroButton(idx, "label", e.target.value)
                      }
                      placeholder="Tekst"
                      className="border rounded p-1 text-sm flex-grow"
                    />
                    <input
                      type="text"
                      value={btn.link}
                      onChange={(e) =>
                        updateHeroButton(idx, "link", e.target.value)
                      }
                      placeholder="Link"
                      className="border rounded p-1 text-sm w-1/4"
                    />
                    <select
                      value={btn.icon}
                      onChange={(e) =>
                        updateHeroButton(idx, "icon", e.target.value)
                      }
                      className="border rounded p-1 text-sm"
                    >
                      {AVAILABLE_ICONS.map((ic) => (
                        <option key={ic} value={ic}>
                          {ic}
                        </option>
                      ))}
                    </select>
                    <select
                      value={btn.style}
                      onChange={(e) =>
                        updateHeroButton(idx, "style", e.target.value as any)
                      }
                      className="border rounded p-1 text-sm"
                    >
                      <option value="primary">Żółty</option>
                      <option value="glass">Przezroczysty</option>
                    </select>
                    <button
                      onClick={() => removeHeroButton(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- QUICK LINKS SETTINGS --- */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Linki "Na skróty"</h2>
              <button
                onClick={addQuickLink}
                className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
              >
                + Dodaj link
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings.quick_links?.map((link, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 bg-gray-50 p-4 rounded border relative"
                >
                  <button
                    onClick={() => removeQuickLink(idx)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash size={16} />
                  </button>
                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <label className="text-xs text-gray-500">Tytuł</label>
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) =>
                          updateQuickLink(idx, "title", e.target.value)
                        }
                        className="w-full border rounded p-1 text-sm"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="text-xs text-gray-500">Ikona</label>
                      <select
                        value={link.icon}
                        onChange={(e) =>
                          updateQuickLink(idx, "icon", e.target.value)
                        }
                        className="w-full border rounded p-1 text-sm"
                      >
                        {AVAILABLE_ICONS.map((ic) => (
                          <option key={ic} value={ic}>
                            {ic}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">
                        Typ Koloru
                      </label>
                      <select
                        value={link.color_type || "custom"}
                        onChange={(e) =>
                          updateQuickLink(idx, "color_type", e.target.value)
                        }
                        className="w-full border rounded p-1 text-sm"
                      >
                        <option value="primary">Główny (Primary)</option>
                        <option value="secondary">Akcent (Secondary)</option>
                        <option value="custom">Własny (Custom)</option>
                      </select>
                    </div>
                    {link.color_type === "custom" && (
                      <div className="flex-1">
                        <label className="text-xs text-gray-500">
                          Klasa Tailwind
                        </label>
                        <input
                          type="text"
                          value={link.color}
                          onChange={(e) =>
                            updateQuickLink(idx, "color", e.target.value)
                          }
                          className="w-full border rounded p-1 text-sm"
                          placeholder="np. bg-blue-600"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Link URL</label>
                    <input
                      type="text"
                      value={link.link}
                      onChange={(e) =>
                        updateQuickLink(idx, "link", e.target.value)
                      }
                      className="w-full border rounded p-1 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- BLOCKS --- */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <h2 className="text-xl font-bold mb-4">Sekcje strony głównej</h2>
            <div className="mb-4 flex gap-2">
              <span className="text-sm text-gray-600 self-center">
                Dodaj sekcję:
              </span>
              <button
                onClick={() => addSection("news")}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
              >
                Aktualności
              </button>
              <button
                onClick={() => addSection("offer")}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
              >
                Oferta
              </button>
              <button
                onClick={() => addSection("projects")}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
              >
                Projekty
              </button>
              <button
                onClick={() => addSection("separator")}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50 bg-indigo-50 text-indigo-700 border-indigo-200"
              >
                + Separator
              </button>
            </div>

            <div className="space-y-3">
              {settings.sections?.map((section, idx) => (
                <div
                  key={section.id}
                  className={`flex items-center justify-between p-4 rounded border ${
                    section.visible ? "bg-white" : "bg-gray-100 opacity-75"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveSection(idx, "up")}
                        disabled={idx === 0}
                        className="text-gray-400 hover:text-gray-800 disabled:opacity-30"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => moveSection(idx, "down")}
                        disabled={idx === (settings.sections?.length || 0) - 1}
                        className="text-gray-400 hover:text-gray-800 disabled:opacity-30"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                    <div>
                      <span className="font-bold uppercase text-sm tracking-wider text-gray-700">
                        {section.type}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        ID: {section.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
                      <input
                        type="checkbox"
                        checked={section.visible}
                        onChange={() => toggleSection(idx)}
                        className="rounded text-indigo-600"
                      />
                      Widoczny
                    </label>
                    <button
                      onClick={() => removeSection(idx)}
                      className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {settings.sections?.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  Brak sekcji. Dodaj powyżej.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <aside className="sticky top-24">
        <div className="bg-white p-6 shadow-md rounded-lg flex flex-col gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all flex justify-center items-center gap-2"
          >
            {loading ? "Zapisywanie..." : "Zapisz zmiany"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            Anuluj
          </button>
        </div>
      </aside>

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        title="Potwierdzenie anulowania"
        message="Czy na pewno chcesz anulować? Niezapisane zmiany zostaną utracone."
        onConfirm={confirmCancel}
        onCancel={closeCancelModal}
        confirmText="Tak, anuluj"
        cancelText="Nie, kontynuuj edycję"
      />
    </div>
  );
};

export default AdminHomeForm;
