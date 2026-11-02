/**
 * @fileoverview Accessible modal/bottom-sheet dialogue for editing an existing journal entry (RF03).
 */

import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GUIDED_PROMPT_IDS, isValidDateString, isValidMood } from '../types/journalTypes.js';
import MoodSelector from './MoodSelector.jsx';

/** @typedef {import('../types/journalTypes.js').JournalEntry} JournalEntry */
/** @typedef {import('../types/journalTypes.js').JournalEntryDraft} JournalEntryDraft */
/** @typedef {import('../types/journalTypes.js').MoodId} MoodId */

/**
 * Allows updating date, mood, mode/prompt, or text of any saved journal entry.
 * @param {{
 *   entry: JournalEntry | null,
 *   todayStr: string,
 *   modalCopy: { title: string, subtitle: string, saveChanges: string, cancel: string, closeAria: string },
 *   formCopy: Record<string, string>,
 *   moodLabels: Record<MoodId, string>,
 *   promptCopy: Record<string, string>,
 *   onSave: (id: string, draft: JournalEntryDraft) => void,
 *   onClose: () => void
 * }} props
 */
export default function EditEntryModal({
  entry,
  todayStr,
  modalCopy,
  formCopy,
  moodLabels,
  promptCopy,
  onSave,
  onClose,
}) {
  const [date, setDate] = useState('');
  const [mood, setMood] = useState(/** @type {MoodId | ''} */ (''));
  const [mode, setMode] = useState(/** @type {'free' | 'guided'} */ ('free'));
  const [promptIndex, setPromptIndex] = useState(0);
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!entry) {
      return;
    }
    setDate(entry.date);
    setMood(entry.mood);
    setMode(entry.mode);
    const existingPromptIdx = entry.promptId
      ? GUIDED_PROMPT_IDS.indexOf(entry.promptId)
      : -1;
    setPromptIndex(existingPromptIdx >= 0 ? existingPromptIdx : 0);
    setContent(entry.content);
    setErrorMessage('');
  }, [entry]);

  useEffect(() => {
    if (!entry) {
      return undefined;
    }
    /** @param {KeyboardEvent} e */
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [entry, onClose]);

  if (!entry) {
    return null;
  }

  const activePromptId = GUIDED_PROMPT_IDS[promptIndex % GUIDED_PROMPT_IDS.length];

  /** @param {import('react').FormEvent<HTMLFormElement>} event */
  function handleSubmit(event) {
    event.preventDefault();
    if (!entry) {
      return;
    }

    if (!isValidDateString(date) || date > todayStr) {
      setErrorMessage(formCopy.validationDate);
      return;
    }
    if (!isValidMood(mood)) {
      setErrorMessage(formCopy.validationMood);
      return;
    }
    if (!content.trim()) {
      setErrorMessage(formCopy.validationContent);
      return;
    }

    onSave(entry.id, {
      date,
      mood,
      mode,
      promptId: mode === 'guided' ? activePromptId : null,
      content: content.trim(),
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-entry-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-xs p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-2xl border border-stone-200 p-6 sm:p-7 shadow-xl">
        {/* Mobile grab handle */}
        <div className="sm:hidden w-10 h-1.5 bg-stone-300 rounded-full mx-auto mb-4" aria-hidden="true" />

        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2
              id="edit-entry-modal-title"
              className="font-display text-2xl font-semibold tracking-tight text-zinc-900"
            >
              {modalCopy.title}
            </h2>
            <p className="mt-1 text-sm text-stone-600">{modalCopy.subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={modalCopy.closeAria}
            className="min-h-[44px] min-w-[44px] -mt-1 -mr-2 flex items-center justify-center text-stone-500 hover:text-zinc-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Date */}
          <div>
            <label htmlFor="edit-entry-date" className="block text-sm font-medium text-zinc-800 mb-2">
              {formCopy.dateLabel}
            </label>
            <input
              id="edit-entry-date"
              type="date"
              value={date}
              max={todayStr}
              onChange={(e) => {
                setDate(e.target.value);
                setErrorMessage('');
              }}
              className="w-full min-h-[44px] px-3.5 py-2 text-sm font-mono tabular-nums text-zinc-900 bg-[#FAF9F7] border border-stone-200 rounded-xl focus:outline-none focus:border-[#1F4D3E] focus:ring-2 focus:ring-[#1F4D3E]/15"
            />
          </div>

          {/* Mood */}
          <div>
            <span className="block text-sm font-medium text-zinc-800 mb-2">
              {formCopy.moodLabel}
            </span>
            <MoodSelector
              selectedMood={mood}
              onSelectMood={(selected) => {
                setMood(selected);
                setErrorMessage('');
              }}
              moodLabels={moodLabels}
              groupLabel={formCopy.moodLabel}
            />
          </div>

          {/* Mode & Prompt */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-sm font-medium text-zinc-800">{formCopy.modeLabel}</span>
              <div className="inline-flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMode('free')}
                  aria-pressed={mode === 'free'}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    mode === 'free'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-stone-600 hover:text-zinc-900'
                  }`}
                >
                  {formCopy.modeFree}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('guided')}
                  aria-pressed={mode === 'guided'}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    mode === 'guided'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-stone-600 hover:text-zinc-900'
                  }`}
                >
                  {formCopy.modeGuided}
                </button>
              </div>
            </div>

            {mode === 'guided' && (
              <div className="mb-3 bg-[#F4F3EE] rounded-xl px-4 py-3.5">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-xs font-medium text-stone-500">
                    {formCopy.guidedHeader}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPromptIndex((prev) => (prev + 1) % GUIDED_PROMPT_IDS.length)}
                    className="min-h-[32px] inline-flex items-center gap-1.5 text-xs font-medium text-[#1F4D3E] hover:text-[#173B2F] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{formCopy.shufflePrompt}</span>
                  </button>
                </div>
                <p className="font-display text-base font-medium text-zinc-900 leading-snug">
                  {promptCopy[activePromptId]}
                </p>
              </div>
            )}

            <label
              htmlFor="edit-entry-content"
              className="block text-sm font-medium text-zinc-800 mb-1.5"
            >
              {formCopy.contentLabel}
            </label>
            <textarea
              id="edit-entry-content"
              rows={5}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errorMessage) {
                  setErrorMessage('');
                }
              }}
              className="w-full px-4 py-3 text-base text-zinc-900 bg-[#FAF9F7] border border-stone-200 rounded-xl leading-relaxed resize-y focus:outline-none focus:bg-white focus:border-[#1F4D3E] focus:ring-2 focus:ring-[#1F4D3E]/15"
            />
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-rose-50 text-rose-900 text-sm"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-700" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-sm font-medium text-stone-600 hover:text-zinc-900 hover:bg-stone-100 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {modalCopy.cancel}
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2.5 text-sm font-medium text-white bg-[#1F4D3E] hover:bg-[#173B2F] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {modalCopy.saveChanges}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
