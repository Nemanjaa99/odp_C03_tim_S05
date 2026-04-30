import { ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { useAuthHook } from "../../hooks/auth/useAuthHook";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthHook();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};