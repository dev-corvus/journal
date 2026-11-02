/**
 * @fileoverview Language switcher supporting UK English (en-GB), Spanish (es-ES), and German (de-DE).
 */

import { Globe } from 'lucide-react';
import { LANGUAGE_OPTIONS } from '../i18n/translations.js';

/** @typedef {import('../types/journalTypes.js').LanguageCode} LanguageCode */

/**
 * Segmented language switcher placed in the workspace welcome bar.
 * @param {{
 *   currentLanguage: LanguageCode,
 *   onChangeLanguage: (lang: LanguageCode) => void,
 *   ariaLabel: string
 * }} props
 */
export default function LanguageSwitcher({ currentLanguage, onChangeLanguage, ariaLabel }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 p-1 bg-stone-200/65 rounded-xl shrink-0"
    >
      <span className="pl-2 pr-1 text-stone-500 hidden sm:inline-flex items-center" aria-hidden="true">
        <Globe className="w-3.5 h-3.5" />
      </span>
      {LANGUAGE_OPTIONS.map((option) => {
        const isActive = currentLanguage === option.code;
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => onChangeLanguage(option.code)}
            aria-pressed={isActive}
            className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D3E] ${
              isActive
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-stone-600 hover:text-zinc-900'
            }`}
          >
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden">{option.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
