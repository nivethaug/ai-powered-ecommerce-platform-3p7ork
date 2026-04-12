import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/database";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("auth_token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      
      // Verify token is still valid by calling /me endpoint
      authService.me()
        .then((response) => {
          if (response.success && response.data) {
            setUser({
              id: String(response.data.id),
              email: response.data.email,
              name: response.data.name || ""
            });
          } else {
            // Token invalid, clear storage
            localStorage.removeItem("user");
            localStorage.removeItem("auth_token");
            setUser(null);
          }
        })
        .catch(() => {
          // Error verifying token, clear storage
          localStorage.removeItem("user");
          localStorage.removeItem("auth_token");
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || "Login failed");
    }
    
    // Backend returns {token: "..."} - need to fetch user data separately
    const { token } = response.data as { token: string };
    
    // Store token
    localStorage.setItem("auth_token", token);
    
    // Fetch user data using /me endpoint
    const meResponse = await authService.me();
    if (meResponse.success && meResponse.data) {
      const userObj: User = {
        id: String(meResponse.data.id),
        email: meResponse.data.email,
        name: meResponse.data.name || ""
      };
      
      setUser(userObj);
      localStorage.setItem("user", JSON.stringify(userObj));
    } else {
      throw new Error("Failed to fetch user data");
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await authService.register(email, password, name);
    
    if (!response.success) {
      throw new Error(response.error || "Signup failed");
    }
    
    // After successful registration, login automatically
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
