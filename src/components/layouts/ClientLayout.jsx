"use client";

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { 
  UserProvider, 
  BookingProvider, 
  ErrorProvider,
  NotificationProvider, 
  LoadingProvider, 
  OverlayProvider 
} from '@/components/providers';

export default function ClientLayout({ children }) {
  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <ErrorProvider>
        <NotificationProvider>
          <LoadingProvider>
            <UserProvider>
              <BookingProvider>
                <OverlayProvider>
                  {children}
                </OverlayProvider>
              </BookingProvider>
            </UserProvider>
          </LoadingProvider>
        </NotificationProvider>
      </ErrorProvider>
    </I18nextProvider>
  );
} 