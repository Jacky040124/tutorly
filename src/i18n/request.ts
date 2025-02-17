import { getRequestConfig } from "next-intl/server";


// TODO: fix translations
export default getRequestConfig(async () => {
  // Default to 'en' if no locale is found
  let locale = 'en';
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
