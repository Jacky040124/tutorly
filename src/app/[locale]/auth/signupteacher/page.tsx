"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpTeacher } from "@/app/[locale]/action";
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useState } from "react";
import { authState } from "@/app/[locale]/action";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";

// TODO: High Priority : Fix Sign Up Google Save Password Error
export default function SignUpTeacher() {
  const t = useTranslations("Auth.SignUpTeacher");
  const router = useRouter();
  const { locale } = useParams();
  const [signupCode, setSignupCode] = useState("");
  const [state, formAction, isPending] = useActionState(signUpTeacher, { error: null, user: null } as authState);

  useEffect(() => {
    if (state.user) {
      router.push(`/${locale}/auth/signin`);
    }
  }, [state, router, locale]);

  async function handleFormAction(formData: FormData) {
    if (signupCode !== process.env.NEXT_PUBLIC_TEACHER_SIGNUP_CODE) {
      toast({
        title: t("error"),
        description: t("invalidSignupCode"),
      });
    } else {
      formAction(formData);
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold">{t("title")}</h2>
          <p className="text-sm text-gray-600">
            {t("subtitle")}{" "}
            <Link href={`/${locale}/auth/signin`} className="font-medium text-green-600 hover:text-green-500">
              {t("signInLink")}
            </Link>
          </p>
        </div>
        {state.error && <div className="text-red-500">{state.error}</div>}

        <div className="space-y-2">
          <Label htmlFor="passcode">{t("signupCode")}</Label>
          <Input
            id="passcode"
            type="password"
            name="passcode"
            required
            value={signupCode}
            onChange={(e) => setSignupCode(e.target.value)}
          />
        </div>

        <form action={handleFormAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" name="email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" name="password" required />
          </div>

          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {t("button")}
            </Button>
            <Link
              href={`/${locale}/auth/signup`}
              className="block text-center text-sm text-gray-600 hover:text-gray-900"
            >
              {t("studentLink")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
