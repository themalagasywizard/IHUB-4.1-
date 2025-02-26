import React from 'react';
import { supportedLanguages } from '../utils/translate';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
}

const LanguageSelector = ({ currentLanguage, onLanguageChange }: LanguageSelectorProps) => {
  return (
    <div className="flex flex-col space-y-2">
      {Object.entries(supportedLanguages).map(([code, name]) => (
        <button
          key={code}
          onClick={() => onLanguageChange(code)}
          className={`block w-full px-4 py-2 text-sm text-white hover:bg-[rgba(234,56,76,0.1)] text-left
            ${currentLanguage === code ? 'bg-[rgba(234,56,76,0.1)]' : ''}`}
        >
          {name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;