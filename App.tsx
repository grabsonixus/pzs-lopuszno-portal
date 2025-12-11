import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import NewsList from "./components/NewsList";
import NewsDetail from "./components/NewsDetail";
import PrivateRoute from "./components/PrivateRoute";
import SubpageDetail from "./components/SubpageDetail";
import { AdminEditProvider } from "./lib/AdminEditContext";

// lazy-loaded admin pages
const AdminLogin = lazy(() => import("./components/AdminLogin"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const AdminNews = lazy(() => import("./components/AdminNews"));
const AdminNewsForm = lazy(() => import("./components/AdminNewsForm"));
const AdminNavigation = lazy(() => import("./components/AdminNavigation"));
const AdminSubpages = lazy(() => import("./components/AdminSubpages"));
const AdminSubpageForm = lazy(() => import("./components/AdminSubpageForm"));
const AdminHomeForm = lazy(() => import("./components/AdminHomeForm"));
const AdminSettingsForm = lazy(() => import("./components/AdminSettingsForm"));
const AdminFooterForm = lazy(() => import("./components/AdminFooterForm")); // NOWY IMPORT

const App: React.FC = () => {
  return (
    <BrowserRouter basename="/nowa/">
      <AdminEditProvider>
        <Layout>
          <Suspense
            fallback={<div className="p-8 text-center">Ładowanie…</div>}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/aktualnosci" element={<NewsList />} />
              <Route path="/aktualnosci/:slug" element={<NewsDetail />} />
              <Route path="/p/:slug" element={<SubpageDetail />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin" element={<PrivateRoute />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="news" element={<AdminNews />} />
                <Route path="news/new" element={<AdminNewsForm />} />
                <Route path="news/edit/:id" element={<AdminNewsForm />} />
                <Route path="subpages" element={<AdminSubpages />} />
                <Route path="subpages/new" element={<AdminSubpageForm />} />
                <Route
                  path="subpages/edit/:id"
                  element={<AdminSubpageForm />}
                />
                <Route path="navigation" element={<AdminNavigation />} />
                <Route path="home" element={<AdminHomeForm />} />
                <Route path="settings" element={<AdminSettingsForm />} />
                <Route path="footer" element={<AdminFooterForm />} />{" "}
                {/* NOWA TRASA */}
              </Route>
              <Route
                path="*"
                element={
                  <div className="container mx-auto p-20 text-center">
                    404 - Strona nie znaleziona
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </Layout>
      </AdminEditProvider>
    </BrowserRouter>
  );
};

export default App;
