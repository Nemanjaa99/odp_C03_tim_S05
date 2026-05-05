import axios from "axios";
import { Game } from "../../types/games/gameTypes";

const API_URL = import.meta.env.VITE_API_URL;

const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const GamesAPIService = {
  async getAll(): Promise<Game[]> {
    try {
      const response = await axios.get(`${API_URL}/games`);
      if (response.data.success) return response.data.data as Game[];
      return [];
    } catch {
      return [];
    }
  },

  async getById(id: number): Promise<Game | null> {
    try {
      const response = await axios.get(`${API_URL}/games/${id}`);
      if (response.data.success) return response.data.data as Game;
      return null;
    } catch {
      return null;
    }
  },

  async create(game: Omit<Game, "id" | "created_at">, mechanicIds: number[], token: string): Promise<Game | null> {
    try {
      const response = await axios.post(
        `${API_URL}/games`,
        { ...game, mechanic_ids: mechanicIds },
        authHeader(token)
      );
      if (response.data.success) return response.data.data as Game;
      return null;
    } catch {
      return null;
    }
  },

  async update(id: number, game: Omit<Game, "id" | "created_at">, mechanicIds: number[], token: string): Promise<Game | null> {
    try {
      const response = await axios.put(
        `${API_URL}/games/${id}`,
        { ...game, mechanic_ids: mechanicIds },
        authHeader(token)
      );
      if (response.data.success) return response.data.data as Game;
      return null;
    } catch {
      return null;
    }
  },

  async delete(id: number, token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${API_URL}/games/${id}`, authHeader(token));
      return { success: response.data.success, message: response.data.message };
    } catch {
      return { success: false, message: "Greška pri brisanju igre." };
    }
  },
};