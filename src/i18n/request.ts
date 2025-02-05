import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // Default to 'en' if no locale is found
  let locale = 'en';

  // Try to get locale from localStorage
  if (typeof window !== 'undefined') {
    const storedLocale = localStorage.getItem('locale');
    if (storedLocale) {
      locale = storedLocale;
    } else {
      // Try to get from user settings if available
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        locale = user.locale || 'en';
      }
    }
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
