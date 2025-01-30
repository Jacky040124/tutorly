"use client";
import { UserProvider } from '@/hooks/useUser';
import { BookingProvider } from '@/hooks/useBooking';
import { NotificationProvider } from '@/hooks/useNotification';
import { OverlayProvider } from '@/hooks/useOverlay';

export default function ClientLayout({ children }: { children: React.ReactNode}) {
  return (
    <NotificationProvider>
      <UserProvider>
        <BookingProvider>
          <OverlayProvider>
            {children}
          </OverlayProvider>
        </BookingProvider>
      </UserProvider>
    </NotificationProvider>
  );
} 