import axios from "axios";
import { Review } from "../../types/reviews/reviewTypes";

const API_URL = import.meta.env.VITE_API_URL;

const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const ReviewsAPIService = {
  async getByGameId(gameId: number): Promise<Review[]> {
    try {
      const response = await axios.get(`${API_URL}/reviews/game/${gameId}`);
      if (response.data.success) return response.data.data as Review[];
      return [];
    } catch {
      return [];
    }
  },

  async create(
    gameId: number, title: string, body: string, rating: number, token: string
  ): Promise<Review | null> {
    try {
      const response = await axios.post(
        `${API_URL}/reviews`,
        { game_id: gameId, title, body, rating },
        authHeader(token)
      );
      if (response.data.success) return response.data.data as Review;
      return null;
    } catch {
      return null;
    }
  },

  async update(
    id: number, gameId: number, title: string, body: string, rating: number, token: string
  ): Promise<Review | null> {
    try {
      const response = await axios.put(
        `${API_URL}/reviews/${id}`,
        { game_id: gameId, title, body, rating },
        authHeader(token)
      );
      if (response.data.success) return response.data.data as Review;
      return null;
    } catch {
      return null;
    }
  },

  async delete(id: number, token: string): Promise<boolean> {
    try {
      const response = await axios.delete(`${API_URL}/reviews/${id}`, authHeader(token));
      return response.data.success;
    } catch {
      return false;
    }
  },
};