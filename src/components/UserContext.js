"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { app, db, auth, doc, setDoc, getDoc } from '@/app/firebase'

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // Get additional user data from Firestore if needed
                setUser({
                    email: firebaseUser.email,
                    uid: firebaseUser.uid,
                    // You might want to fetch type from Firestore here
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {user, setUser, loading};

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

    // Get user data from Firestore
    // const docRef = doc(db, "users", userCredential.user.uid);
    // const docSnap = await getDoc(docRef);
    return context;
}