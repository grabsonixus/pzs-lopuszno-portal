
import React, { useState, useMemo } from "react";
import * as Icons from "lucide-react";
// @ts-ignore
import { icons } from "lucide-react"; // Try extracting explicit 'icons' object
import { Search, X, Upload } from "lucide-react";
import DynamicIcon from "./DynamicIcon";

interface IconPickerProps {
  onSelect: (iconName: string) => void;
  selectedIcon?: string;
  onClose: () => void;
  onFileSelect?: (file: File) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({
  onSelect,
  selectedIcon,
  onClose,
  onFileSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const iconList = useMemo(() => {
    // Prefer the explicitly exported 'icons' object if available (newer Lucide versions)
    const source = icons || (Icons as any).icons || Icons;
    
    return Object.keys(source)
      .filter((key) => {
          // Must start with Uppercase letter (Component convention)
          if (!/^[A-Z]/.test(key)) return false;
          // Exclude internal exports explicitly
          if (key === "createLucideIcon" || key === "default" || key === "icons" || key === "Icon") return false;
          // Must be something we can likely render
          return true;
      })
      .filter((name) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onFileSelect) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h3 className="text-lg font-bold text-gray-800">Wybierz ikonę</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b flex gap-4 items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Szukaj ikony..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              autoFocus
            />
          </div>
          {onFileSelect && (
            <div className="relative">
              <input
                type="file"
                id="icon-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <label
                htmlFor="icon-upload"
                className="flex items-center gap-2 cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Upload size={18} />
                <span className="hidden sm:inline">Wgraj własną</span>
              </label>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {iconList.map((iconName) => (
              <button
                key={iconName}
                onClick={() => onSelect(iconName)}
                className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 ${
                  selectedIcon === iconName
                    ? "bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-300"
                    : "bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200"
                }`}
                title={iconName}
              >
                <div style={{ pointerEvents: 'none' }}>
                    <DynamicIcon name={iconName} size={24} />
                </div>
                <span className="text-[10px] truncate w-full text-center font-medium">
                  {iconName}
                </span>
              </button>
            ))}
            {iconList.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400">
                Nie znaleziono ikon pasujących do "{searchTerm}"
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 text-xs text-gray-500 flex justify-between rounded-b-xl">
          <span>Dostępnych ikon: {Object.keys(Icons).length}</span>
          <span>Wybrano: {selectedIcon || "Brak"}</span>
        </div>
      </div>
    </div>
  );
};

export default IconPicker;
