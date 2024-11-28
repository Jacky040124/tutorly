import { UserProvider } from '@/components/providers/UserContext'
import "@/app/globals.css";
import { ErrorProvider } from '@/components/providers/ErrorContext';
import { BookingProvider } from '@/components/providers/BookingContext';

export const metadata = {
  title: "TutorMe",
  description: "Find your Tutor",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body>
        <BookingProvider>
          <ErrorProvider>
            <UserProvider>{children}</UserProvider>
          </ErrorProvider>
        </BookingProvider>
      </body>
    </html>
  );
}
