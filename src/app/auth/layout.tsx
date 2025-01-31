"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from "@/lib/LanguageSwitcher";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('Auth.SignIn');

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="flex justify-between items-center absolute top-4 left-4 right-4">
          <Link href="/" aria-label="Home">
            <Button variant="outline" color="slate">
              {t("backToHome")}
            </Button>
          </Link>
          <LanguageSwitcher />
        </div>
        {children}
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
