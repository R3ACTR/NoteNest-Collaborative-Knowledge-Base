"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type UserRole, isValidRole } from "@/lib/permissions";

const STORAGE_KEY = "notenest-user-role";
const DEFAULT_ROLE: UserRole = "editor";

function readStoredRole(): UserRole {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && isValidRole(raw)) return raw as UserRole;
  } catch {
    // ignore
  }
  return DEFAULT_ROLE;
}

interface UserRoleContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const UserRoleContext = createContext<UserRoleContextValue | null>(null);

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(DEFAULT_ROLE);

  useEffect(() => {
    setRoleState(readStoredRole());
  }, []);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem(STORAGE_KEY, newRole);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<UserRoleContextValue>(() => ({ role, setRole }), [role, setRole]);

  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>;
}

export function useUserRole(): UserRoleContextValue {
  const ctx = useContext(UserRoleContext);
  if (!ctx) {
    throw new Error("useUserRole must be used within UserRoleProvider");
  }
  return ctx;
}
