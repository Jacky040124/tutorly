import { getRequestConfig } from "next-intl/server";
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // Get locale from cookies, fallback to 'en'
  const cookieStore = cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
