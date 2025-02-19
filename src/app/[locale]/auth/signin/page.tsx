"use client";

import { useUser } from "@/hooks/useUser";
import { signIn } from "@/app/[locale]/action";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { useEffect,useActionState } from "react";
import { authState } from "@/app/[locale]/action";
import { Student } from "@/types/student";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";


// TODO: Low priority: Imporve Loading UI
export default function SignIn() {
  const t = useTranslations("Auth.SignIn");
  const router = useRouter();
  const { setUser } = useUser();
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(signIn, { error: null, user: null } as authState);
  const { locale } = useParams();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state.user) {
      setUser(state.user as Student);
      if (state.user.type === "student") {
        router.push(`/${locale}/dashboard/student/${state.user.uid}/schedule`, { scroll: false });
      } else {
        router.push(`/${locale}/dashboard/teacher/${state.user.uid}`, { scroll: false });
      }
    }
  }, [state, setUser, router, locale]);

  async function handleSignIn(formData: FormData) {
    try {
      formAction(formData);
    } catch (error) {
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : "An error occurred during sign in",
        variant: "destructive",
      });
    }
  }
    

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold">{t("title")}</h2>
          <p className="text-sm text-gray-600">
            {t("subtitle")}{" "}
            <Link href={`/${locale}/auth/signup`} className="font-medium text-green-600 hover:text-green-500">
              {t("signupLink")}
            </Link>
          </p>
        </div>
        {state.error && <p className="text-red-500">{state.error}</p>}
        <form action={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" autoComplete="email" name="email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"}
                autoComplete="current-password" 
                name="password" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {t("button")}
          </Button>
        </form>
      </div>
    </div>
  );
}
