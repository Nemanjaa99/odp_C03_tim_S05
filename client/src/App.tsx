import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { NotFoundPage } from "./pages/not_found/NotFoundPage";
import { CatalogPage } from "./pages/catalog/CatalogPage";
import { GameDetailPage } from "./pages/game_detail/GameDetailPage";

// Placeholder stranice — biće zamenjene u sledećim commitovima
const CollectionPage = () => <div className="fb-page-header"><h1 className="fb-page-title">Moja kolekcija</h1><p className="fb-page-subtitle">Dolazi u Commit 7...</p></div>;
const SessionsPage = () => <div className="fb-page-header"><h1 className="fb-page-title">Moje sesije</h1><p className="fb-page-subtitle">Dolazi u Commit 7...</p></div>;
const AdminPage = () => <div className="fb-page-header"><h1 className="fb-page-title">Admin panel</h1><p className="fb-page-subtitle">Dolazi u Commit 8...</p></div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/games/:id" element={<GameDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/collection" element={<ProtectedRoute><CollectionPage /></ProtectedRoute>} />
            <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;