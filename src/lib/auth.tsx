import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("livision_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("livision_users") || "[]");
    const foundUser = users.find(
      (u: { email: string; password: string }) => u.email === email && u.password === password
    );
    
    if (foundUser) {
      const userData = { id: foundUser.id, email: foundUser.email, name: foundUser.name };
      setUser(userData);
      localStorage.setItem("livision_user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("livision_users") || "[]");
    const exists = users.find((u: { email: string }) => u.email === email);
    
    if (exists) {
      return false;
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
    };

    users.push(newUser);
    localStorage.setItem("livision_users", JSON.stringify(users));
    
    const userData = { id: newUser.id, email: newUser.email, name: newUser.name };
    setUser(userData);
    localStorage.setItem("livision_user", JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("livision_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
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
