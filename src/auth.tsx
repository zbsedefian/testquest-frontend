// auth.tsx
import React, { useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext, useAuth } from "./auth-context";
import type { User } from "./types";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const setAndStoreUser = (newUser: User | null) => {
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
    setUser(newUser);
  };

  const logout = () => {
    setAndStoreUser(null);
  };

  return (
    <UserContext.Provider
      value={{ user, setUser: setAndStoreUser, logout }}
    >
      {children}
    </UserContext.Provider>
  );
}


export function RequireAuth({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
