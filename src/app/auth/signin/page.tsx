"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useUser } from "@/hooks/useUser";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/common/Fields";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useForm, Controller } from "react-hook-form";
import React from "react";

type signInData = {
  email: string;
  password: string;
};

export default function SignIn() {
  const { t } = useTranslation("auth");
  const router = useRouter();
  const { setUser } = useUser();

  const { handleSubmit, control, register } = useForm<signInData>();

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

  const updateUserContext = (userCredential: any, userData: any) => {
    const baseUserData = {
      email: userCredential.user.email,
      uid: userCredential.user.uid,
      type: userData.type,
      nickname: userData.nickname,
    };

    const typeSpecificData =
      userData.type === "teacher"
        ? {
            description: userData.description,
            availability: userData.availability,
            pricing: userData.pricing,
          }
        : {
            balance: userData.balance,
          };

    setUser({ ...baseUserData, ...typeSpecificData });
  };

  const handleSignIn = async (data: any) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);

      const docRef = doc(db, "users", userCredential.user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("User data not found");
      }

      const userData = docSnap.data();
      updateUserContext(userCredential, userData);

      // Navigate based on user type
      const route =
        userData.type === "teacher"
          ? "/dashboard/user/teacher"
          : userData.type === "manager"
          ? "/dashboard/user/manager"
          : "/dashboard/user/student";
      router.replace(route);
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
              {t("signin.backToHome")}
            </Button>
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-3xl font-bold">{t("signin.title")}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t("signin.subtitle")}{" "}
            <Link href="/auth/signup" className="font-medium text-green-600 hover:text-green-500">
              {t("signin.signupLink")}
            </Link>
          </p>

          <div className="mt-8">
            <form onSubmit={handleSubmit(handleSignIn)} className="space-y-6">
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    label={t("signin.email")}
                    type="email"
                    autoComplete="email"
                    {...field}
                    required
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    label={t("signin.password")}
                    type="password"
                    autoComplete="current-password"
                    {...field}
                    required
                  />
                )}
              />

              <div>
                <Button type="submit" variant="outline" color="slate" className="w-full">
                  {t("signin.button")}
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
