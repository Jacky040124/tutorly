"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import Link from 'next/link';
import { Button } from '@/components/common/Button'
import { TextField } from '@/components/common/Fields'
import AuthBackground from '@/components/auth/AuthBackground'
import BackToHomeButton from '@/components/auth/BackToHomeButton';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [nickname, setNickname] = useState("");
    const [description, setDescription] = useState("");
    

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
                nickname: nickname,
                description: description,
                availability: [],
                pricing: 0,
            });
            setError("Sign Up Successful, Sign in here");

        } catch (signUpError) {
            if (signUpError.code === "auth/email-already-in-use") {
                setError("You already have an Account, Sign in here");
            } else {
                setError(signUpError.message);
            }
            console.error("Error during sign-up:", signUpError.message);
        }
    };

    return (
        <div className="flex min-h-screen">
            <div className="w-1/2 flex flex-col px-8 lg:px-12 xl:px-16">
                <BackToHomeButton/>

                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    <div>
                        <h2 className="text-3xl font-bold">Create your teacher account</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/auth/signin" className="font-medium text-green-600 hover:text-green-500">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8">
                        <form className="space-y-6" action="#" method="POST">
                            <TextField
                                label="Nickname"
                                name="nickname"
                                type="nickname"
                                autoComplete="nickname"
                                onChange={(e) => setNickname(e.target.value)}
                                required
                            />
                            <TextField
                                label="Description"
                                name="description"
                                type="description"
                                autoComplete="description"
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
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
                                autoComplete="new-password"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            
                            {error && <ErrorMessage message={error} />}

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
                                    href="/auth/signup" 
                                    className="block text-center text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Sign up as a student instead
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <AuthBackground 
                text1="Start Teaching Today" 
                text2="Join our community of expert tutors and help students achieve their educational goals."
            />
        </div>
    );
}
