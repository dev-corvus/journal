/**
 * @fileoverview Browser storage service for persisting journal entries and language preferences (RF06).
 */

import {
  DEFAULT_LANGUAGE,
  isValidDateString,
  isValidJournalEntry,
  isValidLanguage,
  isValidMood,
} from '../types/journalTypes.js';
import { getTodayDateString, shiftDateString, sortEntriesChronologically } from '../utils/consistencyUtils.js';

/** @typedef {import('../types/journalTypes.js').JournalEntry} JournalEntry */
/** @typedef {import('../types/journalTypes.js').JournalEntryDraft} JournalEntryDraft */
/** @typedef {import('../types/journalTypes.js').LanguageCode} LanguageCode */

const ENTRIES_STORAGE_KEY = 'journal.entries.v1';
const LANGUAGE_STORAGE_KEY = 'journal.language.v1';

/**
 * Generates a collision-resistant identifier for journal entries.
 * @returns {string}
 */
function generateEntryId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `entry_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Loads all saved journal entries from localStorage, validated and chronologically sorted.
 * @returns {JournalEntry[]}
 */
export function loadEntries() {
  try {
    const raw = window.localStorage.getItem(ENTRIES_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const validEntries = parsed.filter(isValidJournalEntry);
    return sortEntriesChronologically(validEntries);
  } catch {
    return [];
  }
}

/**
 * Persists the full array of journal entries to localStorage and returns the sorted list.
 * @param {JournalEntry[]} entries
 * @returns {JournalEntry[]}
 */
export function persistEntries(entries) {
  const sorted = sortEntriesChronologically(entries);
  try {
    window.localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(sorted));
  } catch {
    // Ignore storage quota errors gracefully in constrained browser contexts
  }
  return sorted;
}

/**
 * Creates a new journal entry, saves it to localStorage, and returns the updated list (RF01, RF06).
 * @param {JournalEntryDraft} draft
 * @returns {JournalEntry[]}
 */
export function createJournalEntry(draft) {
  if (!isValidDateString(draft.date) || !isValidMood(draft.mood) || !draft.content.trim()) {
    throw new Error('Invalid journal entry payload.');
  }

  const nowIso = new Date().toISOString();
  /** @type {JournalEntry} */
  const newEntry = {
    id: generateEntryId(),
    date: draft.date,
    mood: draft.mood,
    mode: draft.mode === 'guided' ? 'guided' : 'free',
    promptId: draft.mode === 'guided' && draft.promptId ? draft.promptId : null,
    content: draft.content.trim(),
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const current = loadEntries();
  return persistEntries([newEntry, ...current]);
}

/**
 * Updates an existing journal entry by ID, persists to localStorage, and returns the updated list (RF03, RF06).
 * @param {string} id
 * @param {JournalEntryDraft} draft
 * @returns {JournalEntry[]}
 */
export function updateJournalEntry(id, draft) {
  if (!isValidDateString(draft.date) || !isValidMood(draft.mood) || !draft.content.trim()) {
    throw new Error('Invalid journal entry update payload.');
  }

  const nowIso = new Date().toISOString();
  const current = loadEntries();
  const updated = current.map((entry) => {
    if (entry.id !== id) {
      return entry;
    }
    return {
      ...entry,
      date: draft.date,
      mood: draft.mood,
      mode: draft.mode === 'guided' ? 'guided' : 'free',
      promptId: draft.mode === 'guided' && draft.promptId ? draft.promptId : null,
      content: draft.content.trim(),
      updatedAt: nowIso,
    };
  });

  return persistEntries(updated);
}

/**
 * Deletes an entry by ID from localStorage and returns the updated list (RF04, RF06).
 * @param {string} id
 * @returns {JournalEntry[]}
 */
export function deleteJournalEntry(id) {
  const current = loadEntries();
  const remaining = current.filter((entry) => entry.id !== id);
  return persistEntries(remaining);
}

/**
 * Seeds localised sample entries for the past few days when requested by the user from the empty state.
 * @param {Array<{ daysAgo: number, mood: import('../types/journalTypes.js').MoodId, mode: import('../types/journalTypes.js').WritingMode, promptId: string | null, content: string }>} templates
 * @returns {JournalEntry[]}
 */
export function seedSampleJournalEntries(templates) {
  const todayStr = getTodayDateString();
  const nowMs = Date.now();
  /** @type {JournalEntry[]} */
  const seeded = templates.map((item, idx) => {
    const timestamp = new Date(nowMs - idx * 60000).toISOString();
    return {
      id: generateEntryId(),
      date: shiftDateString(todayStr, -item.daysAgo),
      mood: item.mood,
      mode: item.mode,
      promptId: item.promptId,
      content: item.content,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });

  const current = loadEntries();
  return persistEntries([...seeded, ...current]);
}

/**
 * Retrieves the user's saved language code, defaulting to UK English ('en-GB').
 * @returns {LanguageCode}
 */
export function loadLanguagePreference() {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isValidLanguage(stored)) {
      return stored;
    }
  } catch {
    // Fallback to default UK English
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Persists the user's selected language code and updates `<html lang="...">`.
 * @param {LanguageCode} language
 */
export function saveLanguagePreference(language) {
  if (!isValidLanguage(language)) {
    return;
  }
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage quota issues
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
  }
}
