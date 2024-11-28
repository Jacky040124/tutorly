"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { TextField } from "@/components/common/Fields";
import { useError } from "@/components/providers/ErrorContext";
import { signUpTeacher } from "@/services/auth.service";
import { useRouter } from 'next/navigation';
import AuthBackground from '@/components/auth/AuthBackground';
import BackToHomeButton from '@/components/auth/BackToHomeButton';

export default function SignUpTeacher() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [description, setDescription] = useState("");
  const { showError } = useError();
  const router = useRouter();

  const handleSignup = async (e) => {e.preventDefault();

    try {
      if (!email || !password || !nickname || !description) {
        throw new Error("All fields are required");
      }

      await signUpTeacher(email, password, nickname, description);
      showError("Sign Up Successful! Please sign in.");
      setTimeout(() => router.push('/auth/signin'), 2000);
      
    } catch (error) {
      console.error("Teacher signup error:", error);
      const errorMessage = {
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/invalid-email': 'Invalid email format',
        'auth/weak-password': 'Password should be at least 6 characters',
      }[error.code] || error.message;
      
      showError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 flex flex-col px-8 lg:px-12 xl:px-16">
        <BackToHomeButton />

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
            <form onSubmit={handleSignup} className="space-y-6">
              <TextField
                label="Nickname"
                name="nickname"
                type="text"
                onChange={(e) => setNickname(e.target.value)}
                required
              />
              <TextField
                label="Description"
                name="description"
                type="text"
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

              <div className="space-y-4">
                <Button
                  type="submit"
                  variant="solid"
                  color="blue"
                  className="w-full flex justify-center bg-green-600 hover:bg-green-700"
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
