"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpStudent } from "@/services/auth.service";
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "@/lib/LanguageSwitcher";
import { useNotification } from "@/hooks/useNotification";

export default function SignUp() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [signupCode, setSignupCode] = useState("");
  const { showSuccess } = useNotification();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!email || !password || !nickname || !signupCode) {
        throw new Error("All fields are required");
      }

      if (signupCode !== "david0324") {
        throw new Error("Invalid sign-up code");
      }

      await signUpStudent(email, password, nickname);
      showSuccess("Sign Up Successful! Please sign in.");
      setTimeout(() => router.push("/auth/signin"), 2000);
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="flex justify-between items-center absolute top-4 left-4 right-4">
          <Link href="/" aria-label="Home">
            <Button variant="outline" color="slate">
              {t('signin.backToHome')}
            </Button>
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-3xl font-bold">
            {t('signup.student.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('signup.student.subtitle')}{' '}
            <Link href="/auth/signin" className="font-medium text-green-600 hover:text-green-500">
              {t('signin.button')}
            </Link>
          </p>

          <div className="mt-8">
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nickname">{t('signup.student.nickname')}</Label>
                <Input
                  id="nickname"
                  name="nickname"
                  type="text"
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('signup.student.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('signup.student.password')}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupCode">Sign-up Code</Label>
                <Input
                  id="signupCode"
                  name="signupCode"
                  type="text"
                  onChange={(e) => setSignupCode(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  variant="outline"
                  color="blue"
                  className="w-full"
                >
                  {t('signup.student.button')}
                </Button>
                <Link
                  href="/auth/signupteacher"
                  className="block text-center text-sm text-gray-600 hover:text-gray-900"
                >
                  {t('signup.student.teacherLink')}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:block w-1/2 bg-green-600 relative">
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-4xl font-bold mb-6">Start Learning Today</h1>
          <p className="text-xl text-center max-w-md">Join our community and learn from the best.</p>
        </div>
      </div>
    </div>
  );
}
