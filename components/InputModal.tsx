import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface InputModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  inputPlaceholder?: string;
}

const InputModal: React.FC<InputModalProps> = ({
  isOpen,
  title,
  message,
  defaultValue = '',
  onConfirm,
  onCancel,
  confirmText = 'Zatwierdź',
  cancelText = 'Anuluj',
  inputPlaceholder = '',
}) => {
  const [value, setValue] = useState(defaultValue);

  // Zresetuj wartość przy otwarciu (zmiana defaultValue lub isOpen)
  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue || '');
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(value);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm m-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        {message && <p className="text-gray-600 mb-4">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={inputPlaceholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
          
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputModal;
