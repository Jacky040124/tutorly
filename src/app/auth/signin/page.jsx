"use client"

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useUser } from '@/components/providers/UserContext';
import { useError } from '@/components/providers/ErrorContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { TextField } from '@/components/common/Fields';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const { setUser } = useUser();
    const { showError } = useError();

    useEffect(() => {
        try {
            const savedEmail = window.localStorage.getItem("emailForSignIn");
            const savedPassword = window.localStorage.getItem("tempPassword");
            
            if (savedEmail) setEmail(savedEmail);
            if (savedPassword) {
                setPassword(savedPassword);
                window.localStorage.removeItem("tempPassword");
            }
        } catch (error) {
            showError("Failed to load saved credentials");
        }
    }, [showError]);

    const updateUserContext = (userCredential, userData) => {
        const baseUserData = {
            email: userCredential.user.email,
            uid: userCredential.user.uid,
            type: userData.type,
            nickname: userData.nickname,
        };

        const typeSpecificData = userData.type === "teacher" 
            ? {
                description: userData.description,
                availability: userData.availability,
                pricing: userData.pricing
            }
            : {
                balance: userData.balance,
                bookingHistory: userData.bookingHistory
            };

        setUser({ ...baseUserData, ...typeSpecificData });
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            const docRef = doc(db, "users", userCredential.user.uid);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                throw new Error("User data not found");
            }
            
            const userData = docSnap.data();
            updateUserContext(userCredential, userData);

            // Navigate based on user type
            const route = userData.type === "teacher" 
                ? "/dashboard/user/teacher" 
                : userData.type === "manager"
                ? "/dashboard/user/manager"
                : "/dashboard/user/student";
            router.replace(route);
            
        } catch (error) {
            console.error('Sign-in error:', error);
            const errorMessage = {
                'auth/user-not-found': 'No account found with this email',
                'auth/wrong-password': 'Incorrect password',
                'auth/invalid-email': 'Invalid email format',
                'auth/too-many-requests': 'Too many failed attempts. Please try again later',
            }[error.code] || error.message;
            
            showError(errorMessage);
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