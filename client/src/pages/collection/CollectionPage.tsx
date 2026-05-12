import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CollectionAPIService, UserGameEntry } from "../../api_services/collection/CollectionAPIService";
import { useAuth } from "../../hooks/auth/useAuth";

const STATUS_LABELS: Record<string, string> = {
  owned: "U posjedu",
  wishlist: "Wish lista",
  previously_owned: "Ranije posedovano",
};

const STATUS_ORDER = ["owned", "wishlist", "previously_owned"];

export const CollectionPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [collection, setCollection] = useState<UserGameEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGame, setEditingGame] = useState<UserGameEntry | null>(null);
  const [editStatus, setEditStatus] = useState<string>("owned");
  const [editRating, setEditRating] = useState<number>(5);
  const [editNotes, setEditNotes] = useState<string>("");
  const [editError, setEditError] = useState<string>("");

  useEffect(() => {
    const fetchCollection = async () => {
      if (!token) return;
      setIsLoading(true);
      const data = await CollectionAPIService.getMyCollection(token);
      setCollection(data);
      setIsLoading(false);
    };
    fetchCollection();
  }, [token]);

  const handleRemove = async (gameId: number) => {
    if (!token) return;
    const success = await CollectionAPIService.removeGame(gameId, token);
    if (success) setCollection((prev) => prev.filter((ug) => ug.game_id !== gameId));
  };

  const handleEditOpen = (ug: UserGameEntry) => {
    setEditingGame(ug);
    setEditStatus(ug.status);
    setEditRating(ug.personal_rating ?? 5);
    setEditNotes(ug.notes ?? "");
    setEditError("");
  };

  const handleEditSave = async () => {
    if (!token || !editingGame) return;
    const result = await CollectionAPIService.updateGame(
      editingGame.game_id, editStatus, editRating, editNotes || null, token
    );
    if (result) {
      setCollection((prev) => prev.map((ug) => ug.game_id === result.game_id ? result : ug));
      setEditingGame(null);
    } else {
      setEditError("Greška pri ažuriranju.");
    }
  };

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = collection.filter((ug) => ug.status === status);
    return acc;
  }, {} as Record<string, UserGameEntry[]>);

  const totalGames = collection.length;
  const ratedGames = collection.filter((ug) => ug.personal_rating !== null);
  const avgRating = ratedGames.length > 0
    ? (ratedGames.reduce((sum, ug) => sum + (ug.personal_rating ?? 0), 0) / ratedGames.length).toFixed(1)
    : null;

  const mechanicCount: Record<string, number> = {};
  collection.forEach((ug) => {
    (ug.game?.mechanics ?? []).forEach((m) => {
      mechanicCount[m] = (mechanicCount[m] ?? 0) + 1;
    });
  });
  const topMechanic = Object.entries(mechanicCount).sort((a, b) => b[1] - a[1])[0]?.[0];

  if (isLoading) return <div className="fb-loading">Učitavanje kolekcije...</div>;

  return (
    <div>
      <div className="fb-page-header">
        <h1 className="fb-page-title">Moja kolekcija</h1>
        <p className="fb-page-subtitle">✦ {user?.username}</p>
      </div>

      {totalGames > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: ".75rem", marginBottom: "2rem" }}>
          {[
            { label: "Ukupno igara", value: totalGames },
            { label: "Prosečna ocena", value: avgRating ? `${avgRating}/10` : "N/A" },
            { label: "Najigranija mehanika", value: topMechanic ?? "N/A" },
            { label: "U posjedu", value: grouped.owned.length },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "#d4a870", border: "1.5px solid #a06830", borderRadius: "6px", padding: ".85rem 1rem", textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "#3c1a08", lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: ".65rem", letterSpacing: ".1em", textTransform: "uppercase", color: "#6b3a18", marginTop: ".25rem" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {totalGames === 0 ? (
        <div className="fb-empty">
          <div className="fb-empty-icon">♟</div>
          <div className="fb-empty-title">Kolekcija je prazna</div>
          <p style={{ marginBottom: "1rem", fontStyle: "italic" }}>Dodajte igre iz kataloga</p>
          <button className="fb-btn fb-btn-primary" onClick={() => navigate("/")}>Pregledaj katalog</button>
        </div>
      ) : (
        STATUS_ORDER.map((status) => grouped[status].length > 0 && (
          <div key={status} style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontStyle: "italic", color: "#7a4010", marginBottom: "1rem", paddingBottom: ".5rem", borderBottom: "2px solid #c8a870" }}>
              {STATUS_LABELS[status]} ({grouped[status].length})
            </h2>
            <div className="fb-grid fb-grid-4">
              {grouped[status].map((ug) => (
                <div key={ug.game_id} className="fb-card">
                  <div style={{ height: "120px", background: "#d4a870", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", borderBottom: "1.5px solid #a06830", cursor: "pointer", overflow: "hidden" }}
                    onClick={() => navigate(`/games/${ug.game_id}`)}>
                    {ug.game?.cover_image
                      ? <img src={ug.game.cover_image} alt={ug.game.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span>♟</span>}
                  </div>
                  <div className="fb-card-body">
                    {ug.game?.mechanics && ug.game.mechanics.length > 0 && (
                      <div style={{ fontSize: ".68rem", color: "#a06830", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: ".25rem" }}>
                        {ug.game.mechanics.slice(0, 2).join(" · ")}
                      </div>
                    )}
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: ".95rem", fontStyle: "italic", color: "#1e0e04", marginBottom: ".4rem", cursor: "pointer", lineHeight: 1.3 }}
                      onClick={() => navigate(`/games/${ug.game_id}`)}>
                      {ug.game?.title}
                    </h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".5rem", paddingBottom: ".5rem", borderBottom: "1px solid #c8a870" }}>
                      <span style={{ fontSize: ".75rem", color: "#7a4828", fontStyle: "italic" }}>
                        {ug.game?.min_players}-{ug.game?.max_players}P · {ug.game?.duration_min}min
                      </span>
                      {ug.personal_rating && (
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: ".9rem", fontWeight: 700, color: "#7a4010" }}>
                          {ug.personal_rating}/10
                        </span>
                      )}
                    </div>
                    {ug.notes && (
                      <p style={{ fontSize: ".8rem", color: "#7a4828", fontStyle: "italic", marginBottom: ".6rem", lineHeight: 1.5 }}>
                        "{ug.notes}"
                      </p>
                    )}
                    <div style={{ display: "flex", gap: ".4rem" }}>
                      <button className="fb-btn fb-btn-ghost fb-btn-sm" style={{ flex: 1 }} onClick={() => handleEditOpen(ug)}>Izmeni</button>
                      <button className="fb-btn fb-btn-danger fb-btn-sm" style={{ flex: 1 }} onClick={() => handleRemove(ug.game_id)}>Ukloni</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {editingGame && (
        <div className="fb-modal-overlay" onClick={() => setEditingGame(null)}>
          <div className="fb-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="fb-modal-title">Izmeni — {editingGame.game?.title}</h3>
            {editError && <div className="fb-alert fb-alert-error" style={{ marginBottom: "1rem" }}>{editError}</div>}
            <div className="fb-form">
              <div className="fb-form-group">
                <label className="fb-label">Status</label>
                <select className="fb-select" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                  <option value="owned">U posjedu</option>
                  <option value="wishlist">Wish lista</option>
                  <option value="previously_owned">Ranije posjedovano</option>
                </select>
              </div>
              <div className="fb-form-group">
                <label className="fb-label">Lična ocena (1-10)</label>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <input type="range" min={1} max={10} value={editRating}
                    onChange={(e) => setEditRating(parseInt(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, color: "#7a4010", minWidth: "2rem", textAlign: "center" }}>
                    {editRating}
                  </span>
                </div>
              </div>
              <div className="fb-form-group">
                <label className="fb-label">Beleška</label>
                <textarea className="fb-textarea" value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)} placeholder="Vaše beleške o igri..." rows={3} />
              </div>
            </div>
            <div className="fb-modal-actions">
              <button className="fb-btn fb-btn-ghost" onClick={() => setEditingGame(null)}>Otkaži</button>
              <button className="fb-btn fb-btn-primary" onClick={handleEditSave}>Sačuvaj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};