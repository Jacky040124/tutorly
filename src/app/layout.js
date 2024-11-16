import { UserProvider } from '@/components/providers/UserContext'
import "@/app/globals.css";
import { ErrorProvider } from '@/components/providers/ErrorContext';

export const metadata = {
  title: "TutorMe",
  description: "Find your Tutor",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body>
        <ErrorProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
