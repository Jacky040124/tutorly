"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { doc, setDoc, runTransaction } from "firebase/firestore";
import { db } from "../lib/firebase";
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

  const updateAvailability = async (newAvailability: Event[]) => {
    if (!user?.uid) return;
    try {
      await runTransaction(db, async (transaction) => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await transaction.get(docRef);

        if (!docSnap.exists()) {
          transaction.set(docRef, { availability: newAvailability });
          setAvailability(newAvailability);
        } else {
          const existingAvailability = docSnap.data().availability || [];

          // If it's a repeating event group, remove any existing events with the same repeatGroupId
          const isRepeatingGroup = newAvailability.length > 0 && newAvailability[0].isRepeating;
          let filteredExisting = existingAvailability;

          if (isRepeatingGroup) {
            const repeatGroupId = newAvailability[0].repeatGroupId;
            filteredExisting = existingAvailability.filter((event: Event) => event.repeatGroupId !== repeatGroupId);
          }

          // Combine existing and new events, ensuring uniqueness based on date and time
          const uniqueAvailability = [...filteredExisting, ...newAvailability].filter(
            (event: Event, index: number, self: Event[]) =>
              index ===
              self.findIndex(
                (e: Event) =>
                  e.date.year === event.date.year &&
                  e.date.month === event.date.month &&
                  e.date.day === event.date.day &&
                  e.startTime === event.startTime &&
                  e.endTime === event.endTime
              )
          );

          transaction.update(docRef, { availability: uniqueAvailability });
          setAvailability(uniqueAvailability);
        }
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
