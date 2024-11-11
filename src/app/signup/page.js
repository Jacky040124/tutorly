"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth, doc, setDoc } from "@/app/firebase";
import Link from 'next/link';
import { Button } from '@/components/Button'
import { TextField } from '@/components/Fields'

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [text, setText] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault(); // Prevent form submission
        console.log('Starting teacher signup process with email:', email);
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                uid: user.uid,
                createdAt: new Date().toISOString(),
                type: "teacher",
                description: "",
                availability: [],
            });
            setText("Sign Up Successful, Sign in here");

        } catch (signUpError) {
            if (signUpError.code === "auth/email-already-in-use") {
                setText("You already have an Account, Sign in here");
            } else {
                setText(signUpError.message);
            }
            console.error("Error during sign-up:", signUpError.message);
        }
    };

    const handleEmailChange = (event) => setEmail(event.target.value);
    const handlePasswordChange = (event) => setPassword(event.target.value);

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
                        <h2 className="text-3xl font-bold">Create your teacher account</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/signin" className="font-medium text-green-600 hover:text-green-500">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8">
                        <form className="space-y-6" action="#" method="POST">
                            <TextField
                                label="Email address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                onChange={handleEmailChange}
                                required
                            />
                            <TextField
                                label="Password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                onChange={handlePasswordChange}
                                required
                            />
                            
                            {text && (
                                <div className="text-sm">
                                    <p className="text-red-500">{text}</p>
                                    {(text.includes("Sign Up Successful") || text.includes("already have an Account")) && (
                                        <Link href="/signin" className="text-green-600 hover:text-green-500 font-medium">
                                            Sign In
                                        </Link>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4">
                                <Button
                                    variant="solid"
                                    color="blue"
                                    className="w-full flex justify-center bg-green-600 hover:bg-green-700"
                                    onClick={handleSignup}
                                >
                                    Sign up as teacher →
                                </Button>
                                <Link 
                                    href="/signup" 
                                    className="block text-center text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Sign up as a student instead
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="hidden lg:block w-1/2 bg-green-600 relative">
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
                    <h1 className="text-4xl font-bold mb-6">Start Teaching Today</h1>
                    <p className="text-xl text-center max-w-md">
                        Join our community of expert tutors and help students achieve their educational goals.
                    </p>
                </div>
            </div>
        </div>
    );
}