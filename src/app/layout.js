import { UserProvider } from '@/components/providers/UserContext'
import "@/app/globals.css";
export const metadata = {
  title: "TutorMe",
  description: "Find your Tutor",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body>
        <UserProvider>
            {children}
        </UserProvider>
      </body>
    </html>
  );
}
