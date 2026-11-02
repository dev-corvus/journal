/**
 * @fileoverview Domain data types, constants, and validation helpers for journal.
 */

/**
 * Supported UI locales: UK English (default), Spanish, and German.
 * @typedef {'en-GB' | 'es-ES' | 'de-DE'} LanguageCode
 */

/**
 * Emotional state identifiers for daily check-ins.
 * @typedef {'very_good' | 'good' | 'neutral' | 'tired_anxious' | 'difficult'} MoodId
 */

/**
 * Reflection writing mode: open free writing or structured guided prompt.
 * @typedef {'free' | 'guided'} WritingMode
 */

/**
 * Single journal entry stored in persistent storage.
 * @typedef {Object} JournalEntry
 * @property {string} id - Unique identifier for the entry
 * @property {string} date - Local calendar date in YYYY-MM-DD format
 * @property {MoodId} mood - Selected emotional state of the day
 * @property {WritingMode} mode - Writing mode used ('free' or 'guided')
 * @property {string | null} promptId - Identifier of the guided question if mode is 'guided'
 * @property {string} content - Reflection prose written by the user
 * @property {string} createdAt - ISO timestamp when created
 * @property {string} updatedAt - ISO timestamp when last modified
 */

/**
 * Draft payload used when creating or updating a journal entry.
 * @typedef {Object} JournalEntryDraft
 * @property {string} date - Local calendar date in YYYY-MM-DD format
 * @property {MoodId | ''} mood - Selected mood identifier
 * @property {WritingMode} mode - Writing mode ('free' or 'guided')
 * @property {string | null} promptId - Optional guided prompt ID
 * @property {string} content - Reflection text
 */

/**
 * Daily activity summary for the 7-day consistency rhythm strip.
 * @typedef {Object} DayActivity
 * @property {string} date - Calendar date in YYYY-MM-DD format
 * @property {boolean} completed - Whether at least one entry exists on this date
 * @property {number} entryCount - Number of entries recorded on this date
 * @property {boolean} isToday - Whether this date matches today's local date
 */

/**
 * Calculated consistency and habit retention metrics (RF05).
 * @typedef {Object} ConsistencyMetrics
 * @property {boolean} completedToday - Whether at least one entry exists for today
 * @property {number} currentStreak - Consecutive days with at least one reflection
 * @property {number} longestStreak - Best consecutive day streak achieved so far
 * @property {number} totalEntries - Total saved journal entries
 * @property {number} uniqueDaysCount - Total unique calendar days with reflections
 * @property {DayActivity[]} last7Days - Activity state for each of the past 7 days
 */

/** @type {readonly LanguageCode[]} */
export const SUPPORTED_LANGUAGES = Object.freeze(['en-GB', 'es-ES', 'de-DE']);

/** @type {LanguageCode} */
export const DEFAULT_LANGUAGE = 'en-GB';

/** @type {readonly MoodId[]} */
export const MOOD_IDS = Object.freeze([
  'very_good',
  'good',
  'neutral',
  'tired_anxious',
  'difficult',
]);

/** @type {readonly WritingMode[]} */
export const WRITING_MODES = Object.freeze(['free', 'guided']);

/** @type {readonly string[]} */
export const GUIDED_PROMPT_IDS = Object.freeze([
  'gratitude',
  'mind_focus',
  'small_win',
  'calm_moment',
  'let_go',
  'energy_check',
]);

/**
 * Visual metadata for each mood state (paired with explicit translated text labels).
 * @type {Record<MoodId, { accentText: string, activeBg: string, activeBorder: string, iconTone: string }>}
 */
export const MOOD_VISUALS = Object.freeze({
  very_good: {
    accentText: 'text-emerald-800',
    activeBg: 'bg-emerald-50/90',
    activeBorder: 'border-emerald-600',
    iconTone: 'text-emerald-700',
  },
  good: {
    accentText: 'text-teal-800',
    activeBg: 'bg-teal-50/90',
    activeBorder: 'border-teal-600',
    iconTone: 'text-teal-700',
  },
  neutral: {
    accentText: 'text-stone-800',
    activeBg: 'bg-stone-100',
    activeBorder: 'border-stone-600',
    iconTone: 'text-stone-700',
  },
  tired_anxious: {
    accentText: 'text-amber-900',
    activeBg: 'bg-amber-50/90',
    activeBorder: 'border-amber-600',
    iconTone: 'text-amber-700',
  },
  difficult: {
    accentText: 'text-rose-900',
    activeBg: 'bg-rose-50/90',
    activeBorder: 'border-rose-600',
    iconTone: 'text-rose-700',
  },
});

/**
 * Checks whether a value is a valid supported language code.
 * @param {unknown} value
 * @returns {value is LanguageCode}
 */
export function isValidLanguage(value) {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(/** @type {LanguageCode} */ (value));
}

/**
 * Checks whether a value is a valid mood identifier.
 * @param {unknown} value
 * @returns {value is MoodId}
 */
export function isValidMood(value) {
  return typeof value === 'string' && MOOD_IDS.includes(/** @type {MoodId} */ (value));
}

/**
 * Checks whether a string is a valid YYYY-MM-DD calendar date.
 * @param {unknown} value
 * @returns {value is string}
 */
export function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

/**
 * Validates that a parsed storage item conforms to the JournalEntry shape.
 * @param {unknown} item
 * @returns {item is JournalEntry}
 */
export function isValidJournalEntry(item) {
  if (!item || typeof item !== 'object') {
    return false;
  }
  const record = /** @type {Record<string, unknown>} */ (item);
  return (
    typeof record.id === 'string' &&
    record.id.trim().length > 0 &&
    isValidDateString(record.date) &&
    isValidMood(record.mood) &&
    (record.mode === 'free' || record.mode === 'guided') &&
    (record.promptId === null || typeof record.promptId === 'string') &&
    typeof record.content === 'string' &&
    record.content.trim().length > 0 &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string'
  );
}
