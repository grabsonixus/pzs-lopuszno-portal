import React, { useState, useEffect } from 'react';
import { pb } from '../services/pocketbase';
import { NavItem } from '../types';

interface AdminNavigationFormProps {
  item: Partial<NavItem> | null;
  onSave: () => void;
  onCancel: () => void;
  navItems: NavItem[];
}

import URLInput from './URLInput';

// ... (reszta importów)

// ... (interfejs AdminNavigationFormProps)

const AdminNavigationForm: React.FC<AdminNavigationFormProps> = ({ item, onSave, onCancel, navItems }) => {
  const [formData, setFormData] = useState<Partial<NavItem>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(item || { order: 0, name: '', href: '/', is_highlight: false, is_external: false, has_dropdown: false });
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, href: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        order: Number(String(formData.order).replace(',', '.')),
        is_external: formData.href?.startsWith('http'),
      };

      if (formData.id) {
        await pb.collection('navigation_items').update(formData.id, dataToSave);
      } else {
        await pb.collection('navigation_items').create(dataToSave);
      }
      onSave();
    } catch (error) {
      console.error('Error saving navigation item:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{formData.id ? 'Edytuj pozycję' : 'Dodaj nową pozycję'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nazwa</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kolejność</label>
              <input 
                type="text" 
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                name="order" 
                value={formData.order || 0} 
                onChange={handleChange} 
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
            </div>
          </div>
          <div>
            <URLInput key={item.id || 'new'} value={formData.href || ''} onChange={handleUrlChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rodzic</label>
            <select name="parent_id" value={formData.parent_id || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
              <option value="">Brak (pozycja główna)</option>
              {navItems.filter(i => i.id !== formData.id && !i.parent_id).map(parent => (
                <option key={parent.id} value={parent.id}>{parent.name}</option>
              ))}
            </select>
          </div>
          {/* Checkboxy pozostają bez zmian */}
          <div className="flex items-center">
            <input type="checkbox" name="has_dropdown" checked={formData.has_dropdown || false} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
            <label className="ml-2 block text-sm text-gray-900">Ma menu rozwijane</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="is_highlight" checked={formData.is_highlight || false} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
            <label className="ml-2 block text-sm text-gray-900">Wyróżniony przycisk</label>
          </div>
          <p className="text-sm text-gray-500">
            Pole "Link zewnętrzny" zostanie ustawione automatycznie, jeśli URL zaczyna się od "http".
          </p>
          <div className="flex justify-end gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => {
                if (window.confirm('Czy na pewno chcesz anulować? Niezapisane zmiany zostaną utracone.')) {
                  onCancel();
                }
              }} 
              className="px-4 py-2 border rounded-md text-sm font-medium"
            >
              Anuluj
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              {loading ? 'Zapisywanie...' : 'Zapisz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminNavigationForm;

