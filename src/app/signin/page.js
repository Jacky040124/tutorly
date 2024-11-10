"use client"

import { useState, useEffect } from 'react';
import { auth, db, doc, getDoc } from "@/app/firebase";
import { useUser } from "@/components/UserContext"
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import { Button } from '@/components/Button'
import { TextField } from '@/components/Fields'

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorText, setErrorText] = useState("");
    const router = useRouter();
    const { user, setUser } = useUser();

    // Handle auth state changes
    useEffect(() => {
        console.log("Current user in effect:", user);
        if (user) {
            console.log("User type:", user.type);
            if (user.type === "teacher") {
                router.replace("/user/teacher");
            } else if (user.type === "student") {
                router.replace("/user/student");
            }
        }
    }, [user, router]);

    const handleSignIn = async (e) => {
        e.preventDefault(); // Prevent form submission
        console.log('Starting sign-in process...');
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Sign-in successful:', userCredential.user.uid);
            
            // Get user data from Firestore
            const docRef = doc(db, "users", userCredential.user.uid);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                setErrorText("User data not found");
                return;
            }
            
            const userData = docSnap.data();
            console.log('User data from Firestore:', userData);
            
            // Update user context
            setUser({
                email: userCredential.user.email,
                uid: userCredential.user.uid,
                type: userData.type
            });
            
        } catch (error) {
            console.error('Sign-in error:', error);
            setErrorText(error.message || "Sign in failed");
        }
    };

    return (
        <div className="flex min-h-screen">
            <div className="w-1/2 flex flex-col px-8 lg:px-12 xl:px-16">
                <div className="absolute top-4 left-4">
                    <Link href="/" aria-label="Home">
                        <Button variant="outline" color="slate">
                            ← Back to home
                        </Button>
                    </Link>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    <div>
                        <h2 className="text-3xl font-bold">Sign in to your account</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="font-medium text-green-600 hover:text-green-500">
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
                            
                            {errorText && (
                                <div className="text-red-500 text-sm">
                                    {errorText}
                                </div>
                            )}

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

