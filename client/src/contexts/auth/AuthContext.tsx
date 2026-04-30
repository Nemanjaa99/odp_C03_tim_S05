import { createContext } from "react";
import { AuthUser } from "../../types/auth/authTypes";

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, full_name: string, email: string, password: string, profile_image?: string | null) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);