import axios from "axios";
import { Mechanic } from "../../types/mechanics/mechanicTypes";

const API_URL = import.meta.env.VITE_API_URL;

const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const MechanicsAPIService = {
  async getAll(): Promise<Mechanic[]> {
    try {
      const response = await axios.get(`${API_URL}/mechanics`);
      if (response.data.success) return response.data.data as Mechanic[];
      return [];
    } catch {
      return [];
    }
  },

  async create(name: string, token: string): Promise<Mechanic | null> {
    try {
      const response = await axios.post(`${API_URL}/mechanics`, { name }, authHeader(token));
      if (response.data.success) return response.data.data as Mechanic;
      return null;
    } catch {
      return null;
    }
  },

  async delete(id: number, token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${API_URL}/mechanics/${id}`, authHeader(token));
      return { success: response.data.success, message: response.data.message };
    } catch {
      return { success: false, message: "Greška pri brisanju mehanike." };
    }
  },
};