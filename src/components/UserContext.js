"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { app, db, auth, doc, setDoc, getDoc, collection, getDocs } from '@/app/firebase'

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
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            type: userData.type
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

    const fetchTeachers = async () => {
        const teachers = {};
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
            teachers[doc.data().email] = doc.data();
        });
        setTeacherList(teachers);
        return teachers;
    };

    const value = {
        user,
        setUser,
        loading,
        availability,
        updateAvailability,
        signIn,
        teacherList,
        fetchTeachers
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