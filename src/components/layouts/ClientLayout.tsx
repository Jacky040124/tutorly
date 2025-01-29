"use client";

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { UserProvider } from '@/hooks/useUser';
import { BookingProvider } from '@/hooks/useBooking';
import { NotificationProvider } from '@/hooks/useNotification';
import { OverlayProvider } from '@/hooks/useOverlay';

export default function ClientLayout({ children }: { children: React.ReactNode}) {
  useEffect(() => {
    const savedLang = localStorage.getItem("i18nextLng");
    if (savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <NotificationProvider>
        <UserProvider>
          <BookingProvider>
            <OverlayProvider>{children}</OverlayProvider>
          </BookingProvider>
        </UserProvider>
      </NotificationProvider>
    </I18nextProvider>
  );
} 