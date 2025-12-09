import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AdminNavbar from "./AdminNavbar";
import AccessibilityWidget from "./AccessibilityWidget"; // Importujemy widget
import { pb } from "../services/pocketbase";
import { AdminEditProvider } from "../lib/AdminEditContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
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

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AdminEditProvider>
      <div className="min-h-screen flex flex-col font-sans text-gray-900">
        {/* Skip Link dla dostępności klawiaturowej (WCAG) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-yellow-400 focus:text-black focus:font-bold focus:rounded focus:outline-none focus:ring-4 focus:ring-blue-600"
        >
          Przejdź do treści głównej
        </a>

        <AccessibilityWidget />

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
    </AdminEditProvider>
  );
};

export default Layout;
