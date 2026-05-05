import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export interface UserGameEntry {
  user_id: number;
  game_id: number;
  status: "owned" | "wishlist" | "previously_owned";
  personal_rating: number | null;
  notes: string | null;
  added_at?: string;
  game?: {
    id: number;
    title: string;
    cover_image: string | null;
    min_players: number;
    max_players: number;
    duration_min: number;
    weight: number;
    year: number;
    publisher: string;
    mechanics: string[];
  };
}

export const CollectionAPIService = {
  async getMyCollection(token: string): Promise<UserGameEntry[]> {
    try {
      const response = await axios.get(`${API_URL}/collection`, authHeader(token));
      if (response.data.success) return response.data.data as UserGameEntry[];
      return [];
    } catch {
      return [];
    }
  },

  async addGame(
    gameId: number, status: string, personalRating: number | null,
    notes: string | null, token: string
  ): Promise<UserGameEntry | null> {
    try {
      const response = await axios.post(
        `${API_URL}/collection`,
        { game_id: gameId, status, personal_rating: personalRating, notes },
        authHeader(token)
      );
      if (response.data.success) return response.data.data as UserGameEntry;
      return null;
    } catch {
      return null;
    }
  },

  async updateGame(
    gameId: number, status: string, personalRating: number | null,
    notes: string | null, token: string
  ): Promise<UserGameEntry | null> {
    try {
      const response = await axios.put(
        `${API_URL}/collection/${gameId}`,
        { status, personal_rating: personalRating, notes },
        authHeader(token)
      );
      if (response.data.success) return response.data.data as UserGameEntry;
      return null;
    } catch {
      return null;
    }
  },

  async removeGame(gameId: number, token: string): Promise<boolean> {
    try {
      const response = await axios.delete(`${API_URL}/collection/${gameId}`, authHeader(token));
      return response.data.success;
    } catch {
      return false;
    }
  },
};