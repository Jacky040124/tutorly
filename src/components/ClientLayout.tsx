"use client";
import { UserProvider } from '@/hooks/useUser';
import { OverlayProvider } from '@/hooks/useOverlay';

export default function ClientLayout({ children }: { children: React.ReactNode}) {
  return (
      <UserProvider>
          <OverlayProvider>
            {children}
          </OverlayProvider>
      </UserProvider>
  );
} 