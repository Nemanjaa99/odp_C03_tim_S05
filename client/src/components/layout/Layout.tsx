import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";
import { ReactNode } from "react";

export const Layout = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) =>
    location.pathname === path ? "fb-nav-link active" : "fb-nav-link";

  return (
    <div className="fb-layout">
      <div className="fb-topbar">
        <span>Platforma za kolekcije društvenih igara</span>
        <span className="fb-topbar-right">✦ Anno Domini MMXXVI ✦</span>
      </div>
      <header className="fb-header">
        <div className="fb-header-inner">
          <Link to="/" className="fb-logo">
            <span className="fb-logo-forge">Forge</span>
            <span className="fb-logo-board">Board</span>
          </Link>
          <nav className="fb-nav">
            <Link to="/" className={isActive("/")}>Katalog</Link>
            {isAuthenticated && (
              <>
                <Link to="/collection" className={isActive("/collection")}>Kolekcija</Link>
                <Link to="/sessions" className={isActive("/sessions")}>Sesije</Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="fb-nav-link fb-nav-admin">Admin</Link>
            )}
          </nav>
          <div className="fb-header-actions">
            {isAuthenticated ? (
              <div className="fb-user-menu">
                <span className="fb-username">✦ {user?.username}</span>
                <button className="fb-btn fb-btn-ghost" onClick={handleLogout}>Odjava</button>
              </div>
            ) : (
              <div className="fb-auth-links">
                <Link to="/login" className="fb-btn fb-btn-ghost">Prijava</Link>
                <Link to="/register" className="fb-btn fb-btn-primary">Registracija</Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="fb-main">{children}</main>
      <footer className="fb-footer">
        ✦ ForgeBoard — Platforma za kolekcije društvenih igara — MMXXVI ✦
      </footer>
    </div>
  );
};