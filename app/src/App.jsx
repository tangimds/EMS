import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import store from "@/store";
import api from "@/services/api";

import Auth from "@/pages/auth";
import Home from "@/pages/home";
import Experiments from "@/pages/experiments";

// import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const ProtectedRoute = () => {
  const { user } = store();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export default function App() {
  const { user, setUser } = store();
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const { user, token } = await api.get("/auth/signin_token");
      if (token) api.setToken(token);
      if (user) setUser(user);
    } catch (e) {
      console.error("Auth check failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) return setLoading(false);
    checkAuth();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/*" element={<Auth />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/experiments/*" element={<Experiments />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}

const Layout = () => {
  return (
    <main className="">
      <Sidebar />
      <section className="ml-48 bg-gray-50 min-h-screen">
        <Outlet />
      </section>
    </main>
  );
};
