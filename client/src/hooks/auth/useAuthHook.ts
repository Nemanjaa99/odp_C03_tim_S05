import { useState, useEffect } from "react";
import { AuthUser } from "../../types/auth/authTypes";
import { AuthAPIService } from "../../api_services/auth/AuthAPIService";
import { AuthContextType } from "../../contexts/auth/AuthContext";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  id: number;
  username: string;
  role: string;
}

export const useAuthHook = (): AuthContextType => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("forgeboard_token");
    if (storedToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(storedToken);
        setUser({ id: decoded.id, username: decoded.username, role: decoded.role });
        setToken(storedToken);
      } catch {
        localStorage.removeItem("forgeboard_token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const receivedToken = await AuthAPIService.login({ username, password });
    if (receivedToken) {
      const decoded = jwtDecode<JwtPayload>(receivedToken);
      setUser({ id: decoded.id, username: decoded.username, role: decoded.role });
      setToken(receivedToken);
      localStorage.setItem("forgeboard_token", receivedToken);
      return true;
    }
    return false;
  };

  const register = async (
    username: string, full_name: string, email: string,
    password: string, profile_image?: string | null
  ): Promise<boolean> => {
    const receivedToken = await AuthAPIService.register({ username, full_name, email, password, profile_image });
    if (receivedToken) {
      const decoded = jwtDecode<JwtPayload>(receivedToken);
      setUser({ id: decoded.id, username: decoded.username, role: decoded.role });
      setToken(receivedToken);
      localStorage.setItem("forgeboard_token", receivedToken);
      return true;
    }
    return false;
  };

  const logout = async (): Promise<void> => {
    if (token) await AuthAPIService.logout(token);
    setUser(null);
    setToken(null);
    localStorage.removeItem("forgeboard_token");
  };

  return {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };
};