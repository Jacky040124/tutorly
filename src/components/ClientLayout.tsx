"use client";
import { UserProvider } from '@/hooks/useUser';
import { NotificationProvider } from '@/hooks/useNotification';
import { OverlayProvider } from '@/hooks/useOverlay';

export default function ClientLayout({ children }: { children: React.ReactNode}) {
  return (
    <NotificationProvider>
      <UserProvider>
          <OverlayProvider>
            {children}
          </OverlayProvider>
      </UserProvider>
    </NotificationProvider>
  );
} 