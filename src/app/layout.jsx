import { Inter, Lexend } from 'next/font/google'
import { UserProvider, BookingProvider, ErrorProvider, LoadingProvider, OverlayProvider } from '@/components/providers'
import clsx from 'clsx'
import "@/app/globals.css"

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
        <LoadingProvider>
          <OverlayProvider>
            <BookingProvider>
              <ErrorProvider>
                <UserProvider>{children}</UserProvider>
              </ErrorProvider>
            </BookingProvider>
          </OverlayProvider>
        </LoadingProvider>
      </body>
    </html>
  )
}
