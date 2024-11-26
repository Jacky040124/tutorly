"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { TextField } from "@/components/common/Fields";
import ErrorMessage from "@/components/common/ErrorMessage";
import {
  isVerificationLink,
  checkEmailExists,
  createNewUser,
  sendVerificationEmail,
} from "@/services/auth.service";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      if (await checkEmailExists(email)) {
        setError("You already have an Account, Sign in here");
        return;
      }

      if (isVerificationLink()) {
        const savedEmail = window.localStorage.getItem("emailForSignIn");

        if (!savedEmail || savedEmail !== email) {
          setError("Please use the same email that was used for verification.");
          return;
        }

        try {
          await createNewUser(email, password, nickname);
          window.localStorage.removeItem("emailForSignIn");
          setError("Sign Up Successful, Sign in here");
        } catch (signUpError) {
          setError(signUpError.message);
          console.error("Error during sign-up:", signUpError.message);
        }
        return;
      }

      // If not a verification link, send the verification email
      await sendVerificationEmail(email);
      window.localStorage.setItem("emailForSignIn", email);
      setError("Verification email sent! Please check your inbox.");
    } catch (error) {
      setError(error.message);
      console.error("Error:", error);
    }
  };

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleNicknameChange = (e) => setNickname(e.target.value);

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="absolute top-4 left-4">
          <Link href="/" aria-label="Home">
            <Button variant="outline" color="slate" className="overlay-button-secondary">
              ← Back to home
            </Button>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div>
            <h2 className="text-3xl font-bold">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-green-600 hover:text-green-500"
              >
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
                onChange={handleNicknameChange}
                required
              />
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

              {error && <ErrorMessage message={error} />}

              <div className="space-y-4">
                <Button
                  variant="solid"
                  color="blue"
                  className="w-full flex justify-center bg-green-600 hover:bg-green-700"
                  onClick={handleSignup}
                >
                  Sign up
                </Button>
                <Link
                  href="/auth/signupteacher"
                  className="block text-center text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign up as a teacher instead
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:block w-1/2 bg-green-600 relative">
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-4xl font-bold mb-6">Start Learning Today</h1>
          <p className="text-xl text-center max-w-md">
            Join our community and learn from the best.
          </p>
        </div>
      </div>
    </div>
  );
}
