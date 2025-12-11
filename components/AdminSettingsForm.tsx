import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { pb } from "../services/pocketbase";
import { SiteSettings, getImageUrl } from "../lib/types";
import { Save, RefreshCw, Image as ImageIcon } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

const AVAILABLE_FONTS = [
  "Inter",
  "Merriweather",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Playfair Display",
  "Oswald",
  "Raleway",
];

const AdminSettingsForm: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Partial<SiteSettings>>({
    primary_color: "#1e3a8a",
    accent_color: "#facc15",
    header_font: "Merriweather",
    body_font: "Inter",
    show_accessibility_widget: true,
    navbar_title: "Powiatowy Zespół Szkół",
    navbar_subtitle: "w Łopusznie",
    navbar_title_mobile: "PZS Łopuszno",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await pb
        .collection("site_settings")
        .getList<SiteSettings>(1, 1);
      if (result.items.length > 0) {
        const item = result.items[0];
        setSettings(item);
        if (item.logo)
          setLogoPreview(getImageUrl(item.collectionId, item.id, item.logo));
        if (item.favicon)
          setFaviconPreview(
            getImageUrl(item.collectionId, item.id, item.favicon)
          );
      }
    } catch (e) {
      console.log("Using default settings");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("primary_color", settings.primary_color || "");
    formData.append("accent_color", settings.accent_color || "");
    formData.append("header_font", settings.header_font || "");
    formData.append("body_font", settings.body_font || "");
    formData.append(
      "show_accessibility_widget",
      String(settings.show_accessibility_widget)
    );

    // Nowe pola tekstowe
    formData.append("navbar_title", settings.navbar_title || "");
    formData.append("navbar_subtitle", settings.navbar_subtitle || "");
    formData.append("navbar_title_mobile", settings.navbar_title_mobile || "");

    if (logoFile) formData.append("logo", logoFile);
    if (faviconFile) formData.append("favicon", faviconFile);

    try {
      if (settings.id) {
        await pb.collection("site_settings").update(settings.id, formData);
      } else {
        await pb.collection("site_settings").create(formData);
      }
      setMessage("Zapisano ustawienia! Strona odświeży się automatycznie.");
      loadSettings();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Wystąpił błąd podczas zapisywania.");
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

  const closeCancelModal = () => {
    setCancelModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8 items-start">
      <main>
        <h1 className="text-2xl font-bold mb-6">Ustawienia Wyglądu Strony</h1>

        {message && (
          <div
            className={`p-4 mb-6 rounded ${
              message.includes("błąd")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
          {/* LOGO I TEKST NAWIGACJI */}
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-600">
            <h2 className="text-xl font-bold mb-4">
              Identyfikacja (Logo i Tekst)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Logo Paska Nawigacji
                </label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-gray-100 border rounded flex items-center justify-center overflow-hidden relative">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        className="w-full h-full object-contain"
                        alt="Logo preview"
                      />
                    ) : (
                      <ImageIcon className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setLogoFile(e.target.files[0]);
                          setLogoPreview(
                            URL.createObjectURL(e.target.files[0])
                          );
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Zalecane: PNG z przezroczystością.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Favicon (Ikona karty)
                </label>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 border rounded flex items-center justify-center overflow-hidden relative">
                    {faviconPreview ? (
                      <img
                        src={faviconPreview}
                        className="w-full h-full object-contain"
                        alt="Favicon preview"
                      />
                    ) : (
                      <ImageIcon className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setFaviconFile(e.target.files[0]);
                          setFaviconPreview(
                            URL.createObjectURL(e.target.files[0])
                          );
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-bold text-gray-700 mb-4">
                Tekst w Pasku Nawigacji
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium mb-1">
                    Główny Tytuł
                  </label>
                  <input
                    type="text"
                    value={settings.navbar_title || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, navbar_title: e.target.value })
                    }
                    className="w-full border rounded p-2"
                    placeholder="np. Powiatowy Zespół Szkół"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium mb-1">
                    Podtytuł (mniejszy tekst)
                  </label>
                  <input
                    type="text"
                    value={settings.navbar_subtitle || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        navbar_subtitle: e.target.value,
                      })
                    }
                    className="w-full border rounded p-2"
                    placeholder="np. w Łopusznie"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium mb-1">
                    Tytuł Mobilny (krótki)
                  </label>
                  <input
                    type="text"
                    value={settings.navbar_title_mobile || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        navbar_title_mobile: e.target.value,
                      })
                    }
                    className="w-full border rounded p-2"
                    placeholder="np. PZS Łopuszno"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Wyświetlany na małych ekranach.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* KOLORY */}
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              Kolorystyka
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kolor Główny (Primary)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        primary_color: e.target.value,
                      })
                    }
                    className="h-10 w-10 p-0 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primary_color}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        primary_color: e.target.value,
                      })
                    }
                    className="flex-1 border rounded px-2"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Nagłówki, stopka, główne elementy.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kolor Akcentu (Secondary)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.accent_color}
                    onChange={(e) =>
                      setSettings({ ...settings, accent_color: e.target.value })
                    }
                    className="h-10 w-10 p-0 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.accent_color}
                    onChange={(e) =>
                      setSettings({ ...settings, accent_color: e.target.value })
                    }
                    className="flex-1 border rounded px-2"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Przyciski, wyróżnienia, detale.
                </p>
              </div>
            </div>
          </div>

          {/* CZCIONKI */}
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-600">
            <h2 className="text-xl font-bold mb-4">Typografia</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Czcionka Nagłówków (H1-H6)
                </label>
                <select
                  value={settings.header_font}
                  onChange={(e) =>
                    setSettings({ ...settings, header_font: e.target.value })
                  }
                  className="w-full border rounded p-2"
                >
                  {AVAILABLE_FONTS.map((font) => (
                    <option
                      key={font}
                      value={font}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Czcionka Tekstu (Body)
                </label>
                <select
                  value={settings.body_font}
                  onChange={(e) =>
                    setSettings({ ...settings, body_font: e.target.value })
                  }
                  className="w-full border rounded p-2"
                >
                  {AVAILABLE_FONTS.map((font) => (
                    <option
                      key={font}
                      value={font}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* INNE */}
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-600">
            <h2 className="text-xl font-bold mb-4">Funkcjonalności</h2>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="accessibility"
                checked={settings.show_accessibility_widget}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    show_accessibility_widget: e.target.checked,
                  })
                }
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor="accessibility"
                className="ml-3 block text-sm font-medium text-gray-700"
              >
                Pokaż widget dostępności (WCAG)
              </label>
            </div>
          </div>
        </form>
      </main>

      <aside className="sticky top-24">
        <div className="bg-white p-6 shadow-md rounded-lg flex flex-col gap-4">
          <button
            type="submit"
            form="settings-form"
            disabled={loading}
            className="w-full px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
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

export default AdminSettingsForm;
