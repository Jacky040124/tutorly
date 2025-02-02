// Root layout is kept as a server component for better performance
// Client-side providers are moved to a separate component
import { Inter, Lexend } from "next/font/google";
import clsx from "clsx";
import "@/app/globals.css";
import ClientLayout from "@/components/ClientLayout";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Suspense } from "react";
import Loading from "./loading";
import FeedbackButton from '@/components/FeedbackButton';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/hooks/useUser";

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
    userId: string;
  };
}

export default async function RootLayout({ children, params }: RootLayoutProp) {
  // prefered language
  const locale = await getLocale();

  // translation file
  const messages = await getMessages();

  // NextIntlClientProvider automatically inherits configuration from i18n/request.ts, but messages need to be passed explicitly.
  return (
    <html lang={locale} className={clsx("h-full scroll-smooth bg-white antialiased", inter.variable, lexend.variable)}>
      <body className="flex h-full flex-col">
        <UserProvider>
          <ClientLayout>
            <NextIntlClientProvider messages={messages}>
              <Suspense fallback={<Loading/>}>{children}</Suspense>
              <FeedbackButton />
            </NextIntlClientProvider>
          </ClientLayout>
        </UserProvider>
        <Toaster />
      </body>
    </html>
  );
}
