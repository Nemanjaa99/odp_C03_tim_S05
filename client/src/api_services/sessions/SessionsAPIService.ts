import axios from "axios";
import { Session } from "../../types/sessions/sessionTypes";

const API_URL = import.meta.env.VITE_API_URL;

const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const SessionsAPIService = {
  async getMySessions(token: string): Promise<Session[]> {
    try {
      const response = await axios.get(`${API_URL}/sessions`, authHeader(token));
      if (response.data.success) return response.data.data as Session[];
      return [];
    } catch { return []; }
  },

  async getById(id: number, token: string): Promise<Session | null> {
    try {
      const response = await axios.get(`${API_URL}/sessions/${id}`, authHeader(token));
      if (response.data.success) return response.data.data as Session;
      return null;
    } catch { return null; }
  },

  async create(gameId: number, playedAt: string, durationMin: number, notes: string | null, token: string): Promise<Session | null> {
    try {
      const response = await axios.post(`${API_URL}/sessions`,
        { game_id: gameId, played_at: playedAt, duration_min: durationMin, notes },
        authHeader(token));
      if (response.data.success) return response.data.data as Session;
      return null;
    } catch { return null; }
  },

  async update(id: number, playedAt: string, durationMin: number, notes: string | null, token: string): Promise<Session | null> {
    try {
      const response = await axios.put(`${API_URL}/sessions/${id}`,
        { played_at: playedAt, duration_min: durationMin, notes },
        authHeader(token));
      if (response.data.success) return response.data.data as Session;
      return null;
    } catch { return null; }
  },

  async delete(id: number, token: string): Promise<boolean> {
    try {
      const response = await axios.delete(`${API_URL}/sessions/${id}`, authHeader(token));
      return response.data.success;
    } catch { return false; }
  },

  async addPlayer(sessionId: number, userId: number, token: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/sessions/${sessionId}/players`,
        { user_id: userId }, authHeader(token));
      return response.data.success;
    } catch { return false; }
  },

  async updatePlayer(sessionId: number, userId: number, score: number | null, winner: boolean, token: string): Promise<boolean> {
    try {
      const response = await axios.patch(
        `${API_URL}/sessions/${sessionId}/players/${userId}`,
        { score, winner }, authHeader(token));
      return response.data.success;
    } catch { return false; }
  },

  async removePlayer(sessionId: number, userId: number, token: string): Promise<boolean> {
    try {
      const response = await axios.delete(
        `${API_URL}/sessions/${sessionId}/players/${userId}`, authHeader(token));
      return response.data.success;
    } catch { return false; }
  },

  async searchUsers(username: string, token: string): Promise<{ id: number; username: string }[]> {
    try {
      const response = await axios.get(`${API_URL}/users/all`, authHeader(token));
      if (response.data.success) {
        return (response.data.data as { id: number; username: string }[])
          .filter((u) => u.username.toLowerCase().includes(username.toLowerCase()))
          .slice(0, 5);
      }
      return [];
    } catch { return []; }
  },
};