import React, { useState, useEffect } from 'react';
import { SocialLink, SocialPlatform } from '../../../lib/types';
import { pb } from '../../../services/pocketbase';
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
    Facebook, Instagram, Youtube, Linkedin, Twitter, Link as LinkIcon, 
    Plus, Trash2, GripVertical, AlertCircle, Search
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import IconPicker from '../../IconPicker';
import DynamicIcon from '../../DynamicIcon';

// Note: Lucide might not have 'X' icon exported directly as 'X', usually it's 'Twitter' or 'X' depending on version.
// We can check or just fallback to Twitter icon if X is missing in Lucide keys, or use 'Twitter' visual for 'X' platform if needed.
// But mostly we assume 'Twitter' icon maps to the old bird, and we want X. 
// If generic Icon component is used with string "X", it needs to exist in Lucide. 
// If not, we might need to use a custom SVG or alias. 
// For now, let's assume 'Twitter' icon for X if 'X' doesn't exist, or let user pick.

const availablePlatforms: { id: SocialPlatform; label: string }[] = [
    { id: 'Facebook', label: 'Facebook' },
    { id: 'Instagram', label: 'Instagram' },
    { id: 'YouTube', label: 'YouTube' },
    { id: 'TikTok', label: 'TikTok' }, 
    { id: 'X', label: 'X (Twitter)' },
    { id: 'LinkedIn', label: 'LinkedIn' },
    { id: 'Custom', label: 'Własny' },
];

interface SortableItemProps {
    link: SocialLink;
    onDelete: (id: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ link, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: link.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className="flex items-center p-3 bg-white border rounded shadow-sm hover:shadow group mb-2"
        >
            <div {...attributes} {...listeners} className="mr-3 text-gray-400 hover:text-gray-600 cursor-grab touch-none">
                <GripVertical size={20} />
            </div>
            <div className="p-2 bg-gray-100 rounded-full mr-3 text-gray-600">
                <DynamicIcon name={link.icon} size={20} />
            </div>
            <div className="flex-1">
                <div className="font-medium text-gray-800">
                    {link.platform === 'Custom' ? link.custom_label : link.platform}
                </div>
                <div className="text-xs text-gray-500 truncate max-w-[300px]">
                    {link.url}
                </div>
            </div>
            <button 
                onClick={() => onDelete(link.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
};

export const SocialMediaManager: React.FC = () => {
    const [links, setLinks] = useState<SocialLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [url, setUrl] = useState('');
    const [platform, setPlatform] = useState<SocialPlatform>('Facebook');
    const [customLabel, setCustomLabel] = useState('');
    const [customIcon, setCustomIcon] = useState('Link'); // Default icon name
    
    // Icon Picker state
    const [iconPickerOpen, setIconPickerOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            setLoading(true);
            const records = await pb.collection('social_links').getFullList<SocialLink>({
                sort: 'order',
                requestKey: null,
            });
            setLinks(records);
            setError(null);
        } catch (err: any) {
             if (err.name !== 'AbortError' && !err.isAbort) {
                console.error("Error fetching social links:", err);
                if (err.status === 404) {
                     setError("Kolekcja 'social_links' nie istnieje. Kliknij poniżej, aby spróbować ją utworzyć (wymaga uprawnień administratora).");
                } else if (err.status === 403) {
                     setError("Brak uprawnień do pobrania linków (403). Sprawdź API Rules w PocketBase.");
                } else {
                     setError("Nie udało się pobrać linków.");
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!url) return;
        setProcessing(true);
        try {
            const maxOrder = links.length > 0 ? Math.max(...links.map(l => l.order)) : 0;
            
            // Determine icon
            let iconName = customIcon;
            if (platform === 'Facebook') iconName = 'Facebook';
            else if (platform === 'Instagram') iconName = 'Instagram';
            else if (platform === 'YouTube') iconName = 'Youtube';
            else if (platform === 'TikTok') iconName = 'Video'; // Generic video for TikTok usually or 'Music2'
            else if (platform === 'X') iconName = 'Twitter'; // Map X to Twitter icon for now, unless user selects custom
            else if (platform === 'LinkedIn') iconName = 'Linkedin';
            
            // If user explicitly selected an icon for Custom, use it.
            // For standard platforms, we used defaults above, BUT if we want to allow overriding:
            // The logic above forces standard icons.
            // Let's rely on 'customIcon' ONLY if platform is Custom, OR if we want to allow icon override.
            // The user request implies they want to pick the icon via menu.
            // Let's allow picking icon for ANY platform if the user deviates from default?
            // Actually, simplest is:
            // If platform is custom, use customIcon.
            // If platform is standard, use standard mapping (or maybe let them pick if they want?).
            // For now, adhere to: Custom -> uses picker value. Standard -> uses strict mapping.
            // However, user said "Twitter/X jako X" and "wybieranie ikony powinno być po przez użycie menu wyboru".
            // If I map X to Twitter icon automatically, it might be wrong if they want a specific 'X' icon.
            // So for X, maybe default to Twitter, but enable picker?
            // Let's enable picker for Custom platform as requested.
            
            const data = {
                platform,
                url,
                icon: platform === 'Custom' ? customIcon : iconName,
                order: maxOrder + 1,
                is_active: true,
                custom_label: platform === 'Custom' ? customLabel : undefined
            };

            await pb.collection('social_links').create(data);
            await fetchLinks();
            
            // Reset form
            setUrl('');
            setCustomLabel('');
            setPlatform('Facebook');
            setCustomIcon('Link');
        } catch (err) {
            console.error("Error adding link:", err);
            alert("Błąd podczas dodawania.");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Czy na pewno usunąć?")) return;
        try {
            await pb.collection('social_links').delete(id);
            setLinks(links.filter(l => l.id !== id));
        } catch (err) {
            alert("Błąd usuwania.");
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (active.id !== over?.id) {
            setLinks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                
                const newItems = arrayMove<SocialLink>(items, oldIndex, newIndex);
                saveOrder(newItems);
                return newItems;
            });
        }
    };
    
    const saveOrder = async (items: SocialLink[]) => {
         try {
            await Promise.all(items.map((item, index) => 
                pb.collection('social_links').update(item.id, { order: index })
            ));
        } catch (err) {
            console.error("Error updating order:", err);
        }
    };
    
    const createCollection = async () => {
        alert("Funkcja automatycznego tworzenia kolekcji wymaga zalogowania jako super-admin i użycia API administracyjnego, które może nie być dostępne w tym kontekście. Proszę utworzyć kolekcję 'social_links' ręcznie w panelu PocketBase.");
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
                <LucideIcons.Share2 size={24} className="text-school-primary"/>
                Media Społecznościowe
            </h2>

            {error ? (
                <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200 mb-4">
                    <p className="flex items-center gap-2"><AlertCircle size={18}/> {error}</p>
                    <button onClick={createCollection} className="mt-2 text-sm underline hover:text-red-900">
                        Instrukcja tworzenia kolekcji
                    </button>
                </div>
            ) : null}

            <div className="mb-6 bg-gray-50 p-4 rounded border border-gray-200">
                <h3 className="font-medium mb-3 text-sm text-gray-700">Dodaj nowy link</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-3">
                        <label className="block text-xs uppercase text-gray-500 mb-1">Platforma</label>
                        <div className="relative">
                            <select 
                                value={platform}
                                onChange={e => setPlatform(e.target.value as SocialPlatform)}
                                className="w-full p-2 border rounded appearance-none"
                            >
                                {availablePlatforms.map(p => (
                                    <option key={p.id} value={p.id}>{p.label}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-4">
                         <label className="block text-xs uppercase text-gray-500 mb-1">Link URL</label>
                         <input 
                            type="url" 
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full p-2 border rounded"
                         />
                    </div>
                    
                    {platform === 'Custom' && (
                        <div className="md:col-span-3">
                             <label className="block text-xs uppercase text-gray-500 mb-1">Etykieta</label>
                             <input 
                                type="text"
                                value={customLabel}
                                onChange={e => setCustomLabel(e.target.value)}
                                placeholder="Np. Blog"
                                className="w-full p-2 border rounded"
                             />
                        </div>
                    )}

                    <div className="md:col-span-2">
                        <button 
                            onClick={handleAdd}
                            disabled={processing || !url || (platform === 'Custom' && !customLabel)}
                            className="w-full bg-school-primary text-white p-2 rounded hover:brightness-110 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {processing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Plus size={18} />}
                            Dodaj
                        </button>
                    </div>
                </div>
                
                {/* Icon Selection for Custom Platform */}
                {platform === 'Custom' && (
                     <div className="mt-3">
                         <label className="block text-xs uppercase text-gray-500 mb-1">Ikona</label>
                         <div className="flex items-center gap-2">
                             <button
                                 onClick={() => setIconPickerOpen(true)}
                                 className="flex items-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-50 transition-colors"
                             >
                                 <DynamicIcon name={customIcon} size={18} />
                                 <span className="text-sm font-medium">{customIcon}</span>
                                 <Search size={14} className="text-gray-400 ml-1" />
                             </button>
                             <span className="text-xs text-gray-500">Kliknij aby zmienić</span>
                         </div>
                     </div>
                )}
            </div>

            <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext 
                    items={links.map(l => l.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {links.map((link) => (
                            <SortableItem key={link.id} link={link} onDelete={handleDelete} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
            
            {links.length === 0 && !loading && !error && (
                <div className="text-center py-8 text-gray-500 italic">
                    Brak linków. Dodaj pierwszy powyżej.
                </div>
            )}
            
            {iconPickerOpen && (
                <IconPicker 
                    onSelect={(iconName) => {
                        setCustomIcon(iconName);
                        setIconPickerOpen(false);
                    }}
                    onClose={() => setIconPickerOpen(false)}
                    selectedIcon={customIcon}
                />
            )}
        </div>
    );
};
