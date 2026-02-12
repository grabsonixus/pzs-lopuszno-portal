
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, GripVertical, Plus } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';

interface SubpageItem {
  id: string;
  title: string;
  slug: string;
}

interface NavigationSourceProps {
  pages: SubpageItem[];
}

const DraggableSourceItem: React.FC<{ id: string; title: string, type: 'page' | 'custom', data?: any }> = ({ id, title, type, data }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
        data: {
             type: 'source',
             sourceType: type,
             title,
             ...data
        }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999
    } : undefined;

    return (
        <div 
            ref={setNodeRef} 
            {...listeners} 
            {...attributes}
            style={style}
            className="flex items-center p-2 bg-white border border-gray-200 rounded shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing mb-2"
        >
            <GripVertical size={16} className="text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 truncate">{title}</span>
            <Plus size={16} className="ml-auto text-gray-300" />
        </div>
    );
};

export const NavigationSource: React.FC<NavigationSourceProps> = ({ 
    pages
}) => {
  const [activeTab, setActiveTab] = useState<string | null>('pages');
  const [pageSearch, setPageSearch] = useState('');

  // Custom link state
  const [customLabel, setCustomLabel] = useState('');
  const [customUrl, setCustomUrl] = useState('http://');

  const toggleTab = (tab: string) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const filteredPages = pages.filter(p => 
    p.title.toLowerCase().includes(pageSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Pages Section */}
      <div className="bg-white border rounded shadow-sm select-none">
        <button 
          onClick={() => toggleTab('pages')}
          className="w-full flex items-center justify-between p-3 bg-gray-50 text-gray-700 font-medium hover:bg-gray-100"
        >
          <span>Podstrony</span>
          {activeTab === 'pages' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {activeTab === 'pages' && (
          <div className="p-4 border-t border-gray-100">
             <input 
                type="text" 
                placeholder="Szukaj..." 
                className="w-full mb-3 px-2 py-1 text-sm border rounded"
                value={pageSearch}
                onChange={e => setPageSearch(e.target.value)}
             />
             <div className="max-h-60 overflow-y-auto overflow-x-hidden p-1">
                {filteredPages.map(page => (
                    <DraggableSourceItem 
                        key={page.id} 
                        id={`source_page_${page.id}`} 
                        title={page.title} 
                        type="page"
                        data={{ slug: page.slug }}
                    />
                ))}
                {filteredPages.length === 0 && <span className="text-xs text-gray-400">Brak wyników</span>}
             </div>
          </div>
        )}
      </div>

      {/* Custom Link Section */}
      <div className="bg-white border rounded shadow-sm">
        <button 
          onClick={() => toggleTab('custom')}
          className="w-full flex items-center justify-between p-3 bg-gray-50 text-gray-700 font-medium hover:bg-gray-100"
        >
          <span>Własny link</span>
          {activeTab === 'custom' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {activeTab === 'custom' && (
          <div className="p-4 border-t border-gray-100 space-y-3">
             <div>
                <label className="block text-xs text-gray-500 mb-1">Adres URL</label>
                <input 
                    type="text" 
                    className="w-full text-sm border rounded px-2 py-1"
                    value={customUrl}
                    onChange={e => setCustomUrl(e.target.value)}
                    placeholder="https://"
                />
             </div>
             <div>
                <label className="block text-xs text-gray-500 mb-1">Tekst odnośnika</label>
                <input 
                    type="text" 
                    className="w-full text-sm border rounded px-2 py-1"
                    value={customLabel}
                    onChange={e => setCustomLabel(e.target.value)}
                    placeholder="np. Onet"
                />
             </div>
             
             {customLabel && customUrl && (
                 <div className="pt-2 border-t border-dashed">
                     <p className="text-xs text-gray-400 mb-2">Przeciągnij poniższy element:</p>
                     <DraggableSourceItem 
                        id="source_custom_link" 
                        title={customLabel} 
                        type="custom" 
                        data={{ url: customUrl }} 
                     />
                 </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
