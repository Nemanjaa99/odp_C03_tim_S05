import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Game } from "../../types/games/gameTypes";
import { Mechanic } from "../../types/mechanics/mechanicTypes";
import { GamesAPIService } from "../../api_services/games/GamesAPIService";
import { MechanicsAPIService } from "../../api_services/mechanics/MechanicsAPIService";
import { CollectionAPIService } from "../../api_services/collection/CollectionAPIService";
import { useAuth } from "../../hooks/auth/useAuth";

export const CatalogPage = () => {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [games, setGames] = useState<Game[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [collectionIds, setCollectionIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filteri
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMechanic, setSelectedMechanic] = useState("all");
  const [selectedPlayers, setSelectedPlayers] = useState("all");
  const [selectedWeight, setSelectedWeight] = useState("all");
  const [sortBy, setSortBy] = useState("title");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [gamesData, mechanicsData] = await Promise.all([
        GamesAPIService.getAll(),
        MechanicsAPIService.getAll(),
      ]);
      setGames(gamesData);
      setMechanics(mechanicsData);

      if (isAuthenticated && token) {
        const collection = await CollectionAPIService.getMyCollection(token);
        setCollectionIds(collection.map((ug) => ug.game_id));
      }
      setIsLoading(false);
    };
    fetchData();
  }, [isAuthenticated, token]);

  const handleAddToCollection = async (gameId: number) => {
    if (!isAuthenticated || !token) {
      navigate("/login");
      return;
    }
    const result = await CollectionAPIService.addGame(gameId, "owned", null, null, token);
    if (result) {
      setCollectionIds((prev) => [...prev, gameId]);
    }
  };

  const filteredGames = games
    .filter((g) => {
      const matchSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMechanic =
        selectedMechanic === "all" || (g.mechanics ?? []).includes(selectedMechanic);
      const matchPlayers =
        selectedPlayers === "all" ||
        (g.min_players <= parseInt(selectedPlayers) && g.max_players >= parseInt(selectedPlayers));
      const matchWeight =
        selectedWeight === "all" ||
        (selectedWeight === "light" && g.weight < 2) ||
        (selectedWeight === "medium" && g.weight >= 2 && g.weight < 3.5) ||
        (selectedWeight === "heavy" && g.weight >= 3.5);
      return matchSearch && matchMechanic && matchPlayers && matchWeight;
    })
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "year") return b.year - a.year;
      if (sortBy === "weight") return a.weight - b.weight;
      return 0;
    });

  const getRatingColor = (weight: number) => {
    if (weight < 2) return "#3a6010";
    if (weight < 3.5) return "#a06830";
    return "#9a2010";
  };

  if (isLoading) return <div className="fb-loading">Učitavanje kataloga...</div>;

  return (
    <div>
      <div className="fb-page-header">
        <div>
          <h1 className="fb-page-title">Katalog igara</h1>
          <p className="fb-page-subtitle">{filteredGames.length} naslova pronađeno</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="fb-filter-bar">
        <div className="fb-filter-group fb-search-group">
          <label className="fb-label">Pretraga</label>
          <input
            className="fb-input"
            type="text"
            placeholder="Pretražite igre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="fb-filter-group">
          <label className="fb-label">Mehanika</label>
          <select
            className="fb-select"
            value={selectedMechanic}
            onChange={(e) => setSelectedMechanic(e.target.value)}
          >
            <option value="all">Sve mehanike</option>
            {mechanics.map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="fb-filter-group">
          <label className="fb-label">Broj igrača</label>
          <select
            className="fb-select"
            value={selectedPlayers}
            onChange={(e) => setSelectedPlayers(e.target.value)}
          >
            <option value="all">Svi</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="6">6+</option>
          </select>
        </div>
        <div className="fb-filter-group">
          <label className="fb-label">Težina</label>
          <select
            className="fb-select"
            value={selectedWeight}
            onChange={(e) => setSelectedWeight(e.target.value)}
          >
            <option value="all">Sve težine</option>
            <option value="light">Laka (1-2)</option>
            <option value="medium">Srednja (2-3.5)</option>
            <option value="heavy">Teška (3.5+)</option>
          </select>
        </div>
        <div className="fb-filter-group">
          <label className="fb-label">Sortiraj</label>
          <select
            className="fb-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="title">Naziv A-Z</option>
            <option value="year">Godina ↓</option>
            <option value="weight">Težina ↑</option>
          </select>
        </div>
      </div>

      {/* Grid igara */}
      {filteredGames.length === 0 ? (
        <div className="fb-empty">
          <div className="fb-empty-icon">♟</div>
          <div className="fb-empty-title">Nema pronađenih igara</div>
          <p>Pokušajte sa drugačijim filterima</p>
        </div>
      ) : (
        <div className="fb-grid fb-grid-4">
          {filteredGames.map((game) => (
            <div key={game.id} className="fb-card">
              {/* Slika */}
              <div
                style={{
                  height: "140px",
                  background: "#d4a870",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  borderBottom: "1.5px solid #a06830",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
                onClick={() => navigate(`/games/${game.id}`)}
              >
                {game.cover_image ? (
                  <img
                    src={game.cover_image}
                    alt={game.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <span>♟</span>
                )}
              </div>

              {/* Body */}
              <div className="fb-card-body">
                {/* Mehanike */}
                {game.mechanics && game.mechanics.length > 0 && (
                  <div style={{ fontSize: "0.7rem", color: "#a06830", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: ".3rem" }}>
                    {game.mechanics.slice(0, 2).join(" · ")}
                  </div>
                )}

                {/* Naslov */}
                <h3
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontStyle: "italic", color: "#1e0e04", marginBottom: ".5rem", cursor: "pointer", lineHeight: 1.3 }}
                  onClick={() => navigate(`/games/${game.id}`)}
                >
                  {game.title}
                </h3>

                {/* Meta info */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".5rem", paddingBottom: ".5rem", borderBottom: "1px solid #c8a870" }}>
                  <span style={{ fontSize: ".78rem", color: "#7a4828", fontStyle: "italic" }}>
                    {game.min_players === game.max_players
                      ? `${game.min_players} igrača`
                      : `${game.min_players}-${game.max_players} igrača`} · {game.duration_min}min
                  </span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: ".85rem", fontWeight: 700, color: getRatingColor(game.weight) }}>
                    {game.weight.toFixed(1)}★
                  </span>
                </div>

                {/* Publisher & Year */}
                <div style={{ fontSize: ".75rem", color: "#a07050", marginBottom: ".75rem", fontStyle: "italic" }}>
                  {game.publisher} · {game.year}
                </div>

                {/* Dugmad */}
                <div style={{ display: "flex", gap: ".5rem" }}>
                  <button
                    className="fb-btn fb-btn-ghost fb-btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/games/${game.id}`)}
                  >
                    Detalji
                  </button>
                  {isAuthenticated && (
                    <button
                      className={`fb-btn fb-btn-sm ${collectionIds.includes(game.id) ? "fb-btn-primary" : "fb-btn-ghost"}`}
                      style={{ flex: 1 }}
                      onClick={() => !collectionIds.includes(game.id) && handleAddToCollection(game.id)}
                      disabled={collectionIds.includes(game.id)}
                    >
                      {collectionIds.includes(game.id) ? "✓ Saved" : "+ Kolekcija"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};