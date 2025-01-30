"use client";

import { useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { signIn } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from "@/lib/LanguageSwitcher";
import { useForm, Controller } from "react-hook-form";
import React from "react";
import type { User } from "@/types/user";

type SignInData = {
  email: string;
  password: string;
};

export default function SignIn() {
  const t = useTranslations('Auth.SignIn');
  const router = useRouter();
  const { setUser } = useUser();

  const { handleSubmit, control, register } = useForm<SignInData>();

  useEffect(() => {
    const savedEmail = window.localStorage.getItem("emailForSignIn");
    const savedPassword = window.localStorage.getItem("tempPassword");

    if (savedEmail) {
      register("email", { value: savedEmail });
    }
    if (savedPassword) {
      register("password", { value: savedPassword });
      window.localStorage.removeItem("tempPassword");
    }
  }, [register]);

  const handleSignIn = async (data: SignInData) => {
    try {
      const { user, redirectTo } = await signIn(data.email, data.password);
      setUser(user as User);
      router.replace(redirectTo);
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="flex justify-between items-center absolute top-4 left-4 right-4">
          <Link href="/" aria-label="Home">
            <Button variant="outline" color="slate">
              {t('backToHome')}
            </Button>
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-3xl font-bold">{t('title')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('subtitle')}{" "}
            <Link href="/auth/signup" className="font-medium text-green-600 hover:text-green-500">
              {t('signupLink')}
            </Link>
          </p>

          <div className="mt-8">
            <form onSubmit={handleSubmit(handleSignIn)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...field}
                      required
                    />
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      {...field}
                      required
                    />
                  )}
                />
              </div>

              <div>
                <Button type="submit" variant="outline" color="slate" className="w-full">
                  {t('button')}
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
