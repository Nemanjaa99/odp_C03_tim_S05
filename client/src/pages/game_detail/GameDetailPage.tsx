import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Game } from "../../types/games/gameTypes";
import { Review } from "../../types/reviews/reviewTypes";
import { GamesAPIService } from "../../api_services/games/GamesAPIService";
import { ReviewsAPIService } from "../../api_services/reviews/ReviewsAPIService";
import { CollectionAPIService } from "../../api_services/collection/CollectionAPIService";
import { useAuth } from "../../hooks/auth/useAuth";

export const GameDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, token, user } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isInCollection, setIsInCollection] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Review forma
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewRating, setReviewRating] = useState(7);
  const [reviewError, setReviewError] = useState("");
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      const [gameData, reviewsData] = await Promise.all([
        GamesAPIService.getById(parseInt(id)),
        ReviewsAPIService.getByGameId(parseInt(id)),
      ]);
      setGame(gameData);
      setReviews(reviewsData);

      if (isAuthenticated && token) {
        const collection = await CollectionAPIService.getMyCollection(token);
        setIsInCollection(collection.some((ug) => ug.game_id === parseInt(id)));
      }
      setIsLoading(false);
    };
    fetchData();
  }, [id, isAuthenticated, token]);

  const handleAddToCollection = async () => {
    if (!token || !game) return;
    const result = await CollectionAPIService.addGame(game.id, "owned", null, null, token);
    if (result) setIsInCollection(true);
  };

  const handleSubmitReview = async () => {
    setReviewError("");
    if (!reviewTitle.trim()) { setReviewError("Naslov je obavezan."); return; }
    if (reviewBody.length < 50) { setReviewError("Telo recenzije mora imati najmanje 50 karaktera."); return; }
    if (!token || !game) return;

    if (editingReview) {
      const result = await ReviewsAPIService.update(
        editingReview.id, game.id, reviewTitle, reviewBody, reviewRating, token
      );
      if (result) {
        setReviews((prev) => prev.map((r) => r.id === result.id ? result : r));
        resetReviewForm();
      } else {
        setReviewError("Greška pri izmeni recenzije.");
      }
    } else {
      const result = await ReviewsAPIService.create(game.id, reviewTitle, reviewBody, reviewRating, token);
      if (result) {
        setReviews((prev) => [result, ...prev]);
        resetReviewForm();
      } else {
        setReviewError("Greška. Možda već imate recenziju za ovu igru.");
      }
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!token) return;
    const success = await ReviewsAPIService.delete(reviewId, token);
    if (success) setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setReviewTitle(review.title);
    setReviewBody(review.body);
    setReviewRating(review.rating);
    setShowReviewForm(true);
  };

  const resetReviewForm = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setReviewTitle("");
    setReviewBody("");
    setReviewRating(7);
    setReviewError("");
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const getWeightLabel = (weight: number) => {
    if (weight < 2) return "Laka";
    if (weight < 3.5) return "Srednja";
    return "Teška";
  };

  if (isLoading) return <div className="fb-loading">Učitavanje igre...</div>;
  if (!game) return (
    <div className="fb-empty">
      <div className="fb-empty-icon">♟</div>
      <div className="fb-empty-title">Igra nije pronađena</div>
      <button className="fb-btn fb-btn-primary" onClick={() => navigate("/")}>Nazad na katalog</button>
    </div>
  );

  return (
    <div>
      {/* Nazad dugme */}
      <button
        className="fb-btn fb-btn-ghost fb-btn-sm"
        style={{ marginBottom: "1.5rem" }}
        onClick={() => navigate("/")}
      >
        ← Nazad na katalog
      </button>

      {/* Header igre */}
      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {/* Slika */}
        <div style={{
          width: "220px", minWidth: "220px", height: "280px",
          background: "#d4a870", border: "1.5px solid #a06830",
          borderRadius: "6px", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "4rem", overflow: "hidden", flexShrink: 0,
        }}>
          {game.cover_image ? (
            <img src={game.cover_image} alt={game.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : <span>♟</span>}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          {/* Mehanike */}
          {game.mechanics && game.mechanics.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", marginBottom: ".75rem" }}>
              {game.mechanics.map((m) => (
                <span key={m} className="fb-badge fb-badge-brown">{m}</span>
              ))}
            </div>
          )}

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontStyle: "italic", color: "#1e0e04", marginBottom: ".5rem", lineHeight: 1.2 }}>
            {game.title}
          </h1>

          <p style={{ color: "#7a4828", fontSize: ".9rem", marginBottom: "1.25rem", fontStyle: "italic" }}>
            {game.publisher} · {game.year}
          </p>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: ".75rem", marginBottom: "1.25rem" }}>
            {[
              { label: "Igrači", value: game.min_players === game.max_players ? `${game.min_players}` : `${game.min_players}–${game.max_players}` },
              { label: "Trajanje", value: `${game.duration_min} min` },
              { label: "Težina", value: `${game.weight.toFixed(1)} — ${getWeightLabel(game.weight)}` },
              { label: "Prosečna ocena", value: avgRating ? `${avgRating}/10` : "N/A" },
            ].map((stat) => (
              <div key={stat.label} style={{ background: "#d4a870", border: "1.5px solid #a06830", borderRadius: "4px", padding: ".6rem .85rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#3c1a08", fontFamily: "'Playfair Display', serif" }}>{stat.value}</div>
                <div style={{ fontSize: ".65rem", letterSpacing: ".1em", textTransform: "uppercase", color: "#6b3a18", marginTop: ".15rem" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Opis */}
          {game.description && (
            <p style={{ color: "#3c1a08", lineHeight: 1.7, marginBottom: "1.25rem", fontFamily: "'Lora', serif" }}>
              {game.description}
            </p>
          )}

          {/* Dugmad */}
          <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
            {isAuthenticated ? (
              <button
                className={`fb-btn ${isInCollection ? "fb-btn-ghost" : "fb-btn-primary"}`}
                onClick={handleAddToCollection}
                disabled={isInCollection}
              >
                {isInCollection ? "✓ U kolekciji" : "+ Dodaj u kolekciju"}
              </button>
            ) : (
              <button className="fb-btn fb-btn-primary" onClick={() => navigate("/login")}>
                Prijavi se da dodaš u kolekciju
              </button>
            )}
          </div>
        </div>
      </div>

      <hr className="fb-divider" />

      {/* Recenzije */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontStyle: "italic", color: "#1e0e04" }}>
            Recenzije {reviews.length > 0 && `(${reviews.length})`}
          </h2>
          {isAuthenticated && !showReviewForm && (
            <button className="fb-btn fb-btn-primary fb-btn-sm" onClick={() => setShowReviewForm(true)}>
              + Napiši recenziju
            </button>
          )}
        </div>

        {/* Forma za recenziju */}
        {showReviewForm && (
          <div style={{ background: "#e8d0b0", border: "1.5px solid #a06830", borderTop: "3px solid #7a4010", borderRadius: "6px", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontStyle: "italic", color: "#7a4010", marginBottom: "1rem" }}>
              {editingReview ? "Izmeni recenziju" : "Nova recenzija"}
            </h3>
            {reviewError && <div className="fb-alert fb-alert-error" style={{ marginBottom: "1rem" }}>{reviewError}</div>}
            <div className="fb-form">
              <div className="fb-form-group">
                <label className="fb-label">Naslov</label>
                <input className="fb-input" type="text" value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)} placeholder="Naslov recenzije" />
              </div>
              <div className="fb-form-group">
                <label className="fb-label">Ocena (1-10)</label>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <input type="range" min={1} max={10} value={reviewRating}
                    onChange={(e) => setReviewRating(parseInt(e.target.value))}
                    style={{ flex: 1 }} />
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, color: "#7a4010", minWidth: "2rem", textAlign: "center" }}>
                    {reviewRating}
                  </span>
                </div>
              </div>
              <div className="fb-form-group">
                <label className="fb-label">Recenzija (min 50 karaktera)</label>
                <textarea className="fb-textarea" value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Napišite vašu recenziju..." rows={5} />
                <span style={{ fontSize: ".75rem", color: reviewBody.length < 50 ? "#9a2010" : "#3a6010", fontStyle: "italic" }}>
                  {reviewBody.length}/50 karaktera minimum
                </span>
              </div>
              <div style={{ display: "flex", gap: ".75rem", justifyContent: "flex-end" }}>
                <button className="fb-btn fb-btn-ghost" onClick={resetReviewForm}>Otkaži</button>
                <button className="fb-btn fb-btn-primary" onClick={handleSubmitReview}>
                  {editingReview ? "Sačuvaj izmene" : "Objavi recenziju"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista recenzija */}
        {reviews.length === 0 ? (
          <div className="fb-empty">
            <div className="fb-empty-icon" style={{ fontSize: "2rem" }}>✍</div>
            <div className="fb-empty-title">Još nema recenzija</div>
            <p style={{ fontStyle: "italic" }}>Budite prvi koji će oceniti ovu igru</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {reviews.map((review) => (
              <div key={review.id} style={{ background: "#e8d0b0", border: "1.5px solid #c8a870", borderLeft: "3px solid #a06830", borderRadius: "4px", padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".6rem" }}>
                  <div>
                    <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontStyle: "italic", color: "#1e0e04", marginBottom: ".2rem" }}>
                      {review.title}
                    </h4>
                    <span style={{ fontSize: ".78rem", color: "#7a4828", fontStyle: "italic" }}>
                      ✦ {review.username}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "#7a4010" }}>
                      {review.rating}/10
                    </span>
                    {user?.id === review.user_id && (
                      <div style={{ display: "flex", gap: ".4rem" }}>
                        <button className="fb-btn fb-btn-ghost fb-btn-sm" onClick={() => handleEditReview(review)}>Izmeni</button>
                        <button className="fb-btn fb-btn-danger fb-btn-sm" onClick={() => handleDeleteReview(review.id)}>Obriši</button>
                      </div>
                    )}
                  </div>
                </div>
                <p style={{ color: "#3c1a08", lineHeight: 1.7, fontFamily: "'Lora', serif" }}>{review.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};