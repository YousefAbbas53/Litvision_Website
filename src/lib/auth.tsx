import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { authApi, getToken, setToken, clearToken } from "./api";

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string; // base64 or URL stored locally
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  updateAvatar: (base64: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // On mount: restore user from localStorage if token exists
  useEffect(() => {
    const savedUser = localStorage.getItem("livision_user");
    const token = getToken();
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("livision_user");
        clearToken();
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const data = await authApi.login({ email, password });
      // Preserve existing avatar if re-logging in with same account
      const existingUser = localStorage.getItem("livision_user");
      let existingAvatar: string | undefined;
      if (existingUser) {
        try {
          const parsed = JSON.parse(existingUser);
          if (parsed.id === String(data.userId)) existingAvatar = parsed.avatarUrl;
        } catch {}
      }
      const userData: User = {
        id: String(data.userId),
        email: data.email,
        name: data.name,
        avatarUrl: existingAvatar,
      };
      setToken(data.token);
      setUser(userData);
      localStorage.setItem("livision_user", JSON.stringify(userData));
      return { success: true };
    } catch (err: any) {
      console.error("Login failed:", err);
      return { success: false, error: err.message || "Invalid email or password" };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const data = await authApi.register({ name, email, password });
      const userData: User = {
        id: String(data.userId),
        email: data.email,
        name: data.name,
      };
      setToken(data.token);
      setUser(userData);
      localStorage.setItem("livision_user", JSON.stringify(userData));
      return { success: true };
    } catch (err: any) {
      console.error("Register failed:", err);
      return { success: false, error: err.message || "Email already exists" };
    }
  };

  const logout = () => {
    setUser(null);
    clearToken();
    localStorage.removeItem("livision_user");
  };

  const updateAvatar = useCallback((base64: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, avatarUrl: base64 };
      localStorage.setItem("livision_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, logout, updateAvatar }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
