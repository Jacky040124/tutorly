"use client";

import { useForm, Controller } from "react-hook-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotification } from "@/hooks/useNotification";
import { signUpTeacher } from "@/services/auth.service";
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

type SignUpTeacherData = {
  email: string;
  password: string;
  nickname: string;
  description: string;
  passcode: string;
};

export default function SignUpTeacher() {
  const t = useTranslations('Auth.SignUp.Teacher');
  const { showSuccess } = useNotification();
  const router = useRouter();
  const { handleSubmit, control } = useForm<SignUpTeacherData>();

  const onSubmit = async (data: SignUpTeacherData) => {
    try {
      if (data.passcode !== "david2025") {
        throw new Error("Invalid teacher registration code");
      }

      await signUpTeacher(data.email, data.password, data.nickname, data.description);
      
      // Store email for auto-fill on sign-in page
      window.localStorage.setItem("emailForSignIn", data.email);
      
      showSuccess("Sign Up Successful! Please sign in.");
      setTimeout(() => router.push('/auth/signin'), 2000);
    } catch (error) {
      console.error("Teacher signup error:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold">
            {t('title')}
          </h2>
          <p className="text-sm text-gray-600">
            {t('subtitle')}{' '}
            <Link href="/auth/signin" className="font-medium text-green-600 hover:text-green-500">
              {t('signInLink')}
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
            <Label htmlFor="description">{t('description')}</Label>
            <Controller
              name="description"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  id="description"
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
            <Label htmlFor="passcode">{t('signupCode')}</Label>
            <Controller
              name="passcode"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  id="passcode"
                  type="password"
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
              href="/auth/signup"
              className="block text-center text-sm text-gray-600 hover:text-gray-900"
            >
              {t('studentLink')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
