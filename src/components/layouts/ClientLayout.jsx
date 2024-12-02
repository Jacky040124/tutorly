"use client";

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { 
  UserProvider, 
  BookingProvider, 
  ErrorProvider, 
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
    <LoadingProvider>
      <OverlayProvider>
        <BookingProvider>
          <ErrorProvider>
            <UserProvider>
              <I18nextProvider i18n={i18n}>
                {children}
              </I18nextProvider>
            </UserProvider>
          </ErrorProvider>
        </BookingProvider>
      </OverlayProvider>
    </LoadingProvider>
  );
} 