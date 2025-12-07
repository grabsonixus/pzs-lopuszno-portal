import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AdminNavbar from './AdminNavbar';
import { pb } from '../services/pocketbase';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const checkIsAdmin = () => {
    const model = pb.authStore.model;
    return pb.authStore.isValid && (model?.collectionName === '_admins' || model?.collectionName === '_superusers');
  }

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {isAdmin && <AdminNavbar />}
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;