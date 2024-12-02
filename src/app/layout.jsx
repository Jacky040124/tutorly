// Keep this as a server component
import { Inter, Lexend } from 'next/font/google'
import clsx from 'clsx'
import "@/app/globals.css"
import ClientLayout from '@/components/layouts/ClientLayout'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
})

export const metadata = {
  title: "TutorMe",
  description: "Find your Tutor",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={clsx(
      'h-full scroll-smooth bg-white antialiased',
      inter.variable,
      lexend.variable,
    )}>
      <body className="flex h-full flex-col">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
