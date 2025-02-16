"use client";

import { useUser } from "@/hooks/useUser";
import { signIn } from "@/app/action";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { useEffect,useActionState } from "react";
import { authState } from "@/app/action";
import { Student } from "@/types/student";

export default function SignIn() {
  const t = useTranslations("Auth.SignIn");
  const router = useRouter();
  const { setUser } = useUser();
  const [state, formAction, isPending] = useActionState(signIn, { error: null, user: null } as authState);

  useEffect(() => {
    if (state.user) {
      setUser(state.user as Student);
      router.push(`/dashboard/${state.user.type}/${state.user.uid}/schedule`);
    }
  }, [state]);

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
        {state.error && <p className="text-red-500">{state.error}</p>}
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" autoComplete="email" name="email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" autoComplete="current-password" name="password" required />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {t("button")}
          </Button>
        </form>
      </div>
    </div>
  );
}
