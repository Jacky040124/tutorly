import { Inter, Lexend } from "next/font/google";
import clsx from "clsx";
import "@/app/[locale]/globals.css";
import ClientLayout from "@/components/ClientLayout";
import { Suspense } from "react";
import Loading from "./loading";
import BugReporter from "@/components/BugReporter";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/hooks/useUser";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});

export const metadata = {
  title: "Tutorly",
  description: "Find your Tutor",
};

interface RootLayoutProp {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default async function RootLayout({ children, params }: RootLayoutProp) {
  const { locale } = params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();


  return (
    <html lang={locale} className={clsx("h-full scroll-smooth bg-white antialiased", inter.variable, lexend.variable)}>
      <body className="flex h-full flex-col">
        <UserProvider>
          <ClientLayout>
            <NextIntlClientProvider messages={messages}>
              <Suspense fallback={<Loading />}>{children}</Suspense>
              <BugReporter />
            </NextIntlClientProvider>
          </ClientLayout>
        </UserProvider>
        <Toaster />
      </body>
    </html>
  );
}
