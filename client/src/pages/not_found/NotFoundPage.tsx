import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <div className="fb-not-found">
      <h1 className="fb-not-found-code">404</h1>
      <p className="fb-not-found-text">Stranica nije pronađena</p>
      <Link to="/" className="fb-btn fb-btn-primary">Nazad na početnu</Link>
    </div>
  );
};