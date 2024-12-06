"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  runTransaction,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState([]);
    const [teacherList, setTeacherList] = useState({});
    const [selectedTeacher, setSelectedTeacher] = useState('');


    //TODO: figure out what this useEffect do and whather it is necessary
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

        if (firebaseUser) {
          try {
            const docRef = doc(db, "users", firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            const userData = docSnap.data();

            if (userData.type === "teacher") {
              setUser({
                email: firebaseUser.email,
                uid: firebaseUser.uid,
                type: userData.type,
                nickname: userData.nickname,
                description: userData.description,
                availability: userData.availability,
                pricing: userData.pricing,
              });
            } else if (userData.type === "student") {
              setUser({
                email: firebaseUser.email,
                uid: firebaseUser.uid,
                type: userData.type,
                nickname: userData.nickname,
                balance: userData.balance,
                bookingHistory: userData.bookingHistory,
              });
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, []);

    const updateAvailability = async (newAvailability) => {
        if (!user?.uid) return;
        try {
            await runTransaction(db, async (transaction) => {
                const docRef = doc(db, "users", user.uid);
                transaction.set(docRef, { availability: newAvailability }, { merge: true });
                setAvailability(newAvailability);
            });
        } catch (error) {
            console.error("Error updating availability:", error);
            throw error;
        }
    };

    const updatePrice = async (newPrice) => {
        if (!user?.uid) return;
        try {
            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, { pricing: newPrice }, { merge: true });
            setUser(prevUser => ({
                ...prevUser,
                pricing: newPrice
            }));
        } catch (error) {
            console.error("Error updating price:", error);
            throw error;
        }
    };

    const updateNickname = async (newNickname) => {
        if (!user?.uid) return;
        try {
            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, { nickname: newNickname }, { merge: true });
            setUser(prevUser => ({
                ...prevUser,
                nickname: newNickname
            }));
        } catch (error) {
            console.error("Error updating nickname:", error);
            throw error;
        }
    };

    const updateDescription = async (newDescription) => {
        if (!user?.uid) return;
        try {
            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, { description: newDescription }, { merge: true });
            setUser(prevUser => ({
                ...prevUser,
                description: newDescription
            }));
        } catch (error) {
            console.error("Error updating description:", error);
            throw error;
        }
    };

    const updateUserBalance = async (newBalance) => {
        if (!user?.uid) return;
        try {
            setUser(prevUser => ({
                ...prevUser,
                balance: newBalance
            }));
        } catch (error) {
            console.error("Error updating user balance:", error);
            throw error;
        }
    };

    const updateGradeLevel = async (newGradeLevel) => {
        if (!user?.uid) return;
        try {
            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, { 
                academicDetails: { 
                    ...user.academicDetails,
                    gradeLevel: newGradeLevel 
                }
            }, { merge: true });
            setUser(prevUser => ({
                ...prevUser,
                academicDetails: {
                    ...prevUser.academicDetails,
                    gradeLevel: newGradeLevel
                }
            }));
        } catch (error) {
            console.error("Error updating grade level:", error);
            throw error;
        }
    };

    const updateStudentDescription = async (newDescription) => {
        if (!user?.uid) return;
        try {
            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, { 
                academicDetails: {
                    ...user.academicDetails,
                    description: newDescription
                }
            }, { merge: true });
            setUser(prevUser => ({
                ...prevUser,
                academicDetails: {
                    ...prevUser.academicDetails,
                    description: newDescription
                }
            }));
        } catch (error) {
            console.error("Error updating student description:", error);
            throw error;
        }
    };

    // fetch a list of all teachers
    const fetchTeachers = async () => {
        const teachers = {};
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData.type === "teacher") {
                teachers[userData.uid] = userData;
            }
        });
        setTeacherList(teachers);
        return teachers;
    };

    const fetchStudentData = async (studentId) => {
        if (!studentId) {
            throw new Error('Student ID is required');
        }

        try {
            const docRef = doc(db, "users", studentId);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                throw new Error('Student not found');
            }

            const userData = docSnap.data();
            if (userData.type !== "student") {
                throw new Error('User is not a student');
            }

            const data = {
              email: userData.email,
              uid: studentId,
              type: userData.type,
              nickname: userData.nickname,
              balance: userData.balance,
              bookingHistory: userData.bookingHistory,
              academicDetails: userData.academicDetails || {},
            };

            return { data };

        } catch (error) {
            console.error("Error fetching student data:", error);
            throw error;
        }
    };

    // helper
    const _removeSingleAvailability = async (availabilityToRemove) => {
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

    const removeAvailability = async (availabilityToRemove) => {
        if (!availabilityToRemove) return;

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
                await _removeSingleAvailability(availabilityToRemove);
            }
        } catch (error) {
            console.error("Error removing availability:", error);
            throw error;
        }
    };

    const fetchUserNickname = async (userId) => {
        if (!userId) return null;
        
        try {
            const docRef = doc(db, "users", userId);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                console.error('User not found:', userId);
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
        teacherList,
        fetchTeachers,
        fetchStudentData,
        updatePrice,
        updateNickname,
        updateDescription,
        selectedTeacher,
        setSelectedTeacher,
        updateUserBalance,
        updateGradeLevel,
        updateStudentDescription,
        removeAvailability,
        fetchUserNickname,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}