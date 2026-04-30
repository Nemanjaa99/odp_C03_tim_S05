import axios from "axios";
import { LoginRequest, RegisterRequest } from "../../types/auth/authTypes";

const API_URL = import.meta.env.VITE_API_URL;

export const AuthAPIService = {
  async login(data: LoginRequest): Promise<string | null> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, data);
      if (response.data.success) return response.data.data as string;
      return null;
    } catch {
      return null;
    }
  },

  async register(data: RegisterRequest): Promise<string | null> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);
      if (response.data.success) return response.data.data as string;
      return null;
    } catch {
      return null;
    }
  },

  async logout(token: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // tiha greška
    }
  },
};