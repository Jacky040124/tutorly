"use client";

import { useForm, Controller } from "react-hook-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpStudent } from "@/services/auth.service";
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useNotification } from "@/hooks/useNotification";

type SignUpData = {
  email: string;
  password: string;
  nickname: string;
  signupCode: string;
};

export default function SignUp() {
  const t = useTranslations('Auth.SignUp.Student');
  const tCommon = useTranslations('Auth.SignIn');
  const { showSuccess } = useNotification();
  const router = useRouter();
  const { handleSubmit, control } = useForm<SignUpData>();

  const onSubmit = async (data: SignUpData) => {
    try {
      if (data.signupCode !== "david0324") {
        throw new Error("Invalid sign-up code");
      }

      await signUpStudent(data.email, data.password, data.nickname);
      
      // Store email for auto-fill on sign-in page
      window.localStorage.setItem("emailForSignIn", data.email);
      
      showSuccess("Sign Up Successful! Please sign in.");
      router.push("/auth/signin")
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold">{t('title')}</h2>
          <p className="text-sm text-gray-600">
            {t('subtitle')}{' '}
            <Link href="/auth/signin" className="font-medium text-green-600 hover:text-green-500">
              {tCommon('button')}
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">{t('nickname')}</Label>
            <Controller
              name="nickname"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  id="nickname"
                  type="text"
                  {...field}
                  required
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
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
            <Label htmlFor="password">{t('password')}</Label>
            <Controller
              name="password"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...field}
                  required
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signupCode">{t('signupCode')}</Label>
            <Controller
              name="signupCode"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  id="signupCode"
                  type="text"
                  {...field}
                  required
                />
              )}
            />
          </div>

          <div className="space-y-4">
            <Button type="submit" className="w-full">
              {t('button')}
            </Button>
            <Link
              href="/auth/signupteacher"
              className="block text-center text-sm text-gray-600 hover:text-gray-900"
            >
              {t('teacherLink')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
