/**
 * @fileoverview DST-safe local date helpers and consistency streak calculation (RF05).
 */

/** @typedef {import('../types/journalTypes.js').JournalEntry} JournalEntry */
/** @typedef {import('../types/journalTypes.js').ConsistencyMetrics} ConsistencyMetrics */
/** @typedef {import('../types/journalTypes.js').LanguageCode} LanguageCode */

/**
 * Returns today's date in the user's local timezone formatted as YYYY-MM-DD.
 * @param {Date} [now]
 * @returns {string}
 */
export function getTodayDateString(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Shifts a YYYY-MM-DD date string by `deltaDays` using UTC integer math so DST transitions never skew dates.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {number} deltaDays
 * @returns {string}
 */
export function shiftDateString(dateStr, deltaDays) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day + deltaDays));
  const y = utcDate.getUTCFullYear();
  const m = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(utcDate.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats a YYYY-MM-DD calendar date in the active locale (en-GB, es-ES, de-DE).
 * @param {string} dateStr
 * @param {LanguageCode} locale
 * @returns {string}
 */
export function formatEntryDate(dateStr, locale) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(utcDate);
}

/**
 * Formats a short weekday label (e.g. Mon, Tue) for the 7-day consistency bar.
 * @param {string} dateStr
 * @param {LanguageCode} locale
 * @returns {{ weekday: string, dayNumber: string }}
 */
export function formatShortDay(dateStr, locale) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const weekday = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    timeZone: 'UTC',
  })
    .format(utcDate)
    .replace('.', '');
  return {
    weekday,
    dayNumber: String(day).padStart(2, '0'),
  };
}

/**
 * Sorts journal entries chronologically from most recent to oldest (RF02).
 * @param {JournalEntry[]} entries
 * @returns {JournalEntry[]}
 */
export function sortEntriesChronologically(entries) {
  return [...entries].sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
}

/**
 * Calculates today's status, current consecutive day streak, longest streak, and 7-day activity (RF05).
 * @param {JournalEntry[]} entries
 * @param {string} [todayStr]
 * @returns {ConsistencyMetrics}
 */
export function calculateConsistencyMetrics(entries, todayStr = getTodayDateString()) {
  /** @type {Map<string, number>} */
  const countsByDate = new Map();

  for (const entry of entries) {
    if (entry.date <= todayStr) {
      countsByDate.set(entry.date, (countsByDate.get(entry.date) || 0) + 1);
    }
  }

  const completedToday = countsByDate.has(todayStr);

  // Current streak: starts today if completed today, otherwise yesterday if completed yesterday.
  let currentStreak = 0;
  const yesterdayStr = shiftDateString(todayStr, -1);
  let cursor = completedToday ? todayStr : countsByDate.has(yesterdayStr) ? yesterdayStr : null;

  while (cursor && countsByDate.has(cursor)) {
    currentStreak += 1;
    cursor = shiftDateString(cursor, -1);
  }

  // Longest streak across all unique active dates sorted ascending.
  const sortedUniqueDates = Array.from(countsByDate.keys()).sort((a, b) => a.localeCompare(b));
  let longestStreak = 0;
  let runningStreak = 0;
  /** @type {string | null} */
  let previousDate = null;

  for (const dateStr of sortedUniqueDates) {
    if (previousDate && shiftDateString(previousDate, 1) === dateStr) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    previousDate = dateStr;
  }

  // Last 7 days ending today (oldest -> today).
  const last7Days = [];
  for (let offset = -6; offset <= 0; offset += 1) {
    const date = shiftDateString(todayStr, offset);
    const entryCount = countsByDate.get(date) || 0;
    last7Days.push({
      date,
      completed: entryCount > 0,
      entryCount,
      isToday: date === todayStr,
    });
  }

  return {
    completedToday,
    currentStreak,
    longestStreak,
    totalEntries: entries.length,
    uniqueDaysCount: countsByDate.size,
    last7Days,
  };
}
