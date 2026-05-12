import { useState, useEffect } from "react";
import { Session } from "../../types/sessions/sessionTypes";
import { SessionsAPIService } from "../../api_services/sessions/SessionsAPIService";
import { CollectionAPIService, UserGameEntry } from "../../api_services/collection/CollectionAPIService";
import { useAuth } from "../../hooks/auth/useAuth";

export const SessionsPage = () => {
  const { token, user } = useAuth();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [collection, setCollection] = useState<UserGameEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create forma
  const [createGameId, setCreateGameId] = useState<number>(0);
  const [createDate, setCreateDate] = useState(new Date().toISOString().split("T")[0]);
  const [createDuration, setCreateDuration] = useState(60);
  const [createNotes, setCreateNotes] = useState("");
  const [createError, setCreateError] = useState("");

  // Dodavanje učesnika
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: number; username: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setIsLoading(true);
      const [sessionsData, collectionData] = await Promise.all([
        SessionsAPIService.getMySessions(token),
        CollectionAPIService.getMyCollection(token),
      ]);
      setSessions(sessionsData);
      setCollection(collectionData);
      setIsLoading(false);
    };
    fetchData();
  }, [token]);

  const handleCreate = async () => {
    setCreateError("");
    if (!createGameId) { setCreateError("Odaberite igru."); return; }
    if (!createDate) { setCreateError("Datum je obavezan."); return; }
    if (!token) return;

    const result = await SessionsAPIService.create(
      createGameId, createDate, createDuration, createNotes || null, token
    );
    if (result) {
      setSessions((prev) => [result, ...prev]);
      setShowCreateForm(false);
      setCreateGameId(0);
      setCreateDate(new Date().toISOString().split("T")[0]);
      setCreateDuration(60);
      setCreateNotes("");
      setSelectedSession(result);
    } else {
      setCreateError("Greška pri kreiranju sesije.");
    }
  };

  const handleDelete = async (sessionId: number) => {
    if (!token) return;
    const success = await SessionsAPIService.delete(sessionId, token);
    if (success) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (selectedSession?.id === sessionId) setSelectedSession(null);
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchUsername(query);
    if (!token || query.length < 2) { setSearchResults([]); return; }
    const results = await SessionsAPIService.searchUsers(query, token);
    setSearchResults(results.filter((u) => u.id !== user?.id));
  };

  const handleAddPlayer = async (userId: number) => {
    if (!token || !selectedSession) return;
    const success = await SessionsAPIService.addPlayer(selectedSession.id, userId, token);
    if (success) {
      const updated = await SessionsAPIService.getById(selectedSession.id, token);
      if (updated) {
        setSelectedSession(updated);
        setSessions((prev) => prev.map((s) => s.id === updated.id ? updated : s));
      }
    }
    setSearchUsername("");
    setSearchResults([]);
  };

  const handleUpdatePlayer = async (userId: number, score: number | null, winner: boolean) => {
    if (!token || !selectedSession) return;
    await SessionsAPIService.updatePlayer(selectedSession.id, userId, score, winner, token);
    const updated = await SessionsAPIService.getById(selectedSession.id, token);
    if (updated) {
      setSelectedSession(updated);
      setSessions((prev) => prev.map((s) => s.id === updated.id ? updated : s));
    }
  };

  const handleRemovePlayer = async (userId: number) => {
    if (!token || !selectedSession || userId === selectedSession.creator_id) return;
    await SessionsAPIService.removePlayer(selectedSession.id, userId, token);
    const updated = await SessionsAPIService.getById(selectedSession.id, token);
    if (updated) {
      setSelectedSession(updated);
      setSessions((prev) => prev.map((s) => s.id === updated.id ? updated : s));
    }
  };

  if (isLoading) return <div className="fb-loading">Učitavanje sesija...</div>;

  return (
    <div>
      <div className="fb-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="fb-page-title">Moje sesije</h1>
          <p className="fb-page-subtitle">{sessions.length} sesija evidentirano</p>
        </div>
        <button className="fb-btn fb-btn-primary" onClick={() => { setShowCreateForm(true); setSelectedSession(null); }}>
          + Nova sesija
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem", alignItems: "start" }}>

        {/* Lista sesija */}
        <div>
          {sessions.length === 0 && !showCreateForm ? (
            <div className="fb-empty">
              <div className="fb-empty-icon">🎲</div>
              <div className="fb-empty-title">Nema sesija</div>
              <p style={{ fontStyle: "italic", marginBottom: "1rem" }}>Evidentirajte vašu prvu partiju</p>
              <button className="fb-btn fb-btn-primary" onClick={() => setShowCreateForm(true)}>+ Nova sesija</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
              {sessions.map((session) => (
                <div key={session.id}
                  style={{ background: selectedSession?.id === session.id ? "#d4a870" : "#e8d0b0", border: `1.5px solid ${selectedSession?.id === session.id ? "#7a4010" : "#c8a870"}`, borderLeft: `3px solid ${selectedSession?.id === session.id ? "#7a4010" : "#a06830"}`, borderRadius: "4px", padding: ".85rem 1rem", cursor: "pointer", transition: "all .15s" }}
                  onClick={() => { setSelectedSession(session); setShowCreateForm(false); }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: ".9rem", fontStyle: "italic", color: "#1e0e04", marginBottom: ".2rem" }}>
                        {session.game_title}
                      </div>
                      <div style={{ fontSize: ".75rem", color: "#7a4828" }}>
                        {new Date(session.played_at).toLocaleDateString("sr-RS")} · {session.duration_min}min
                      </div>
                      <div style={{ fontSize: ".72rem", color: "#a07050", marginTop: ".2rem" }}>
                        {session.players?.length ?? 0} učesnika
                      </div>
                    </div>
                    {session.creator_id === user?.id && (
                      <button className="fb-btn fb-btn-danger fb-btn-sm"
                        onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }}>
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desna strana - detalji ili forma */}
        <div>
          {/* Forma za kreiranje */}
          {showCreateForm && (
            <div style={{ background: "#e8d0b0", border: "1.5px solid #a06830", borderTop: "3px solid #7a4010", borderRadius: "6px", padding: "1.5rem" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontStyle: "italic", color: "#7a4010", marginBottom: "1.25rem" }}>
                Nova sesija
              </h3>
              {createError && <div className="fb-alert fb-alert-error" style={{ marginBottom: "1rem" }}>{createError}</div>}
              <div className="fb-form">
                <div className="fb-form-group">
                  <label className="fb-label">Igra (iz vaše kolekcije)</label>
                  <select className="fb-select" value={createGameId} onChange={(e) => setCreateGameId(parseInt(e.target.value))}>
                    <option value={0}>Odaberite igru...</option>
                    {collection.filter((ug) => ug.status === "owned").map((ug) => (
                      <option key={ug.game_id} value={ug.game_id}>{ug.game?.title}</option>
                    ))}
                  </select>
                </div>
                <div className="fb-form-group">
                  <label className="fb-label">Datum</label>
                  <input className="fb-input" type="date" value={createDate}
                    onChange={(e) => setCreateDate(e.target.value)} />
                </div>
                <div className="fb-form-group">
                  <label className="fb-label">Trajanje (minuta)</label>
                  <input className="fb-input" type="number" min={1} value={createDuration}
                    onChange={(e) => setCreateDuration(parseInt(e.target.value))} />
                </div>
                <div className="fb-form-group">
                  <label className="fb-label">Beleška (opciono)</label>
                  <textarea className="fb-textarea" value={createNotes}
                    onChange={(e) => setCreateNotes(e.target.value)} rows={2} placeholder="Zanimljivi momenti iz partije..." />
                </div>
                <div style={{ display: "flex", gap: ".75rem", justifyContent: "flex-end" }}>
                  <button className="fb-btn fb-btn-ghost" onClick={() => setShowCreateForm(false)}>Otkaži</button>
                  <button className="fb-btn fb-btn-primary" onClick={handleCreate}>Kreiraj sesiju</button>
                </div>
              </div>
            </div>
          )}

          {/* Detalji sesije */}
          {selectedSession && !showCreateForm && (
            <div style={{ background: "#e8d0b0", border: "1.5px solid #a06830", borderTop: "3px solid #7a4010", borderRadius: "6px", padding: "1.5rem" }}>
              <div style={{ marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1.5px solid #c8a870" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontStyle: "italic", color: "#1e0e04", marginBottom: ".4rem" }}>
                  {selectedSession.game_title}
                </h3>
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: ".82rem", color: "#7a4828" }}>📅 {new Date(selectedSession.played_at).toLocaleDateString("sr-RS")}</span>
                  <span style={{ fontSize: ".82rem", color: "#7a4828" }}>⏱ {selectedSession.duration_min} min</span>
                  <span style={{ fontSize: ".82rem", color: "#7a4828" }}>👥 {selectedSession.players?.length ?? 0} igrača</span>
                </div>
                {selectedSession.notes && (
                  <p style={{ fontSize: ".85rem", color: "#7a4828", fontStyle: "italic", marginTop: ".6rem" }}>
                    "{selectedSession.notes}"
                  </p>
                )}
              </div>

              {/* Učesnici */}
              <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontStyle: "italic", color: "#7a4010", marginBottom: ".85rem" }}>
                Učesnici
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", marginBottom: "1.25rem" }}>
                {(selectedSession.players ?? []).map((player) => (
                  <div key={player.user_id} style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".6rem .85rem", background: "#f0e0c8", border: "1px solid #c8a870", borderRadius: "4px" }}>
                    <span style={{ flex: 1, fontSize: ".85rem", fontWeight: 600, color: "#1e0e04" }}>
                      {player.winner && "🏆 "}{player.username}
                      {player.user_id === selectedSession.creator_id && <span style={{ fontSize: ".7rem", color: "#a06830", marginLeft: ".4rem" }}>(kreator)</span>}
                    </span>
                    <input
                      type="number"
                      placeholder="Poeni"
                      value={player.score ?? ""}
                      onChange={(e) => handleUpdatePlayer(player.user_id, e.target.value ? parseInt(e.target.value) : null, player.winner)}
                      style={{ width: "70px", padding: ".3rem .5rem", background: "#f0e0c8", border: "1px solid #c8a870", borderRadius: "3px", fontSize: ".82rem", color: "#1e0e04" }}
                    />
                    <input
                      type="checkbox"
                      checked={player.winner}
                      onChange={(e) => handleUpdatePlayer(player.user_id, player.score, e.target.checked)}
                      title="Pobednik"
                    />
                    {player.user_id !== selectedSession.creator_id && user?.id === selectedSession.creator_id && (
                      <button className="fb-btn fb-btn-danger fb-btn-sm" onClick={() => handleRemovePlayer(player.user_id)}>✕</button>
                    )}
                  </div>
                ))}
              </div>

              {/* Dodaj učesnika */}
              {user?.id === selectedSession.creator_id && (
                <div>
                  <div style={{ position: "relative" }}>
                    <input
                      className="fb-input"
                      type="text"
                      placeholder="Pretraži korisnika po imenu..."
                      value={searchUsername}
                      onChange={(e) => handleSearchUsers(e.target.value)}
                    />
                    {searchResults.length > 0 && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#e8d0b0", border: "1.5px solid #a06830", borderRadius: "4px", zIndex: 10, marginTop: ".25rem" }}>
                        {searchResults.map((u) => (
                          <div key={u.id}
                            style={{ padding: ".6rem 1rem", cursor: "pointer", borderBottom: "1px solid #c8a870", fontSize: ".9rem", color: "#1e0e04" }}
                            onClick={() => handleAddPlayer(u.id)}>
                            ✦ {u.username}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {!selectedSession && !showCreateForm && sessions.length > 0 && (
            <div className="fb-empty">
              <div className="fb-empty-icon" style={{ fontSize: "2rem" }}>👈</div>
              <div className="fb-empty-title">Odaberite sesiju</div>
              <p style={{ fontStyle: "italic" }}>Kliknite na sesiju da vidite detalje</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};