"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { doc, runTransaction } from "firebase/firestore";
import { db } from "../services/firebase";
import { User } from "../../types/user";
import { Event } from "../../types/event";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  availability: Event[];
  updateAvailability: (newAvailability: Event[]) => Promise<void>;
  removeAvailability: (availabilityToRemove: Event) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [availability, setAvailability] = useState<Event[]>([]);

  const updateAvailability = async (newEvents: Event[]) => {
    if (!user) return;

    try {
      await runTransaction(db, async (transaction) => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await transaction.get(docRef);
        const firebaseAvailability = docSnap.data()?.availability || [];
        const updatedAvailability = [...firebaseAvailability, ...newEvents];
        console.log(updatedAvailability);
        
        transaction.set(docRef, { availability: updatedAvailability }, { merge: true });
        setAvailability(updatedAvailability);
        
      });
    } catch (error) {
      console.error("Error updating availability:", error);
      throw error;
    }
  };

  const _removeSingleAvailability = async (availabilityToRemove: Event) => {
    console.log("availabilityToRemove:", availabilityToRemove);
    if (user == null) return;
    try {
      await runTransaction(db, async (transaction) => {
        const docRef = doc(db, "users", user.uid);
        const updatedAvailability = availability.filter((slot) => {
          return !(
            slot.date.year === availabilityToRemove.date.year &&
            slot.date.month === availabilityToRemove.date.month &&
            slot.date.day === availabilityToRemove.date.day &&
            slot.startTime === availabilityToRemove.startTime &&
            slot.endTime === availabilityToRemove.endTime
          );
        });
        transaction.set(docRef, { availability: updatedAvailability }, { merge: true });
        setAvailability(updatedAvailability);
      });
    } catch (error) {
      console.error("Error removing single availability:", error);
      throw error;
    }
  };

  const removeAvailability = async (availabilityToRemove: Event) => {
    console.log("removeAvailability going on");
    if (!availabilityToRemove) return;
    if (!user) return;

    try {
      if (availabilityToRemove.isRepeating && availabilityToRemove.repeatGroupId) {
        // Remove all availability slots with the same repeatGroupId
        await runTransaction(db, async (transaction) => {
          const docRef = doc(db, "users", user.uid);
          const updatedAvailability = availability.filter(
            (slot) => slot.repeatGroupId !== availabilityToRemove.repeatGroupId
          );
          transaction.set(docRef, { availability: updatedAvailability }, { merge: true });
          setAvailability(updatedAvailability);
        });
      } else {
        console.log("in");
        await _removeSingleAvailability(availabilityToRemove);
      }
    } catch (error) {
      console.error("Error removing availability:", error);
      throw error;
    }
  };

  const value = {
    user,
    setUser,
    availability,
    updateAvailability,
    removeAvailability,
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
