import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { MenuItem } from './MenuItem';
import { NavItem } from '../../../lib/types';

export interface TreeItem extends NavItem {
    children: TreeItem[];
    depth: number;
}

interface MenuBuilderProps {
  items: TreeItem[];
  onUpdateItem: (id: string, data: Partial<NavItem>) => void;
  onRemoveItem: (id: string) => void;
  parentId?: string; // To know which container ID is this
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MenuBuilder: React.FC<MenuBuilderProps> = ({
  items,
  onUpdateItem,
  onRemoveItem,
  parentId = 'root'
}) => {
  const { setNodeRef, isOver } = useDroppable({
      id: parentId
  });

  return (
      <SortableContext
        id={parentId} // Valid container ID
        items={items.map(i => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div 
            ref={setNodeRef}
            className={cn(
                "space-y-2 pb-2 transition-colors duration-200 rounded-lg",
                parentId === 'root' ? 'pb-20' : '',
                isOver && parentId !== 'root' ? "bg-indigo-50/50 border-2 border-dashed border-indigo-300" : ""
            )}
        >
          {items.map((item) => (
            <MenuItem
              key={item.id}
              id={item.id}
              item={item}
              onUpdate={onUpdateItem}
              onRemove={onRemoveItem}
            >
                {/* Recursively render children if present */}
                {item.has_dropdown && (
                    <div className={cn(
                        "mt-2 ml-4 p-2 bg-gray-50 border border-gray-200 rounded-md transition-colors",
                         // This div wraps the nested MenuBuilder, visual feedback handled inside MenuBuilder
                    )}>
                        <p className="text-xs text-gray-500 mb-2 uppercase font-semibold font-mono tracking-wider flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                             Podmenu (Upuść tutaj)
                        </p>
                        <MenuBuilder 
                            items={item.children} 
                            onUpdateItem={onUpdateItem} 
                            onRemoveItem={onRemoveItem}
                            parentId={`container_${item.id}`} // Unique Container ID
                        />
                    </div>
                )}
            </MenuItem>
          ))}
          
          {items.length === 0 && parentId === 'root' && (
              <div className={cn(
                  "text-center py-12 border-2 border-dashed rounded-xl transition-all",
                  isOver ? "border-indigo-400 bg-indigo-50 text-indigo-600" : "border-gray-300 text-gray-500 bg-gray-50",
              )}>
                  <p className="font-medium text-lg mb-1">Menu jest puste</p>
                  <p className="text-sm opacity-80">Przeciągnij elementy z lewego panelu, aby nbudować nawigację.</p>
              </div>
          )}

          {items.length === 0 && parentId !== 'root' && (
              <div className={cn(
                  "h-16 border-2 border-dashed rounded flex items-center justify-center text-xs font-medium transition-colors",
                  isOver ? "border-indigo-400 bg-indigo-50 text-indigo-600" : "border-gray-300 text-gray-400 bg-white"
              )}>
                  Upuść element tutaj
              </div>
          )}
        </div>
      </SortableContext>
  );
};
