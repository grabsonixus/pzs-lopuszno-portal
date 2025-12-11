import React, { useState, useEffect, useContext } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AdminNavbar from "./AdminNavbar";
import AccessibilityWidget from "./AccessibilityWidget";
import { pb } from "../services/pocketbase";
import { AdminEditProvider } from "../lib/AdminEditContext";
import { ThemeManager, ThemeContext } from "./ThemeManager"; // Nowy import

interface LayoutProps {
  children: React.ReactNode;
}

// Wrapper wewnętrzny, który ma dostęp do ThemeContext
const LayoutContent: React.FC<LayoutProps> = ({ children }) => {
  const settings = useContext(ThemeContext);

  const checkIsAdmin = () => {
    const model = pb.authStore.model;
    return (
      pb.authStore.isValid &&
      (model?.collectionName === "_admins" ||
        model?.collectionName === "_superusers")
    );
  };

  const [isAdmin, setIsAdmin] = useState(checkIsAdmin());

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setIsAdmin(checkIsAdmin());
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-yellow-400 focus:text-black focus:font-bold focus:rounded focus:outline-none focus:ring-4 focus:ring-blue-600"
      >
        Przejdź do treści głównej
      </a>

      {/* Warunkowe wyświetlanie widgetu - domyślnie true, chyba że w bazie jest false */}
      {settings.show_accessibility_widget !== false && <AccessibilityWidget />}

      <Navbar />
      {isAdmin && <AdminNavbar />}

      <main
        id="main-content"
        className="flex-grow flex flex-col focus:outline-none"
        tabIndex={-1}
      >
        {children}
      </main>

      <Footer />
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AdminEditProvider>
      <ThemeManager>
        <LayoutContent>{children}</LayoutContent>
      </ThemeManager>
    </AdminEditProvider>
  );
};

export default Layout;
