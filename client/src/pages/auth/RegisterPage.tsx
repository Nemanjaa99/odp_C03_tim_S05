import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", full_name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.full_name || !form.email || !form.password) {
      setError("Sva polja su obavezna.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Lozinke se ne poklapaju.");
      return;
    }
    if (form.password.length < 6) {
      setError("Lozinka mora imati najmanje 6 karaktera.");
      return;
    }

    setIsLoading(true);
    const success = await register(form.username, form.full_name, form.email, form.password);
    setIsLoading(false);

    if (success) {
      navigate("/");
    } else {
      setError("Korisničko ime ili email već postoji.");
    }
  };

  return (
    <div className="fb-auth-page">
      <div className="fb-auth-card">
        <div className="fb-auth-header">
          <h1 className="fb-auth-title">Registracija</h1>
          <p className="fb-auth-subtitle">Pridružite se ForgeBoard zajednici</p>
        </div>
        <form className="fb-form" onSubmit={handleSubmit}>
          {error && <div className="fb-alert fb-alert-error">{error}</div>}
          <div className="fb-form-group">
            <label className="fb-label">Korisničko ime</label>
            <input className="fb-input" type="text" name="username" value={form.username} onChange={handleChange} placeholder="npr. dragan_bg" />
          </div>
          <div className="fb-form-group">
            <label className="fb-label">Ime i prezime</label>
            <input className="fb-input" type="text" name="full_name" value={form.full_name} onChange={handleChange} placeholder="npr. Dragan Petrović" />
          </div>
          <div className="fb-form-group">
            <label className="fb-label">Email</label>
            <input className="fb-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="npr. dragan@email.com" />
          </div>
          <div className="fb-form-group">
            <label className="fb-label">Lozinka</label>
            <input className="fb-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Najmanje 6 karaktera" />
          </div>
          <div className="fb-form-group">
            <label className="fb-label">Potvrda lozinke</label>
            <input className="fb-input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Ponovite lozinku" />
          </div>
          <button className="fb-btn fb-btn-primary fb-btn-full" type="submit" disabled={isLoading}>
            {isLoading ? "Registracija u toku..." : "Registruj se"}
          </button>
        </form>
        <p className="fb-auth-footer">
          Već imate nalog? <Link to="/login" className="fb-link">Prijavite se</Link>
        </p>
      </div>
    </div>
  );
};