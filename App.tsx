import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import NewsList from './components/NewsList';
import NewsDetail from './components/NewsDetail';
import Offer from './components/Offer';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminNews from './components/AdminNews';
import AdminNewsForm from './components/AdminNewsForm';
import AdminNavigation from './components/AdminNavigation';
import SubpageDetail from './components/SubpageDetail';
import AdminSubpages from './components/AdminSubpages';
import AdminSubpageForm from './components/AdminSubpageForm';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aktualnosci" element={<NewsList />} />
          <Route path="/aktualnosci/:slug" element={<NewsDetail />} />
          <Route path="/p/:slug" element={<SubpageDetail />} />
          <Route path="/oferta" element={<Offer />} />
          {/* Placeholder routes for sections not yet implemented */}
          <Route path="/rekrutacja" element={<Offer />} />
          <Route path="/kontakt" element={<div className="container mx-auto p-20 text-center text-gray-500">Formularz kontaktowy w budowie</div>} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin" element={<PrivateRoute />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="news/new" element={<AdminNewsForm />} />
            <Route path="news/edit/:id" element={<AdminNewsForm />} />
            <Route path="subpages" element={<AdminSubpages />} />
            <Route path="subpages/new" element={<AdminSubpageForm />} />
            <Route path="subpages/edit/:id" element={<AdminSubpageForm />} />
            <Route path="navigation" element={<AdminNavigation />} />
          </Route>
          <Route path="*" element={<div className="container mx-auto p-20 text-center">404 - Strona nie znaleziona</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;