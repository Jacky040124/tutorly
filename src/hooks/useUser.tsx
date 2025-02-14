"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { doc, runTransaction, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../services/firebase";
import { Teacher, isTeacher } from "../../types/teacher";
import { Student } from "../../types/student";
import { Event } from "../../types/event";

interface UserContextType {
  user: Student | Teacher | null;
  setUser: (user: Student | Teacher | null) => void;
  updateEvents: (newEvents: Event[]) => Promise<void>;
  removeEvents: (eventToRemove: Event) => Promise<void>;
  events: Event[];
}
// TODO: refactor useUser to detach teacher and studnet logic
const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Student | Teacher | null>(null);

  const updateEvents = async (newEvents: Event[]) => {
    if (!user || user.type !== "teacher") return;
    const teacherUser = user as Teacher;

    const updatedUser = {
      ...teacherUser,
      events: [...teacherUser.events, ...newEvents].sort((a, b) => {
        const dateA = new Date(a.date.year, a.date.month - 1, a.date.day);
        const dateB = new Date(b.date.year, b.date.month - 1, b.date.day);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        return a.startTime - b.startTime;
      }),
    };

    setUser(updatedUser);

    try {
      await runTransaction(db, async (transaction) => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await transaction.get(docRef);
        const firebaseEvents = docSnap.data()?.events || [];
        const updatedEvents = [...firebaseEvents, ...newEvents];

        transaction.set(docRef, { events: updatedEvents }, { merge: true });
      });
    } catch (error) {
      setUser(teacherUser);
      console.error("Error updating events:", error);
      throw error;
    }
  };

  const removeEvents = async (eventToRemove: Event) => {
    if (!eventToRemove || !user || user.type !== "teacher") return;
    const teacherUser = user as Teacher;

    const updatedEvents = eventToRemove.isRecurring
      ? teacherUser.events.filter((slot) => slot.repeatGroupId !== eventToRemove.repeatGroupId)
      : teacherUser.events.filter(
          (slot) =>
            !(
              slot.date.year === eventToRemove.date.year &&
              slot.date.month === eventToRemove.date.month &&
              slot.date.day === eventToRemove.date.day &&
              slot.startTime === eventToRemove.startTime &&
              slot.endTime === eventToRemove.endTime
            )
        );

    const updatedUser = {
      ...teacherUser,
      events: updatedEvents,
    };

    setUser(updatedUser);

    try {
      await runTransaction(db, async (transaction) => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await transaction.get(docRef);
        const currentEvents = docSnap.data()?.events || [];

        const updatedFirebaseEvents = availabilityToRemove.isRepeating
          ? currentEvents.filter((slot: Event) => slot.repeatGroupId !== availabilityToRemove.repeatGroupId)
          : currentEvents.filter(
              (slot: Event) =>
                !(
                  slot.date.year === availabilityToRemove.date.year &&
                  slot.date.month === availabilityToRemove.date.month &&
                  slot.date.day === availabilityToRemove.date.day &&
                  slot.startTime === availabilityToRemove.startTime &&
                  slot.endTime === availabilityToRemove.endTime
                )
            );

        transaction.set(docRef, { events: updatedFirebaseEvents }, { merge: true });
      });
    } catch (error) {
      setUser(teacherUser);
      console.error("Error removing events:", error);
      throw error;
    }
  };

  const value = {
    user,
    setUser,
    updateEvents,
    removeEvents,
    events: [],
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
