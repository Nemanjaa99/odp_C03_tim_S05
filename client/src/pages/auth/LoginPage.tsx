import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Sva polja su obavezna.");
      return;
    }
    setIsLoading(true);
    const success = await login(username, password);
    setIsLoading(false);
    if (success) {
      navigate("/");
    } else {
      setError("Neispravno korisničko ime ili lozinka.");
    }
  };

  return (
    <div className="fb-auth-page">
      <div className="fb-auth-card">
        <div className="fb-auth-header">
          <h1 className="fb-auth-title">Prijava</h1>
          <p className="fb-auth-subtitle">Dobrodošli nazad na ForgeBoard</p>
        </div>
        <form className="fb-form" onSubmit={handleSubmit}>
          {error && <div className="fb-alert fb-alert-error">{error}</div>}
          <div className="fb-form-group">
            <label className="fb-label">Korisničko ime</label>
            <input
              className="fb-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Unesite korisničko ime"
              autoComplete="username"
            />
          </div>
          <div className="fb-form-group">
            <label className="fb-label">Lozinka</label>
            <input
              className="fb-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Unesite lozinku"
              autoComplete="current-password"
            />
          </div>
          <button className="fb-btn fb-btn-primary fb-btn-full" type="submit" disabled={isLoading}>
            {isLoading ? "Prijava u toku..." : "Prijavi se"}
          </button>
        </form>
        <p className="fb-auth-footer">
          Nemate nalog? <Link to="/register" className="fb-link">Registrujte se</Link>
        </p>
      </div>
    </div>
  );
};