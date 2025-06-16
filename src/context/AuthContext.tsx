import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

type JwtPayload = { role?: string;  [key: string]: unknown };

export interface AuthContextType {
  isLoggedIn: boolean;
  isAuthorized: boolean;
  role: string | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const privateKey = localStorage.getItem("private_key");
    const certificate = localStorage.getItem("certificate");
    const accessToken = localStorage.getItem("access_token");

    if (privateKey && certificate) {
      setIsLoggedIn(true);
    }

    if (accessToken) {
      setIsAuthorized(true);
      try {
        const decoded = jwtDecode<JwtPayload>(accessToken);
        setRole(decoded.role || null);
      } catch {
        setRole(null);
      }
    } else {
      setRole(null);
    }
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    setIsAuthorized(true);
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(accessToken);
        setRole(decoded.role || null);
      } catch {
        setRole(null);
      }
    }
  };

  const logout = () => {
    // localStorage.clear();
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setIsAuthorized(false);
    setRole(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isAuthorized, role, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
