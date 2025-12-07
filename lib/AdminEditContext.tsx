import { createContext, useState, ReactNode } from 'react';

interface AdminEditContextType {
  editLink: string | null;
  setEditLink: (link: string | null) => void;
  pageType: 'news' | 'subpage' | null;
  setPageType: (type: 'news' | 'subpage' | null) => void;
  pageId: string | null;
  setPageId: (id: string | null) => void;
}

export const AdminEditContext = createContext<AdminEditContextType>({
  editLink: null,
  setEditLink: () => {},
  pageType: null,
  setPageType: () => {},
  pageId: null,
  setPageId: () => {},
});

export const AdminEditProvider = ({ children }: { children: ReactNode }) => {
  const [editLink, setEditLink] = useState<string | null>(null);
  const [pageType, setPageType] = useState<'news' | 'subpage' | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);

  return (
    <AdminEditContext.Provider value={{ editLink, setEditLink, pageType, setPageType, pageId, setPageId }}>
      {children}
    </AdminEditContext.Provider>
  );
};
