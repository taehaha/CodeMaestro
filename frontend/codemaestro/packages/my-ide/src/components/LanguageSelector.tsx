// src/components/LanguageSelector.tsx

import React from "react";

export interface Language {
  name: string;
  id: number;
}

interface LanguageSelectorProps {
  languages: Language[];
  selectedLanguage: Language;
  setSelectedLanguage: (lang: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  selectedLanguage,
  setSelectedLanguage,
}) => {
  return (
    <div className="flex items-center space-x-2">
      {/* 다크 모드에 따라 텍스트 색상 변경 */}
      <label
        htmlFor="language"
        className="text-gray-700 dark:text-gray-200 transition-colors duration-300"
      >
        언어:
      </label>
      {/* 다크 모드에 따라 배경색, 테두리색, 텍스트색 변경 */}
      <select
        id="language"
        value={selectedLanguage.id}
        onChange={(e) => {
          const lang = languages.find(
            (lang) => lang.id === parseInt(e.target.value)
          );
          if (lang) setSelectedLanguage(lang);
        }}
        className="
          p-2 
          rounded 
          border 
          border-gray-300 
          dark:border-gray-600 
          bg-white 
          dark:bg-gray-800 
          text-black 
          dark:text-white 
          focus:outline-none 
          focus:ring-2 
          focus:ring-blue-500 
          transition-colors 
          duration-300
        "
      >
        {languages.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
