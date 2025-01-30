// Keep this as a server component
import { Inter, Lexend } from "next/font/google";
import clsx from "clsx";
import "@/app/globals.css";
import ClientLayout from "@/components/layouts/ClientLayout";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // prefered language
  const locale = await getLocale();

  // translation file
  const messages = await getMessages();

  // NextIntlClientProvider automatically inherits configuration from i18n/request.ts, but messages need to be passed explicitly.
  return (
    <html lang={locale} className={clsx("h-full scroll-smooth bg-white antialiased", inter.variable, lexend.variable)}>
      <body className="flex h-full flex-col">
        <ClientLayout>
          <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        </ClientLayout>
      </body>
    </html>
  );
}
