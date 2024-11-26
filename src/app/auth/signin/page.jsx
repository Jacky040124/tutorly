"use client"

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useUser } from '@/components/providers/UserContext';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { TextField } from '@/components/common/Fields';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { user, setUser } = useUser();

    // Auto-fill from verification flow
    useEffect(() => {
        const savedEmail = window.localStorage.getItem("emailForSignIn");
        const savedPassword = window.localStorage.getItem("tempPassword");
        
        if (savedEmail) {
            setEmail(savedEmail);
        }
        if (savedPassword) {
            setPassword(savedPassword);
            // Clean up after using
            window.localStorage.removeItem("tempPassword");
        }
    }, []);

    const handleSignIn = async (e) => {
        e.preventDefault(); // Prevent form submission
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Sign-in successful:', userCredential.user.uid);
            
            // Get user data from Firestore
            const docRef = doc(db, "users", userCredential.user.uid);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                setError("User data not found");
                return;
            }
            
            const userData = docSnap.data();
            console.log('User data from Firestore:', userData);
            
            // Update user context based on user type
            if (userData.type === "teacher") {
                setUser({
                    email: userCredential.user.email,
                    uid: userCredential.user.uid,
                    type: userData.type,
                    nickname: userData.nickname,
                    description: userData.description,
                    availability: userData.availability,
                    pricing: userData.pricing
                });
            } else if (userData.type === "student") {
                setUser({
                    email: userCredential.user.email,
                    uid: userCredential.user.uid,
                    type: userData.type,
                    nickname: userData.nickname,
                    balance: userData.balance,
                    bookingHistory: userData.bookingHistory
                });
            }

            // Handle navigation after successful sign-in
            if (userData.type === "teacher") {
                router.replace("/dashboard/user/teacher");
            } else if (userData.type === "student") {
                router.replace("/dashboard/user/student");
            }
            
        } catch (error) {
            console.error('Sign-in error:', error);
            setError(error.message || "Sign in failed");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-container">
                <div className="auth-form">
                    <div className="absolute top-4 left-4">
                        <Link href="/" aria-label="Home">
                            <Button variant="outline" color="slate" className="overlay-button-secondary">
                                ← Back to home
                            </Button>
                        </Link>
                    </div>

                    <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                        <div>
                            <h2 className="text-3xl font-bold">Sign in to your account</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Don&apos;t have an account?{' '}
                                <Link href="/auth/signup" className="font-medium text-green-600 hover:text-green-500">
                                    Sign up
                                </Link>{' '}
                                for a free trial.
                            </p>
                        </div>

                        <div className="mt-8">
                            <form onSubmit={handleSignIn} className="space-y-6">
                                <TextField
                                    label="Email address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <TextField
                                    label="Password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                
                                {error && <ErrorMessage message={error} />}

                                <div>
                                    <Button
                                        type="submit"
                                        variant="solid"
                                        color="blue"
                                        className="w-full flex justify-center bg-green-600 hover:bg-green-700"
                                    >
                                        Sign in →
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden lg:block w-1/2 bg-green-600 relative">
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
                    <h1 className="text-4xl font-bold mb-6">Welcome Back!</h1>
                    <p className="text-xl text-center max-w-md">
                        Connect with the best tutors and continue your learning journey today.
                    </p>
                </div>
            </div>
        </div>
    );
}