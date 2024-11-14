"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, arrayUnion } from '@/lib/firebase'
import { db, auth } from "@/lib/firebase";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState([]);
    const [teacherList, setTeacherList] = useState({});

    useEffect(() => {
        console.log("UserContext mount");
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("Auth state changed:", firebaseUser?.uid);
            
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
                            pricing: userData.pricing
                        });
                    } else if (userData.type === "student") {
                        setUser({
                            email: firebaseUser.email,
                            uid: firebaseUser.uid,
                            type: userData.type,
                            nickname: userData.nickname,
                            balance: userData.balance,
                            bookingHistory: userData.bookingHistory
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

    const signIn = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const docRef = doc(db, "users", userCredential.user.uid);
            const docSnap = await getDoc(docRef);
            const userData = docSnap.data();
            
            setUser({
                email: userCredential.user.email,
                uid: userCredential.user.uid,
                type: userData?.type
            });
            
            setAvailability(userData?.availability || []);
            return { success: true, userData };
        } catch (error) {
            console.error("Error signing in:", error);
            return { success: false, error };
        }
    };

    const updateAvailability = async (newAvailability) => {
        if (!user?.uid) return;
        try {
            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, { availability: newAvailability }, { merge: true });
            setAvailability(newAvailability);
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

    const fetchTeachers = async () => {
        const teachers = {};
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData.type === "teacher") {
                teachers[userData.email] = userData;
            }
        });
        setTeacherList(teachers);
        return teachers;
    };

    const handleBookingConfirmed = async (booking) => {
        try {
            // 1. Create the booking document
            const bookingRef = doc(collection(db, "bookings"));
            await setDoc(bookingRef, booking);

            // 2. Update teacher's availability
            const teacherRef = doc(db, "users", booking.teacherId);
            const teacherDoc = await getDoc(teacherRef);
            const currentAvailability = teacherDoc.data().availability;

            const updatedAvailability = currentAvailability.map(slot => {
                if (isSameDay(slot.date, booking.date) && 
                    slot.startTime <= booking.startTime && 
                    slot.endTime >= booking.endTime) {
                    
                    const newSlots = [];
                    if (slot.startTime < booking.startTime) {
                        newSlots.push({
                            date: slot.date,
                            startTime: slot.startTime,
                            endTime: booking.startTime
                        });
                    }
                    if (slot.endTime > booking.endTime) {
                        newSlots.push({
                            date: slot.date,
                            startTime: booking.endTime,
                            endTime: slot.endTime
                        });
                    }
                    return newSlots;
                }
                return slot;
            }).flat().filter(Boolean);

            await setDoc(teacherRef, { availability: updatedAvailability }, { merge: true });

            // 3. Update student's booking history
            const studentRef = doc(db, "users", booking.studentId);
            await setDoc(studentRef, {
                bookingHistory: arrayUnion(bookingRef.id)
            }, { merge: true });

            return true;
        } catch (error) {
            console.error("Error confirming booking:", error);
            throw error;
        }
    };

    const value = {
        user,
        setUser,
        loading,
        availability,
        updateAvailability,
        signIn,
        teacherList,
        fetchTeachers,
        updatePrice,
        updateNickname,
        updateDescription,
        handleBookingConfirmed,
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