"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Popover, Transition } from "@headlessui/react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/common/Container";
import { Logo } from "@/components/common/Logo";
import { NavLink } from "@/components/common/NavLink";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useTranslation } from "react-i18next";

function MobileNavLink({ href, children }) {
  return (
    <Link href={href} className="block w-full p-2">
      {children}
    </Link>
  );
}

function MobileNavIcon({ open }) {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 overflow-visible stroke-slate-700"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M0 1H14M0 7H14M0 13H14" className={clsx("origin-center transition", open && "scale-90 opacity-0")} />
      <path d="M2 2L12 12M12 2L2 12" className={clsx("origin-center transition", !open && "scale-90 opacity-0")} />
    </svg>
  );
}

function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation("landing");

  return (
    <div className="relative">
      <button
        className="relative z-10 flex h-8 w-8 items-center justify-center"
        aria-label="Toggle Navigation"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MobileNavIcon open={isOpen} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-4 w-screen max-w-md rounded-2xl bg-white p-4 text-lg tracking-tight text-slate-900 shadow-xl ring-1 ring-slate-900/5">
          <MobileNavLink href="#features">{t('nav.features')}</MobileNavLink>
          <MobileNavLink href="#testimonials">{t('nav.testimonials')}</MobileNavLink>
          <MobileNavLink href="#pricing">{t('nav.pricing')}</MobileNavLink>
          <hr className="m-2 border-slate-300/40" />
          <MobileNavLink href="/auth/signin">{t('nav.signin')}</MobileNavLink>
          <div className="mt-2 flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { t } = useTranslation("landing");

  return (
    <header className="py-10">
      <Container>
        <nav className="relative z-50 flex justify-between">
          <div className="flex items-center md:gap-x-12">
            <Link href="/" aria-label="Home">
              <Logo className="h-10 w-auto" />
            </Link>

            <div className="hidden md:flex md:gap-x-6">
              <NavLink href="#features">{t("nav.features")}</NavLink>
              <NavLink href="#testimonials">{t("nav.testimonials")}</NavLink>
              <NavLink href="#pricing">{t("nav.pricing")}</NavLink>
            </div>
          </div>

          <div className="flex items-center gap-x-5 md:gap-x-8">
            <div className="z-50">
              <LanguageSwitcher />
            </div>

            <div className="hidden md:block">
              <NavLink href="/auth/signin">{t("nav.signin")}</NavLink>
            </div>

            <Link href="/auth/signup">
              <Button>
                <span>
                  {t("nav.getStarted")} <span className="hidden lg:inline">{t("nav.today")}</span>
                </span>
              </Button>
            </Link>

            <div className="-mr-1 md:hidden">
              <MobileNavigation />
            </div>
            
          </div>
        </nav>
      </Container>
    </header>
  );
}