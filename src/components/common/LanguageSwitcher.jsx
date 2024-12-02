"use client";

import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded ${
          i18n.language === 'en' 
            ? 'bg-green-600 text-white' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('zh')}
        className={`px-2 py-1 rounded ${
          i18n.language === 'zh' 
            ? 'bg-green-600 text-white' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        中文
      </button>
    </div>
  );
} 