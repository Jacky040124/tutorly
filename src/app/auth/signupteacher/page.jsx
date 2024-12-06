"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { TextField } from "@/components/common/Fields";
import { useError } from "@/components/providers/ErrorContext";
import { useNotification } from "@/components/providers/NotificationContext";
import { signUpTeacher } from "@/services/auth.service";
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

export default function SignUpTeacher() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [description, setDescription] = useState("");
  const { showError } = useError();
  const { showSuccess } = useNotification();
  const router = useRouter();

  const handleSignup = async (e) => {e.preventDefault();

    try {
      if (!email || !password || !nickname || !description) {
        throw new Error("All fields are required");
      }

      await signUpTeacher(email, password, nickname, description);
      showSuccess("Sign Up Successful! Please sign in.");
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
            {t('signup.teacher.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('signup.teacher.subtitle')}{' '}
            <Link href="/auth/signin" className="font-medium text-green-600 hover:text-green-500">
              {t('signin.button')}
            </Link>
          </p>

          <div className="mt-8">
            <form onSubmit={handleSignup} className="space-y-6">
              <TextField
                label={t('signup.teacher.nickname')}
                name="nickname"
                type="text"
                onChange={(e) => setNickname(e.target.value)}
                required
              />
              <TextField
                label={t('signup.teacher.description')}
                name="description"
                type="text"
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <TextField
                label={t('signup.teacher.email')}
                name="email"
                type="email"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <TextField
                label={t('signup.teacher.password')}
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
                  className="w-full"
                >
                  {t('signup.teacher.button')}
                </Button>
                <Link
                  href="/auth/signup"
                  className="block text-center text-sm text-gray-600 hover:text-gray-900"
                >
                  {t('signup.teacher.studentLink')}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="hidden lg:block w-1/2 bg-green-600 relative">
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-4xl font-bold mb-6">{t('signup.teacher.banner.title')}</h1>
          <p className="text-xl text-center max-w-md">{t('signup.teacher.banner.subtitle')}</p>
        </div>
      </div>
    </div>
  );
}
