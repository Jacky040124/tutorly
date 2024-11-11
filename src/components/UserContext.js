"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { app, db, auth, doc, setDoc, getDoc } from '@/app/firebase'

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setAvailability([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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

    const value = {
        user,
        setUser,
        loading,
        availability,
        updateAvailability
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