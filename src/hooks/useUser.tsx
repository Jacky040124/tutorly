"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, runTransaction } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { User, Teacher, Student } from "../../types/user";
import { Event } from "../../types/event";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  availability: Event[];
  updateAvailability: (newAvailability: Event[]) => Promise<void>;
  fetchStudentData: (studentId: string) => Promise<{ data: User }>;
  updatePrice: (newPrice: number) => Promise<void>;
  updateNickname: (newNickname: string) => Promise<void>;
  updateDescription: (newDescription: string) => Promise<void>;
  updateUserBalance: (newBalance: number) => Promise<void>;
  updateGradeLevel: (newGradeLevel: string) => Promise<void>;
  updateStudentDescription: (newDescription: string) => Promise<void>;
  removeAvailability: (availabilityToRemove: Event) => Promise<void>;
  fetchUserNickname: (userId: string) => Promise<string | null>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<Event[]>([]);

  //TODO: figure out what this useEffect do and whather it is necessary
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          const userData = docSnap.data();

          if (!userData) {
            console.error("No user data found");
            return;
          }

          // Set availability state when user data is loaded
          if (userData.availability) {
            setAvailability(userData.availability);
          }

          if (userData.type === "teacher") {
            setUser({
              email: firebaseUser.email,
              uid: firebaseUser.uid,
              type: "teacher",
              nickname: userData.nickname,
              description: userData.description,
              availability: userData.availability || [],
              pricing: userData.pricing,
            } as Teacher);
          } else if (userData.type === "student") {
            setUser({
              email: firebaseUser.email,
              uid: firebaseUser.uid,
              type: "student",
              nickname: userData.nickname,
              balance: userData.balance,
              academicDetails: userData.academicDetails,
            } as Student);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setAvailability([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  const updatePrice = async (newPrice: number) => {
    if (!user?.uid || user.type !== "teacher") return;
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { pricing: newPrice }, { merge: true });
      setUser((prevUser) => {
        if (!prevUser || prevUser.type !== "teacher") return prevUser;
        return { ...prevUser, pricing: newPrice };
      });
    } catch (error) {
      console.error("Error updating price:", error);
      throw error;
    }
  };

  const updateNickname = async (newNickname: string) => {
    if (!user?.uid) return;
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { nickname: newNickname }, { merge: true });
      setUser((prevUser) => (prevUser ? { ...prevUser, nickname: newNickname } : null));
    } catch (error) {
      console.error("Error updating nickname:", error);
      throw error;
    }
  };

  const updateDescription = async (newDescription: string) => {
    if (!user?.uid || user.type !== "teacher") return;
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { description: newDescription }, { merge: true });
      setUser((prevUser) => {
        if (!prevUser || prevUser.type !== "teacher") return prevUser;
        return { ...prevUser, description: newDescription };
      });
    } catch (error) {
      console.error("Error updating description:", error);
      throw error;
    }
  };

  const updateUserBalance = async (newBalance: number) => {
    if (!user?.uid || user.type !== "student") return;
    try {
      setUser((prevUser) => {
        if (!prevUser || prevUser.type !== "student") return prevUser;
        return { ...prevUser, balance: newBalance };
      });
    } catch (error) {
      console.error("Error updating user balance:", error);
      throw error;
    }
  };

  const updateGradeLevel = async (newGradeLevel: string) => {
    if (!user?.uid || user.type !== "student") return;
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(
        docRef,
        {
          academicDetails: {
            ...user.academicDetails,
            gradeLevel: newGradeLevel,
          },
        },
        { merge: true }
      );
      setUser((prevUser) => {
        if (!prevUser || prevUser.type !== "student") return prevUser;
        return {
          ...prevUser,
          academicDetails: {
            ...prevUser.academicDetails,
            gradeLevel: newGradeLevel,
          },
        };
      });
    } catch (error) {
      console.error("Error updating grade level:", error);
      throw error;
    }
  };

  const updateStudentDescription = async (newDescription: string) => {
    if (!user?.uid || user.type !== "student") return;
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(
        docRef,
        {
          academicDetails: {
            ...user.academicDetails,
            description: newDescription,
          },
        },
        { merge: true }
      );
      setUser((prevUser) => {
        if (!prevUser || prevUser.type !== "student") return prevUser;
        return {
          ...prevUser,
          academicDetails: {
            ...prevUser.academicDetails,
            description: newDescription,
          },
        };
      });
    } catch (error) {
      console.error("Error updating student description:", error);
      throw error;
    }
  };


  const fetchStudentData = async (studentId: string): Promise<{ data: User }> => {
    if (!studentId) {
      throw new Error("Student ID is required");
    }

    try {
      const docRef = doc(db, "users", studentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Student not found");
      }

      const userData = docSnap.data();
      if (userData.type !== "student") {
        throw new Error("User is not a student");
      }

      const data: Student = {
        email: userData.email,
        uid: studentId,
        type: userData.type,
        nickname: userData.nickname,
        balance: userData.balance,
        introduction: userData.introduction,
        interests: userData.interests,
        goals: userData.goals,
        academicDetails: userData.academicDetails || {},
      };

      return { data };
    } catch (error) {
      console.error("Error fetching student data:", error);
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

  const fetchUserNickname = async (userId: string) => {
    if (!userId) return null;

    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.error("User not found:", userId);
        return null;
      }

      const userData = docSnap.data();
      return userData.nickname || userId;
    } catch (error) {
      console.error("Error fetching user nickname:", error);
      return userId;
    }
  };

  const value = {
    user,
    setUser,
    loading,
    availability,
    updateAvailability,
    fetchStudentData,
    updatePrice,
    updateNickname,
    updateDescription,
    updateUserBalance,
    updateGradeLevel,
    updateStudentDescription,
    removeAvailability,
    fetchUserNickname,
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
