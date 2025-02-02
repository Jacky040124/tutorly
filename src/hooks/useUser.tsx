"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { doc, runTransaction, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from "../services/firebase";
import { User } from "../../types/user";
import { Event } from "../../types/event";
import Loading from "@/app/loading";
import { Teacher } from "../../types/user";

interface UserContextType {
  user: User | null;
  loading: boolean;
  authLoading: boolean;
  setUser: (user: User | null) => void;
  availability: Event[]; // Keep for backwards compatibility
  updateAvailability: (newAvailability: Event[]) => Promise<void>;
  removeAvailability: (availabilityToRemove: Event) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = userDoc.data();
        
        const constructedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          nickname: firebaseUser.displayName || '',
          type: userData?.type || 'student',
          balance: userData?.balance || 0,
          introduction: userData?.introduction || '',
          interests: userData?.interests || [],
          goals: userData?.goals || [],
          availability: (userData?.availability || []).sort((a: Event, b: Event) => {
            const dateA = new Date(a.date.year, a.date.month - 1, a.date.day);
            const dateB = new Date(b.date.year, b.date.month - 1, b.date.day);
            if (dateA.getTime() !== dateB.getTime()) {
              return dateA.getTime() - dateB.getTime();
            }
            return a.startTime - b.startTime;
          }),
        };

        setUser(constructedUser);
        localStorage.setItem('user', JSON.stringify(constructedUser));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setAuthLoading(false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateAvailability = async (newEvents: Event[]) => {
    if (!user || user.type !== 'teacher') return;
    const teacherUser = user as Teacher;

    const updatedUser = {
      ...teacherUser,
      availability: [...teacherUser.availability, ...newEvents].sort((a, b) => {
        const dateA = new Date(a.date.year, a.date.month - 1, a.date.day);
        const dateB = new Date(b.date.year, b.date.month - 1, b.date.day);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        return a.startTime - b.startTime;
      })
    };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    try {
      await runTransaction(db, async (transaction) => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await transaction.get(docRef);
        const firebaseAvailability = docSnap.data()?.availability || [];
        const updatedAvailability = [...firebaseAvailability, ...newEvents];
        
        transaction.set(docRef, { availability: updatedAvailability }, { merge: true });
      });
    } catch (error) {
      setUser(teacherUser);
      localStorage.setItem('user', JSON.stringify(teacherUser));
      console.error("Error updating availability:", error);
      throw error;
    }
  };

  const removeAvailability = async (availabilityToRemove: Event) => {
    if (!availabilityToRemove || !user || user.type !== 'teacher') return;
    const teacherUser = user as Teacher;

    const updatedAvailability = availabilityToRemove.isRepeating 
      ? teacherUser.availability.filter(slot => slot.repeatGroupId !== availabilityToRemove.repeatGroupId)
      : teacherUser.availability.filter(slot => !(
          slot.date.year === availabilityToRemove.date.year &&
          slot.date.month === availabilityToRemove.date.month &&
          slot.date.day === availabilityToRemove.date.day &&
          slot.startTime === availabilityToRemove.startTime &&
          slot.endTime === availabilityToRemove.endTime
        ));

    const updatedUser = {
      ...teacherUser,
      availability: updatedAvailability
    };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    try {
      await runTransaction(db, async (transaction) => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await transaction.get(docRef);
        const currentAvailability = docSnap.data()?.availability || [];
        
        const updatedFirebaseAvailability = availabilityToRemove.isRepeating
          ? currentAvailability.filter((slot: Event) => 
              slot.repeatGroupId !== availabilityToRemove.repeatGroupId)
          : currentAvailability.filter((slot: Event) => !(
              slot.date.year === availabilityToRemove.date.year &&
              slot.date.month === availabilityToRemove.date.month &&
              slot.date.day === availabilityToRemove.date.day &&
              slot.startTime === availabilityToRemove.startTime &&
              slot.endTime === availabilityToRemove.endTime
            ));

        transaction.set(docRef, { availability: updatedFirebaseAvailability }, { merge: true });
      });
    } catch (error) {
      setUser(teacherUser);
      localStorage.setItem('user', JSON.stringify(teacherUser));
      console.error("Error removing availability:", error);
      throw error;
    }
  };

  if (loading || authLoading) {
    return <Loading />;
  }

  const value = {
    user,
    loading,
    authLoading,
    setUser,
    availability: user?.type === 'teacher' ? user.availability : [],
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
