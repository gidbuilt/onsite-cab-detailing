import { useEffect, lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Book } from "./pages/Book";
import { Home } from "./pages/Home";
import { Services } from "./pages/Services";

const Admin = lazy(() =>
  import("./pages/Admin").then((mod) => ({ default: mod.Admin })),
);

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = decodeURIComponent(hash.replace("#", ""));

    const scrollToId = () => {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    };

    if (scrollToId()) return;

    const frame = requestAnimationFrame(() => {
      if (scrollToId()) return;
      window.setTimeout(scrollToId, 80);
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="site-main">{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <div className="site-shell">
      <ScrollManager />
      <Routes>
        <Route
          path="/admin"
          element={
            <Suspense fallback={<div className="admin-login">Loading…</div>}>
              <Admin />
            </Suspense>
          }
        />
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />
        <Route
          path="/services"
          element={
            <PublicLayout>
              <Services />
            </PublicLayout>
          }
        />
        <Route
          path="/book"
          element={
            <PublicLayout>
              <Book />
            </PublicLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
