import React, { useState, useEffect } from "react";
import { pb } from "../services/pocketbase";
import { Subpage } from "../lib/types";

interface URLInputProps {
  value: string;
  onChange: (value: string) => void;
}

const URLInput: React.FC<URLInputProps> = ({ value, onChange }) => {
  const [urlType, setUrlType] = useState<"subpage" | "custom">(() =>
    value && value.startsWith("/p/") ? "subpage" : "custom"
  );
  const [subpages, setSubpages] = useState<Subpage[]>([]);

  useEffect(() => {
    const fetchSubpages = async () => {
      try {
        const result = await pb.collection("subpages").getFullList<Subpage>();
        setSubpages(result);
      } catch (error: any) {
        const isAbort =
          error?.isAbort ||
          error?.name === "AbortError" ||
          /autocancelled/i.test(String(error?.message || ""));

        if (!isAbort) {
          console.error("Error fetching subpages:", error);
        }
      }
    };
    fetchSubpages();
  }, []);

  const handleUrlTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlType(e.target.value as "subpage" | "custom");
    onChange(""); // Resetuj wartość przy zmianie typu
  };

  const handleSubpageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        URL (href)
      </label>
      <div className="mt-2 space-y-2">
        <div className="flex items-center">
          <input
            id="url-type-subpage"
            name="url-type"
            type="radio"
            value="subpage"
            checked={urlType === "subpage"}
            onChange={handleUrlTypeChange}
            className="h-4 w-4 text-indigo-600 border-gray-300"
          />
          <label
            htmlFor="url-type-subpage"
            className="ml-3 block text-sm font-medium text-gray-700"
          >
            Wybierz podstronę
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="url-type-custom"
            name="url-type"
            type="radio"
            value="custom"
            checked={urlType === "custom"}
            onChange={handleUrlTypeChange}
            className="h-4 w-4 text-indigo-600 border-gray-300"
          />
          <label
            htmlFor="url-type-custom"
            className="ml-3 block text-sm font-medium text-gray-700"
          >
            Własny URL
          </label>
        </div>
      </div>

      <div className="mt-2">
        {urlType === "subpage" ? (
          <select
            value={value}
            onChange={handleSubpageChange}
            className="block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="">-- Wybierz podstronę --</option>
            {subpages.map((subpage) => (
              <option key={subpage.id} value={`/p/${subpage.slug}`}>
                {subpage.title}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={value}
            onChange={handleCustomUrlChange}
            className="block w-full border-gray-300 rounded-md shadow-sm"
            placeholder="np. /kontakt, https://example.com"
          />
        )}
      </div>
    </div>
  );
};

export default URLInput;
