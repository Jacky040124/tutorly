import { UserProvider } from '@/components/providers/UserContext'
import "@/app/globals.css";
import { ErrorProvider } from '@/components/providers/ErrorContext';
import { BookingProvider } from '@/components/providers/BookingContext';
import { OverlayProvider } from "@/components/providers/OverlayContext";
import { LoadingProvider } from '@/components/providers/LoadingContext';

export const metadata = {
  title: "TutorMe",
  description: "Find your Tutor",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body>
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
  );
}
