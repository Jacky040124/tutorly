"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Teacher } from "@/types/teacher";
import { Student } from "@/types/student";
import { Event } from "@/types/event";

interface UserContextType {
  user: Student | Teacher | null;
  setUser: (user: Student | Teacher | null) => void;
  events: Event[];
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Student | Teacher | null>(null);

  const value = {user, setUser, events: []};

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
