
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NavItem } from '../../../lib/types';
import { ChevronDown, ChevronRight, GripVertical, Trash, ExternalLink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MenuItemProps {
  id: string;
  item: NavItem;
  onUpdate: (id: string, data: Partial<NavItem>) => void;
  onRemove: (id: string) => void;
  children?: React.ReactNode;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  id,
  item,
  onUpdate,
  onRemove,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    onUpdate(id, {
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "mb-2 bg-white border border-gray-200 rounded shadow-sm group",
        isDragging && "opacity-50 z-50 ring-2 ring-indigo-500",
        // Visual indicator for container that accepts children?
      )}
    >
      <div className="flex items-center p-3 bg-gray-50 rounded-t">
        <div {...attributes} {...listeners} className="cursor-grab mr-2 text-gray-400 hover:text-gray-700">
          <GripVertical size={20} />
        </div>
        
        <div className="flex-grow font-medium text-gray-700 truncate select-none">
          {item.name}
          {item.is_external && <ExternalLink size={12} className="inline ml-1 text-gray-400" />}
        </div>

        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase font-mono px-2 py-0.5 bg-gray-100 rounded border border-gray-200">
                {item.href.startsWith('http') ? 'Link' : 'Strona'}
            </span>
            <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-gray-500 hover:bg-gray-200 rounded"
            >
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            <button
            onClick={() => onRemove(id)}
            className="p-1 text-red-500 hover:bg-red-50 rounded ml-1"
            >
            <Trash size={18} />
            </button>
        </div>
      </div>

      <div className={cn("border-t border-gray-100 bg-white rounded-b", (!isOpen && !item.has_dropdown) && "hidden")}>
          {/* Edit Form */}
          {isOpen && (
            <div className="p-4 space-y-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Etykieta nawigacji</label>
                    <input
                        type="text"
                        name="name"
                        value={item.name}
                        onChange={handleChange}
                        className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Adres URL</label>
                    <input
                        type="text"
                        name="href"
                        value={item.href}
                        onChange={handleChange}
                        className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div className="flex gap-4 pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="is_highlight"
                            checked={item.is_highlight || false}
                            onChange={handleChange}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Wyróżniony (Przycisk)</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="has_dropdown"
                            checked={item.has_dropdown || false}
                            onChange={handleChange}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Mega Menu (Zagnieżdżanie)</span>
                    </label>
                </div>
            </div>
          )}

          {/* Children Container - Visible if has_dropdown is true */}
          {children}
      </div>
    </div>
  );
};
