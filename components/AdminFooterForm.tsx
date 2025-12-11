import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { pb } from "../services/pocketbase";
import {
  FooterSettings,
  FooterColumn,
  FooterBlock,
  FooterBlockType,
  FooterLink,
} from "../lib/types";
import {
  Save,
  Plus,
  Trash,
  ArrowUp,
  ArrowDown,
  Edit,
  X,
  GripVertical,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import DynamicIcon from "./DynamicIcon";

const AVAILABLE_ICONS = [
  "FileText",
  "Shield",
  "Eye",
  "Globe",
  "BookOpen",
  "Phone",
  "Mail",
  "MapPin",
  "Facebook",
  "Instagram",
  "Youtube",
];

const AdminFooterForm: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Partial<FooterSettings>>({
    columns_count: 4,
    columns: [],
  });

  const [editingBlock, setEditingBlock] = useState<{
    colIndex: number;
    blockIndex: number;
    block: FooterBlock;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await pb
        .collection("footer_settings")
        .getList<FooterSettings>(1, 1, { requestKey: null });
      if (result.items.length > 0) {
        setSettings(result.items[0]);
      } else {
        const cols = [];
        for (let i = 0; i < 4; i++)
          cols.push({ id: `c${Date.now()}_${i}`, blocks: [] });
        setSettings({ columns_count: 4, columns: cols });
      }
    } catch (e) {
      console.log("Using default settings or db not ready");
      const cols = [];
      for (let i = 0; i < 4; i++)
        cols.push({ id: `c${Date.now()}_${i}`, blocks: [] });
      setSettings({ columns_count: 4, columns: cols });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      const finalColumns =
        settings.columns?.slice(0, settings.columns_count) || [];

      const data = {
        columns_count: settings.columns_count,
        columns: finalColumns,
      };

      if (settings.id) {
        await pb.collection("footer_settings").update(settings.id, data);
      } else {
        await pb.collection("footer_settings").create(data);
      }

      setMessage("Zapisano zmiany!");
      setTimeout(() => setMessage(""), 3000);
      loadSettings();
    } catch (e) {
      console.error(e);
      setMessage("Błąd podczas zapisywania.");
    } finally {
      setLoading(false);
    }
  };

  const handleColumnsCountChange = (count: number) => {
    setSettings((prev) => {
      const currentCols = prev.columns || [];
      // Tworzymy kopię tablicy kolumn
      const newCols = [...currentCols];

      if (count > currentCols.length) {
        for (let i = currentCols.length; i < count; i++) {
          newCols.push({ id: `c${Date.now()}_${i}`, blocks: [] });
        }
      }

      return { ...prev, columns_count: count, columns: newCols };
    });
  };

  const addBlock = (colIndex: number, type: FooterBlockType) => {
    // Generujemy ID z losowym sufiksem dla pewności
    const newBlock: FooterBlock = {
      id: `b${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: type === "admin" ? "Administracja" : "Nowy blok",
      data: { links: [] },
    };

    setSettings((prev) => {
      const newColumns = prev.columns ? [...prev.columns] : [];

      // Bezpieczne kopiowanie kolumny i tablicy bloków (Fix mutacji stanu)
      if (newColumns[colIndex]) {
        newColumns[colIndex] = {
          ...newColumns[colIndex],
          blocks: [...newColumns[colIndex].blocks, newBlock],
        };
      } else {
        // Fallback gdyby kolumna nie istniała
        newColumns[colIndex] = {
          id: `c${Date.now()}-${colIndex}`,
          blocks: [newBlock],
        };
      }

      return { ...prev, columns: newColumns };
    });
  };

  const removeBlock = (colIndex: number, blockIndex: number) => {
    if (!window.confirm("Czy na pewno usunąć ten blok?")) return;
    setSettings((prev) => {
      const newColumns = prev.columns ? [...prev.columns] : [];
      if (newColumns[colIndex]) {
        // Kopia tablicy bloków
        const newBlocks = [...newColumns[colIndex].blocks];
        newBlocks.splice(blockIndex, 1);

        // Przypisanie nowej tablicy do skopiowanej kolumny
        newColumns[colIndex] = {
          ...newColumns[colIndex],
          blocks: newBlocks,
        };
      }
      return { ...prev, columns: newColumns };
    });
  };

  const moveBlock = (
    colIndex: number,
    blockIndex: number,
    direction: "up" | "down"
  ) => {
    setSettings((prev) => {
      const newColumns = prev.columns ? [...prev.columns] : [];
      if (newColumns[colIndex]) {
        const newBlocks = [...newColumns[colIndex].blocks];

        if (direction === "up" && blockIndex > 0) {
          [newBlocks[blockIndex], newBlocks[blockIndex - 1]] = [
            newBlocks[blockIndex - 1],
            newBlocks[blockIndex],
          ];
        } else if (direction === "down" && blockIndex < newBlocks.length - 1) {
          [newBlocks[blockIndex], newBlocks[blockIndex + 1]] = [
            newBlocks[blockIndex + 1],
            newBlocks[blockIndex],
          ];
        }

        newColumns[colIndex] = {
          ...newColumns[colIndex],
          blocks: newBlocks,
        };
      }
      return { ...prev, columns: newColumns };
    });
  };

  const openEditModal = (
    colIndex: number,
    blockIndex: number,
    block: FooterBlock
  ) => {
    setEditingBlock({
      colIndex,
      blockIndex,
      block: JSON.parse(JSON.stringify(block)),
    });
  };

  const saveBlockChanges = () => {
    if (!editingBlock) return;
    setSettings((prev) => {
      const newColumns = prev.columns ? [...prev.columns] : [];
      if (newColumns[editingBlock.colIndex]) {
        const newBlocks = [...newColumns[editingBlock.colIndex].blocks];
        newBlocks[editingBlock.blockIndex] = editingBlock.block;

        newColumns[editingBlock.colIndex] = {
          ...newColumns[editingBlock.colIndex],
          blocks: newBlocks,
        };
      }
      return { ...prev, columns: newColumns };
    });
    setEditingBlock(null);
  };

  // --- Helpers for Modal Content ---

  const addLinkToBlock = () => {
    if (!editingBlock) return;
    const newLink: FooterLink = { label: "Nowy link", url: "/" };
    const newBlock = { ...editingBlock.block };
    if (!newBlock.data.links) newBlock.data.links = [];

    // Kopia tablicy linków
    newBlock.data = {
      ...newBlock.data,
      links: [...newBlock.data.links, newLink],
    };

    setEditingBlock({ ...editingBlock, block: newBlock });
  };

  const updateLink = (idx: number, field: keyof FooterLink, value: string) => {
    if (!editingBlock) return;
    const newBlock = { ...editingBlock.block };
    if (newBlock.data.links) {
      const newLinks = [...newBlock.data.links];
      newLinks[idx] = { ...newLinks[idx], [field]: value };
      newBlock.data = { ...newBlock.data, links: newLinks };
    }
    setEditingBlock({ ...editingBlock, block: newBlock });
  };

  const removeLink = (idx: number) => {
    if (!editingBlock) return;
    const newBlock = { ...editingBlock.block };
    if (newBlock.data.links) {
      const newLinks = [...newBlock.data.links];
      newLinks.splice(idx, 1);
      newBlock.data = { ...newBlock.data, links: newLinks };
    }
    setEditingBlock({ ...editingBlock, block: newBlock });
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8 items-start pb-20">
      <main>
        <h1 className="text-2xl font-bold mb-6">Edycja Stopki</h1>

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

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <label className="block text-sm font-medium mb-2">
            Liczba kolumn (1-5)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => handleColumnsCountChange(num)}
                className={`px-4 py-2 rounded border ${
                  settings.columns_count === num
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* --- GRID KOLUMN --- */}
        <div
          className={`grid gap-4 ${
            settings.columns_count === 1
              ? "grid-cols-1"
              : settings.columns_count === 2
              ? "grid-cols-2"
              : settings.columns_count === 3
              ? "grid-cols-3"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {settings.columns
            ?.slice(0, settings.columns_count)
            .map((col, colIndex) => (
              <div
                key={col.id}
                className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[300px] flex flex-col"
              >
                <h3 className="font-bold text-gray-500 mb-4 text-center uppercase text-xs tracking-wider">
                  Kolumna {colIndex + 1}
                </h3>

                <div className="space-y-3 flex-grow">
                  {col.blocks.map((block, blockIndex) => (
                    <div
                      key={block.id}
                      className="bg-white p-3 rounded shadow-sm border border-gray-200 group relative"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold uppercase text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {block.type}
                        </span>
                        <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              moveBlock(colIndex, blockIndex, "up")
                            }
                            disabled={blockIndex === 0}
                            className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() =>
                              moveBlock(colIndex, blockIndex, "down")
                            }
                            disabled={blockIndex === col.blocks.length - 1}
                            className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            onClick={() => removeBlock(colIndex, blockIndex)}
                            className="p-1 hover:bg-red-100 rounded text-red-500"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="font-medium text-sm truncate">
                        {block.title || "Bez tytułu"}
                      </div>
                      {block.type !== "admin" && (
                        <button
                          onClick={() =>
                            openEditModal(colIndex, blockIndex, block)
                          }
                          className="mt-2 w-full flex items-center justify-center gap-1 text-xs border py-1 rounded hover:bg-gray-50 text-gray-600"
                        >
                          <Edit size={12} /> Edytuj zawartość
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-center text-gray-400 mb-2">
                    Dodaj blok
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addBlock(colIndex, "text")}
                      className="text-xs bg-white border hover:bg-gray-50 py-1 px-2 rounded"
                    >
                      Treść
                    </button>
                    <button
                      onClick={() => addBlock(colIndex, "links")}
                      className="text-xs bg-white border hover:bg-gray-50 py-1 px-2 rounded"
                    >
                      Linki
                    </button>
                    <button
                      onClick={() => addBlock(colIndex, "contact")}
                      className="text-xs bg-white border hover:bg-gray-50 py-1 px-2 rounded"
                    >
                      Kontakt
                    </button>
                    <button
                      onClick={() => addBlock(colIndex, "admin")}
                      className="text-xs bg-white border hover:bg-gray-50 py-1 px-2 rounded"
                    >
                      Admin
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
            onClick={() => setCancelModalOpen(true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Anuluj
          </button>
        </div>
      </aside>

      {/* --- MODAL EDYCJI BLOKU --- */}
      {editingBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg">
                Edytuj Blok: {editingBlock.block.type}
              </h3>
              <button
                onClick={() => setEditingBlock(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tytuł bloku
                </label>
                <input
                  type="text"
                  value={editingBlock.block.title || ""}
                  onChange={(e) =>
                    setEditingBlock({
                      ...editingBlock,
                      block: { ...editingBlock.block, title: e.target.value },
                    })
                  }
                  className="w-full border rounded p-2"
                />
              </div>

              {/* WARUNKOWE POLA ZALEŻNIE OD TYPU */}

              {editingBlock.block.type === "text" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Treść
                  </label>
                  <textarea
                    rows={6}
                    value={editingBlock.block.data.content || ""}
                    onChange={(e) =>
                      setEditingBlock({
                        ...editingBlock,
                        block: {
                          ...editingBlock.block,
                          data: {
                            ...editingBlock.block.data,
                            content: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full border rounded p-2 font-mono text-sm"
                    placeholder="Wpisz tekst tutaj..."
                  />
                </div>
              )}

              {editingBlock.block.type === "contact" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Adres (może być wieloliniowy)
                    </label>
                    <textarea
                      rows={3}
                      value={editingBlock.block.data.address || ""}
                      onChange={(e) =>
                        setEditingBlock({
                          ...editingBlock,
                          block: {
                            ...editingBlock.block,
                            data: {
                              ...editingBlock.block.data,
                              address: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Telefon
                    </label>
                    <input
                      type="text"
                      value={editingBlock.block.data.phone || ""}
                      onChange={(e) =>
                        setEditingBlock({
                          ...editingBlock,
                          block: {
                            ...editingBlock.block,
                            data: {
                              ...editingBlock.block.data,
                              phone: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editingBlock.block.data.email || ""}
                      onChange={(e) =>
                        setEditingBlock({
                          ...editingBlock,
                          block: {
                            ...editingBlock.block,
                            data: {
                              ...editingBlock.block.data,
                              email: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full border rounded p-2"
                    />
                  </div>
                </>
              )}

              {editingBlock.block.type === "links" && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">
                      Lista linków
                    </label>
                    <button
                      onClick={addLinkToBlock}
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded"
                    >
                      + Dodaj link
                    </button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {editingBlock.block.data.links?.map((link, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col gap-2 bg-gray-50 p-3 rounded border relative"
                      >
                        <button
                          onClick={() => removeLink(idx)}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                        >
                          <Trash size={14} />
                        </button>
                        <div className="flex gap-2 pr-6">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) =>
                              updateLink(idx, "label", e.target.value)
                            }
                            placeholder="Nazwa linku"
                            className="flex-1 border rounded p-1 text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) =>
                              updateLink(idx, "url", e.target.value)
                            }
                            placeholder="URL (/strona lub https://)"
                            className="flex-1 border rounded p-1 text-sm"
                          />
                          <select
                            value={link.icon || ""}
                            onChange={(e) =>
                              updateLink(idx, "icon", e.target.value)
                            }
                            className="w-1/3 border rounded p-1 text-sm"
                          >
                            <option value="">Brak ikony</option>
                            {AVAILABLE_ICONS.map((ic) => (
                              <option key={ic} value={ic}>
                                {ic}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                    {(!editingBlock.block.data.links ||
                      editingBlock.block.data.links.length === 0) && (
                      <p className="text-gray-400 text-sm text-center">
                        Brak linków.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setEditingBlock(null)}
                className="px-4 py-2 border rounded text-gray-700 bg-white hover:bg-gray-100"
              >
                Anuluj
              </button>
              <button
                onClick={saveBlockChanges}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Zatwierdź zmiany
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        title="Potwierdzenie anulowania"
        message="Czy na pewno chcesz anulować? Niezapisane zmiany zostaną utracone."
        onConfirm={() => {
          navigate("/admin/dashboard");
          setCancelModalOpen(false);
        }}
        onCancel={() => setCancelModalOpen(false)}
        confirmText="Tak, anuluj"
        cancelText="Nie, kontynuuj edycję"
      />
    </div>
  );
};

export default AdminFooterForm;
