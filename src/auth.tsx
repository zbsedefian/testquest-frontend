import React, { createContext, useContext, ReactNode } from "react";
import { Navigate } from "react-router-dom";

export interface User {
  username: string;
  role: "student" | "teacher" | "admin";
  id: number;
  setUser?: React.Dispatch<React.SetStateAction<User | null>>;
}

export const UserContext = createContext<User | null>(null);

export function useAuth() {
  return useContext(UserContext);
}

interface RequireAuthProps {
  allowedRoles: User["role"][];
  children: ReactNode;
}

export function RequireAuth({ allowedRoles, children }: RequireAuthProps) {
  const user = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
