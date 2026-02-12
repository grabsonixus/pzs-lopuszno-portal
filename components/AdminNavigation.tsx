
import React, { useEffect, useState, useMemo } from "react";
import { pb } from "../services/pocketbase";
import { NavItem, Subpage } from "../lib/types";
import { Save, AlertCircle } from "lucide-react";
import { NavigationSource } from "./admin/navigation/NavigationSource";
import { MenuBuilder, TreeItem } from "./admin/navigation/MenuBuilder";
import { 
    DndContext, 
    DragEndEvent, 
    DragStartEvent, 
    useSensor, 
    useSensors, 
    PointerSensor, 
    KeyboardSensor,
    closestCenter,
    DragOverlay,
    Modifier,
    DragOverEvent
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { MenuItem } from "./admin/navigation/MenuItem";
import { createPortal } from "react-dom";

const AdminNavigation: React.FC = () => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [subpages, setSubpages] = useState<{id: string, title: string, slug: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<NavItem | null>(null); 

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    
    try {
      // 1. Pobierz podstrony (krytyczne dla Source)
      try {
        const pagesResult = await pb.collection("subpages").getFullList<Subpage>({ 
             sort: "title",
             fields: "id,title,slug" 
        });
        setSubpages(pagesResult.map(p => ({ id: p.id, title: p.title, slug: p.slug })));
      } catch (err) {
        console.error("Error fetching subpages:", err);
        // Nie blokujmy, może uda się chociaż menu pobrać
      }

      // 2. Pobierz menu
      try {
        const navResult = await pb.collection("navigation_items").getFullList<NavItem>({ sort: "order" });
        setNavItems(navResult);
      } catch (err: any) {
         // 404 means empty list usually in PocketBase if not found, but getFullList returns empty array.
         // Real error might be network or auth.
         console.error("Error fetching navigation:", err);
         if (err.status !== 404) {
             setError("Wystąpił problem z pobraniem menu.");
         }
      }

    } catch (error: any) {
      console.error("Global error:", error);
      setError("Wystąpił nieoczekiwany błąd.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = (id: string, data: Partial<NavItem>) => {
      setNavItems(items => items.map(item => item.id === id ? { ...item, ...data } : item));
  };

  const handleRemoveItem = (id: string) => {
      if(window.confirm("Czy na pewno chcesz usunąć ten element?")) {
         // Recursive remove? Or promote children? 
         // "Delete parent -> Delete children" seems safer for consistency
         const toDelete = new Set<string>([id]);
         const findChildren = (parentId: string) => {
             navItems.forEach(i => {
                 if (i.parent_id === parentId) {
                     toDelete.add(i.id);
                     findChildren(i.id);
                 }
             });
         };
         findChildren(id);
         setNavItems(items => items.filter(i => !toDelete.has(i.id)));
      }
  };

  // --- TREE HELPERS ---
  const buildTree = (items: NavItem[]): TreeItem[] => {
      const itemMap = new Map<string, TreeItem>();
      items.forEach(i => itemMap.set(i.id, { ...i, children: [], depth: 0 }));

      const roots: TreeItem[] = [];
      const sortedItems = [...items].sort((a,b) => (a.order||0) - (b.order||0));

      sortedItems.forEach(item => {
          const node = itemMap.get(item.id)!;
          if (item.parent_id && itemMap.has(item.parent_id)) {
              const parent = itemMap.get(item.parent_id)!;
              node.depth = parent.depth + 1;
              parent.children.push(node);
          } else {
              roots.push(node);
          }
      });
      return roots;
  };

  const treeItems = useMemo(() => buildTree(navItems), [navItems]);

  // --- DND HANDLERS ---

  const handleDragStart = (event: DragStartEvent) => {
      setActiveId(event.active.id as string);
      
      const found = navItems.find(i => i.id === event.active.id);
      if (found) {
          setActiveItem(found);
      } else {
          // Source item
          const { title } = event.active.data.current || {};
          setActiveItem({
              id: 'temp',
              name: title || 'New Item',
              href: '#',
              order: 999,
              is_highlight: false,
              is_external: false
          } as NavItem);
      }
  };

  const handleDragOver = (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      // Note: We don't need complex dragOver logic for sorting within same container, dnd-kit handles it.
      // But moving between containers requires updating parent_id potentially?
      // Actually we prefer doing it on DragEnd to avoid flickering.
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveItem(null);

    if (!over) return;

    // 1. Identify Target Container
    // Over can be:
    // - Another Item ID
    // - "root" (the main container)
    // - "container_{id}" (a specific DropPlaceholder inside an item)
    
    let targetParentId: string | undefined = undefined;
    
    // Check if we dropped on a SortableContext ID or an Item ID
    const overId = over.id as string;
    
    // Map of item ID to its parent ID (helper)
    const itemParentMap = new Map<string, string | undefined>();
    navItems.forEach(i => itemParentMap.set(i.id, i.parent_id));

    // Determine intended Parent
    if (overId === 'root') {
        targetParentId = undefined;
    } else if (overId.startsWith('container_')) {
        targetParentId = overId.replace('container_', '');
    } else {
        // Dropped ON an item. Usually means "same container as this item".
        // UNLESS the item we dropped on is empty and we want to nest?
        // But we have explicit "container_" drop zones now.
        // So dropping on "Item X" implies becoming a sibling of Item X.
        targetParentId = itemParentMap.get(overId);
    }
    
    // --- HANDLE NEW ITEM ---
    const isSource = active.data.current?.type === 'source';
    if (isSource) {
         const sourceData = active.data.current;
         let href = '/';
         let name = sourceData?.title || 'Menu Item';
         
         if (sourceData?.sourceType === 'page') href = `/p/${sourceData.slug}`;
         else if (sourceData?.sourceType === 'custom') { href = sourceData.url; name = sourceData.title; }

         const newItem: NavItem = {
            id: `temp_${Date.now()}`,
            name: name,
            href: href,
            order: 9999, // Append to end initially
            parent_id: targetParentId,
            is_highlight: false,
            is_external: href.startsWith('http'),
            has_dropdown: false
        };
        
        // We need to insert it at correct index?
        // For simplicity: Add to end of that container.
        // Or if we dropped on an item, insert next to it.
        
        let newItems = [...navItems, newItem];
        if (overId !== 'root' && !overId.startsWith('container_')) {
             // Dropped relative to an item
             // We need to arrayMove it to correct visual position?
             // Since we just added it, it's at the end.
             // But sorting logic is separate.
             // Let's just Add and Save. PocketBase will fix ID.
             // Order is not set yet properly.
        }
        setNavItems(newItems);
        return;
    }

    // --- HANDLE REORDER / MOVE ---
    if (active.id !== over.id) {
         // Find current index of active
         const oldIndex = navItems.findIndex(i => i.id === active.id);
         
         // Logic is tricky because `navItems` is flat, but we view it as tree.
         // `arrayMove` works on flat lists.
         // We need to:
         // 1. Update parent_id of active item to targetParentId.
         // 2. Update order.
         
         // If we are moving between containers, `arrayMove` is meaningless on the global array without filtering.
         // Strategy:
         // 1. Update parent_id first.
         // 2. Sort global array to group by parent? Or rely on order field?
         
         // Simplest DND Kit sortable within same container:
         const activeItem = navItems[oldIndex];
         const currentParentId = activeItem.parent_id;

         if (currentParentId === targetParentId) {
             // Reordering within same container.
             // We can use arrayMove on the subset, then merge?
             // Or map indices?
             // items in this container:
             const siblingIds = navItems
                .filter(i => i.parent_id === currentParentId)
                .sort((a,b) => (a.order||0) - (b.order||0))
                .map(i => i.id);
                
             const oldLocalIndex = siblingIds.indexOf(active.id as string);
             const newLocalIndex = siblingIds.indexOf(over.id as string);
             
             if (oldLocalIndex !== -1 && newLocalIndex !== -1) {
                 const newSiblingIds = arrayMove(siblingIds, oldLocalIndex, newLocalIndex);
                 // Update orders map
                 const orderMap = new Map<string, number>();
                 newSiblingIds.forEach((id, idx) => orderMap.set(id, idx));
                 
                 setNavItems(items => items.map(i => {
                     if (orderMap.has(i.id)) return { ...i, order: orderMap.get(i.id)! };
                     return i;
                 }));
             }
         } else {
             // Moving to different container.
             // 1. Change Parent.
             // 2. Append to end or insert? 
             // If dropped on 'container_X', append.
             // If dropped on 'Item Y' in that container, insert next to it.
             
             const newItem = { ...activeItem, parent_id: targetParentId };
             
             // Update navItems
             let newItems = navItems.map(i => i.id === newItem.id ? newItem : i);
             
             // Recalculate orders?
             // Just setting parent_id places it at the end usually if we don't update order.
             // Let's leave order management for a proper re-sort pass on save or refine here.
             // Refinement: If dropped ON item Y, take Y's order + 0.5?
             setNavItems(newItems);
         }
    }
  };

  const handleSave = async () => {
      setSaving(true);
      try {
          // Normalize orders before save
          // Group by parent, sort by current order, re-assign indices 0..N
          const grouped = new Map<string, NavItem[]>();
          navItems.forEach(i => {
              const pid = i.parent_id || 'root';
              if (!grouped.has(pid)) grouped.set(pid, []);
              grouped.get(pid)!.push(i);
          });
          
          let itemsToSave: NavItem[] = [];
          
          grouped.forEach(list => {
              list.sort((a,b) => (a.order||0) - (b.order||0));
              list.forEach((item, index) => {
                  itemsToSave.push({ ...item, order: index });
              });
          });

          // Delete missing
          const allExisting = await pb.collection("navigation_items").getFullList<NavItem>();
          const currentIds = new Set(itemsToSave.filter(i => !i.id.startsWith('temp_')).map(i => i.id));
          const toDelete = allExisting.filter(i => !currentIds.has(i.id));

          await Promise.all([
              ...toDelete.map(item => pb.collection("navigation_items").delete(item.id)),
              ...itemsToSave.map(item => {
                  const data = {
                      name: item.name,
                      href: item.href,
                      order: item.order,
                      parent_id: item.parent_id || '',
                      is_highlight: item.is_highlight,
                      is_external: item.is_external,
                      has_dropdown: item.has_dropdown
                  };
                  if (item.id.startsWith('temp_')) return pb.collection("navigation_items").create(data);
                  else return pb.collection("navigation_items").update(item.id, data);
              })
          ]);
          alert("Zapisano pomyślnie!");
          fetchData();
      } catch (error) {
          console.error("Error saving:", error);
          alert("Błąd zapisu.");
      } finally {
          setSaving(false);
      }
  };

  return (
    <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
    >
        <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold font-serif text-gray-800">Zarządzaj Menu</h1>
            <button
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-colors"
            >
            <Save size={18} />
            {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
        </div>

        {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-start">
                <AlertCircle className="text-red-500 mr-2" size={24} />
                <div>
                    <h3 className="text-red-800 font-medium">Błąd wczytywania</h3>
                    <p className="text-red-700">{error}</p>
                    <button onClick={fetchData} className="mt-2 text-red-800 underline hover:text-red-900 text-sm">
                        Spróbuj ponownie
                    </button>
                </div>
            </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 sticky top-4">
                    <h2 className="font-semibold text-lg mb-4">Dodaj elementy</h2>
                    {loading ? (
                        <div className="space-y-2 animate-pulse">
                             <div className="h-10 bg-gray-200 rounded"></div>
                             <div className="h-10 bg-gray-200 rounded"></div>
                             <div className="h-10 bg-gray-200 rounded"></div>
                             <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                    ) : (
                        <NavigationSource pages={subpages} />
                    )}
                    
                    {!loading && (
                        <div className="mt-6 bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                            <p className="font-semibold mb-1">Instrukcja:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>Przeciągnij i upuść</strong> elementy z lewej strony na prawą.</li>
                                <li>Aby dodać <strong>podmenu</strong>, zaznacz opcję <strong>Mega Menu</strong> w elemencie rodzica, a następnie upuść elementy w pole "Podmenu".</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:w-2/3">
                <div className="bg-gray-50 p-4 rounded-xl min-h-[500px] border-2 border-dashed border-gray-200">
                     {loading ? (
                         <div className="space-y-3 animate-pulse">
                             <div className="h-16 bg-white rounded border border-gray-200"></div>
                             <div className="h-16 bg-white rounded border border-gray-200"></div>
                             <div className="pl-8 space-y-2">
                                 <div className="h-14 bg-white/50 rounded border border-gray-200"></div>
                                 <div className="h-14 bg-white/50 rounded border border-gray-200"></div>
                             </div>
                             <div className="h-16 bg-white rounded border border-gray-200"></div>
                             <div className="h-16 bg-white rounded border border-gray-200"></div>
                         </div>
                     ) : (
                         <MenuBuilder 
                            items={treeItems} 
                            onUpdateItem={handleUpdateItem}
                            onRemoveItem={handleRemoveItem}
                            parentId="root"
                         />
                     )}
                </div>
            </div>
        </div>
        </div>

        {createPortal(
            <DragOverlay>
                {activeItem ? (
                    <div className="opacity-90 pointer-events-none">
                         <div className="p-3 bg-white border border-indigo-500 shadow-xl rounded w-[300px]">
                        <span className="font-bold text-gray-800">
                            {activeItem.name}
                            {activeItem.id === 'temp' ? ' (Dodaj)' : ''} 
                        </span>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>,
            document.body
        )}
    </DndContext>
  );
};

export default AdminNavigation;
