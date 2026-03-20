import React, { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';

interface FileSelectModalProps {
  isOpen: boolean;
  title: string;
  files: string[];
  fileNames?: Record<string, string>;
  defaultLabel?: string;
  onConfirm: (fileName: string, label: string) => void;
  onCancel: () => void;
}

const FileSelectModal: React.FC<FileSelectModalProps> = ({
  isOpen,
  title,
  files,
  fileNames,
  defaultLabel,
  onConfirm,
  onCancel,
}) => {
  const [selectedFile, setSelectedFile] = useState('');
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (files.length > 0) {
        setSelectedFile(files[0]);
        // Jeśli mamy przekazany defaultLabel z zaznaczenia tekstu, użyj go, w przeciwnym razie użyj nazwy pliku
        setLabel(defaultLabel && defaultLabel.trim() !== '' ? defaultLabel : (fileNames?.[files[0]] || files[0]));
      } else {
        setSelectedFile('');
        setLabel('');
      }
    }
  }, [isOpen, files, fileNames, defaultLabel]);

  const handleFileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newFile = e.target.value;
      setSelectedFile(newFile);
      setLabel(fileNames?.[newFile] || newFile);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && label.trim()) {
        onConfirm(selectedFile, label);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[99999] animate-fade-in"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 animate-scale-in flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        {files.length === 0 ? (
            <div className="text-center py-6 text-gray-500 flex flex-col items-center">
                <FileText className="mx-auto mb-2 opacity-50" size={32} />
                <p>Brak wgranych plików do wstawienia.</p>
                <p className="text-sm mt-1">Najpierw musisz dodać i zapisać pliki, aby móc z nich skorzystać.</p>
                <button type="button" onClick={onCancel} className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
                    Zamknij
                </button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="w-full">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Wybierz plik
                    </label>
                    <select
                        value={selectedFile}
                        onChange={handleFileChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    >
                        {files.map(f => (
                            <option key={f} value={f}>
                                {fileNames?.[f] || f}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tekst do wyświetlenia
                    </label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        autoFocus
                        required
                    />
                </div>
              
              <div className="flex w-full justify-end gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || !label.trim()}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Wstaw
                </button>
              </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default FileSelectModal;
