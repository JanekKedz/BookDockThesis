import React, { createContext, useContext, useState, ReactNode } from "react";

type User = {
  email: string;
  role: string;
  id: number;
};


type AuthContextType = {
  user: User | null;
  email: string;
  setUser: (user: User | null) => void;
  setEmail: (email: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string>("");

  return (
    <AuthContext.Provider value={{ user, setUser, email, setEmail }}>
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