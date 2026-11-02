/**
 * @fileoverview Accessible confirmation modal preventing accidental entry deletion (RF04).
 */

import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { formatEntryDate } from '../utils/consistencyUtils.js';

/** @typedef {import('../types/journalTypes.js').JournalEntry} JournalEntry */
/** @typedef {import('../types/journalTypes.js').LanguageCode} LanguageCode */
/** @typedef {import('../types/journalTypes.js').MoodId} MoodId */

/**
 * Confirmation step before removing an entry from persistent storage.
 * @param {{
 *   entry: JournalEntry | null,
 *   locale: LanguageCode,
 *   moodLabels: Record<MoodId, string>,
 *   modalCopy: { title: string, body: string, confirmDelete: string, cancel: string },
 *   onConfirm: (id: string) => void,
 *   onCancel: () => void
 * }} props
 */
export default function DeleteConfirmModal({
  entry,
  locale,
  moodLabels,
  modalCopy,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!entry) {
      return undefined;
    }
    /** @param {KeyboardEvent} e */
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [entry, onCancel]);

  if (!entry) {
    return null;
  }

  const formattedDate = formatEntryDate(entry.date, locale);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-entry-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-xs p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-stone-200 p-6 sm:p-7 shadow-xl">
        <div className="sm:hidden w-10 h-1.5 bg-stone-300 rounded-full mx-auto mb-4" aria-hidden="true" />

        <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5" aria-hidden="true" />
        </div>

        <h2
          id="delete-entry-modal-title"
          className="font-display text-xl font-semibold tracking-tight text-zinc-900"
        >
          {modalCopy.title}
        </h2>

        <p className="mt-1.5 text-xs text-stone-500">
          {formattedDate} · {moodLabels[entry.mood]}
        </p>

        <p className="mt-3 text-sm text-stone-600 leading-relaxed">{modalCopy.body}</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-stone-600 hover:text-zinc-900 hover:bg-stone-100 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {modalCopy.cancel}
          </button>

          <button
            type="button"
            onClick={() => onConfirm(entry.id)}
            className="min-h-[44px] px-5 py-2.5 text-sm font-medium text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {modalCopy.confirmDelete}
          </button>
        </div>
      </div>
    </div>
  );
}
