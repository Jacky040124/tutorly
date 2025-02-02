"use client";

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale) => {
    // Set the locale cookie
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`; // 1 year
    
    // Use router.refresh() to trigger a soft navigation that updates translations
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded ${
          locale === 'en' 
            ? 'bg-green-600 text-white' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('zh')}
        className={`px-2 py-1 rounded ${
          locale === 'zh' 
            ? 'bg-green-600 text-white' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        中文
      </button>
    </div>
  );
} 