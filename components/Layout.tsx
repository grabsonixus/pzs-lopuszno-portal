import React, { useState, useEffect, useContext } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AdminNavbar from "./AdminNavbar";
import AccessibilityWidget from "./AccessibilityWidget";
import { pb } from "../services/pocketbase";
import { AdminEditProvider } from "../lib/AdminEditContext";
import { ThemeManager, ThemeContext } from "./ThemeManager"; // Nowy import
import { checkFileExists } from "../lib/types";
import Toast from "./Toast";

interface LayoutProps {
  children: React.ReactNode;
}

// Wrapper wewnętrzny, który ma dostęp do ThemeContext
const LayoutContent: React.FC<LayoutProps> = ({ children }) => {
  const settings = useContext(ThemeContext);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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

  useEffect(() => {
    let checkingFile = false;

    const handleGlobalClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        let href = anchor.getAttribute("href");
        if (href && href.includes("/api/files/")) {
          // Detect if double /api/api/ prefix is required based on baseUrl
          const baseUrl = (import.meta.env?.VITE_PUBLIC_POCKETBASE_URL) || "https://zsp5lopuszno.pl/api";
          const needsDoubleApi = baseUrl.endsWith("/api") || baseUrl.endsWith("/api/");

          if (needsDoubleApi && !href.includes("/api/api/files/")) {
            href = href.replace("/api/files/", "/api/api/files/");
            anchor.setAttribute("href", href);
          }

          // If already checking, prevent double trigger
          if (checkingFile) {
            e.preventDefault();
            return;
          }

          e.preventDefault();
          checkingFile = true;
          const originalCursor = document.body.style.cursor;
          document.body.style.cursor = "wait";

          try {
            const exists = await checkFileExists(href);
            if (exists) {
              const targetAttr = anchor.getAttribute("target") || "_blank";
              window.open(href, targetAttr, "noopener,noreferrer");
            } else {
              setToast({ message: "Wybrany plik nie istnieje na serwerze.", type: "error" });
            }
          } catch (err) {
            // Fallback: try to open in case of network anomalies
            const targetAttr = anchor.getAttribute("target") || "_blank";
            window.open(href, targetAttr, "noopener,noreferrer");
          } finally {
            document.body.style.cursor = originalCursor;
            checkingFile = false;
          }
        }
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
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
