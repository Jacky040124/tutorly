"use client";

import { useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { signIn } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import type { User } from "@/types/user";

type SignInData = {
  email: string;
  password: string;
};

export default function SignIn() {
  const t = useTranslations("Auth.SignIn");
  const router = useRouter();
  const { setUser } = useUser();
  const { handleSubmit, control, setValue } = useForm<SignInData>();

  useEffect(() => {
    const savedEmail = window.localStorage.getItem("emailForSignIn");
    if (savedEmail) {
      setValue("email", savedEmail);
      window.localStorage.removeItem("emailForSignIn");
    }
  }, [setValue]);

  const onSubmit = async (data: SignInData) => {
    try {
      const { user, redirectTo } = await signIn(data.email, data.password);
      setUser(user as User);
      router.replace(redirectTo);
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold">{t("title")}</h2>
          <p className="text-sm text-gray-600">
            {t("subtitle")}{" "}
            <Link href="/auth/signup" className="font-medium text-green-600 hover:text-green-500">
              {t("signupLink")}
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Controller
              name="email"
              control={control}
              rules={{ required: true }}
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
            <Label htmlFor="password">{t("password")}</Label>
            <Controller
              name="password"
              control={control}
              rules={{ required: true }}
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

          <Button type="submit" className="w-full">
            {t("button")}
          </Button>
        </form>
      </div>
    </div>
  );
}
