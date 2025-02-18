"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpStudent } from "@/app/[locale]/action";
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect } from "react";
import { authState } from "@/app/[locale]/action";
import { useParams } from "next/navigation";

export default function SignUp() {
  const t = useTranslations('Auth.SignUp');
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signUpStudent, { error: null, user: null } as authState);
  const { locale } = useParams();

  useEffect(() => {
    if (state.user) {
      router.push(`/${locale}/auth/signin`);
    }
  }, [state, router, locale]);

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold">{t('title')}</h2>
          <p className="text-sm text-gray-600">
            {t('subtitle')}{' '}
            <Link href={`/${locale}/auth/signin`} className="font-medium text-green-600 hover:text-green-500">
              {t('SignInButton')}
            </Link>
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">{t('nickname')}</Label>
            <Input
              id="nickname"
              type="text"
              name="nickname"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              name="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              name="password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signupCode">{t('signupCode')}</Label>
            <Input
              id="signupCode"
              type="text"
              name="signupCode"
              required
            />
          </div>

          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {t('button')}
            </Button>
            <Link
              href={`/${locale}/auth/signupteacher`}
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
