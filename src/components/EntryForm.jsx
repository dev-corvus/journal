/**
 * @fileoverview Daily reflection composer component (RF01) supporting date adjustment, mood check-in, and free/guided writing.
 */

import { AlertCircle, Check, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GUIDED_PROMPT_IDS, isValidDateString, isValidMood } from '../types/journalTypes.js';
import MoodSelector from './MoodSelector.jsx';

/** @typedef {import('../types/journalTypes.js').MoodId} MoodId */
/** @typedef {import('../types/journalTypes.js').WritingMode} WritingMode */
/** @typedef {import('../types/journalTypes.js').JournalEntryDraft} JournalEntryDraft */

/**
 * Counts words in reflection text accurately across European languages.
 * @param {string} text
 * @returns {number}
 */
function countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}

/**
 * Entry creation form with low-friction defaults and optional guided prompts.
 * @param {{
 *   todayStr: string,
 *   selectedDate: string,
 *   onDateChange: (dateStr: string) => void,
 *   forcedMode: WritingMode | null,
 *   onConsumeForcedMode: () => void,
 *   textareaRef: import('react').RefObject<HTMLTextAreaElement | null>,
 *   formCopy: Record<string, string>,
 *   moodLabels: Record<MoodId, string>,
 *   promptCopy: Record<string, string>,
 *   onCreateEntry: (draft: JournalEntryDraft) => void
 * }} props
 */
export default function EntryForm({
  todayStr,
  selectedDate,
  onDateChange,
  forcedMode,
  onConsumeForcedMode,
  textareaRef,
  formCopy,
  moodLabels,
  promptCopy,
  onCreateEntry,
}) {
  const [mood, setMood] = useState(/** @type {MoodId | ''} */ (''));
  const [mode, setMode] = useState(/** @type {WritingMode} */ ('guided'));
  const [promptIndex, setPromptIndex] = useState(0);
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (forcedMode) {
      setMode(forcedMode);
      onConsumeForcedMode();
    }
  }, [forcedMode, onConsumeForcedMode]);

  useEffect(() => {
    if (!savedNotice) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setSavedNotice(false);
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [savedNotice]);

  const activePromptId = GUIDED_PROMPT_IDS[promptIndex % GUIDED_PROMPT_IDS.length];
  const wordCount = countWords(content);
  const wordLabel = wordCount === 1 ? formCopy.wordCountSingle : formCopy.wordCountPlural;

  function handleCyclePrompt() {
    setPromptIndex((prev) => (prev + 1) % GUIDED_PROMPT_IDS.length);
  }

  /**
   * @param {import('react').FormEvent<HTMLFormElement>} event
   */
  function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    if (!isValidDateString(selectedDate) || selectedDate > todayStr) {
      setErrorMessage(formCopy.validationDate);
      return;
    }

    if (!isValidMood(mood)) {
      setErrorMessage(formCopy.validationMood);
      return;
    }

    if (!content.trim()) {
      setErrorMessage(formCopy.validationContent);
      textareaRef.current?.focus();
      return;
    }

    onCreateEntry({
      date: selectedDate,
      mood,
      mode,
      promptId: mode === 'guided' ? activePromptId : null,
      content: content.trim(),
    });

    setMood('');
    setContent('');
    onDateChange(todayStr);
    setSavedNotice(true);
  }

  function handleReset() {
    setMood('');
    setContent('');
    setErrorMessage('');
    onDateChange(todayStr);
  }

  return (
    <section
      id="write"
      aria-labelledby="entry-form-heading"
      className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-7"
    >
      <div className="mb-6">
        <h2
          id="entry-form-heading"
          className="font-display text-2xl font-semibold tracking-tight text-zinc-900"
        >
          {formCopy.title}
        </h2>
        <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{formCopy.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Step 1: Date Selection */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <label htmlFor="entry-date-input" className="text-sm font-medium text-zinc-800">
              {formCopy.dateLabel}
            </label>
            {selectedDate !== todayStr && (
              <button
                type="button"
                onClick={() => onDateChange(todayStr)}
                className="text-xs font-medium text-[#1F4D3E] hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {formCopy.todayShortcut}
              </button>
            )}
          </div>
          <input
            id="entry-date-input"
            type="date"
            value={selectedDate}
            max={todayStr}
            onChange={(e) => {
              onDateChange(e.target.value);
              setErrorMessage('');
            }}
            className="w-full min-h-[44px] px-3.5 py-2 text-sm font-mono tabular-nums text-zinc-900 bg-[#FAF9F7] border border-stone-200 rounded-xl focus:outline-none focus:border-[#1F4D3E] focus:ring-2 focus:ring-[#1F4D3E]/15 transition-colors"
          />
        </div>

        {/* Step 2: Mood / Feeling Selection */}
        <div>
          <span className="block text-sm font-medium text-zinc-800 mb-2.5">
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

        {/* Step 3: Free vs Guided Mode Switch */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-sm font-medium text-zinc-800">{formCopy.modeLabel}</span>
            <div
              role="group"
              aria-label={formCopy.modeLabel}
              className="inline-flex items-center gap-1 p-1 bg-stone-100 rounded-xl"
            >
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
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span className="text-xs font-medium text-stone-500 tabular-nums">
                  {formCopy.guidedHeader} · {(promptIndex % GUIDED_PROMPT_IDS.length) + 1}/
                  {GUIDED_PROMPT_IDS.length}
                </span>
                <button
                  type="button"
                  onClick={handleCyclePrompt}
                  className="min-h-[32px] inline-flex items-center gap-1.5 text-xs font-medium text-[#1F4D3E] hover:text-[#173B2F] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D3E]"
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

          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label htmlFor="entry-content-textarea" className="text-sm font-medium text-zinc-800">
              {formCopy.contentLabel}
            </label>
            <span className="text-xs font-mono text-stone-400 tabular-nums">
              {wordCount} {wordLabel}
            </span>
          </div>

          <textarea
            id="entry-content-textarea"
            ref={textareaRef}
            rows={5}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errorMessage) {
                setErrorMessage('');
              }
            }}
            placeholder={
              mode === 'guided' ? formCopy.placeholderGuided : formCopy.placeholderFree
            }
            className="w-full px-4 py-3 text-base text-zinc-900 placeholder:text-stone-400 bg-[#FAF9F7] border border-stone-200 rounded-xl leading-relaxed resize-y focus:outline-none focus:bg-white focus:border-[#1F4D3E] focus:ring-2 focus:ring-[#1F4D3E]/15 transition-colors"
          />
        </div>

        {/* Gentle Validation Feedback */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-rose-50 text-rose-900 text-sm"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-700" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Saved Feedback */}
        {savedNotice && !errorMessage && (
          <div
            role="status"
            className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-emerald-50 text-emerald-900 text-sm"
          >
            <Check className="w-4 h-4 shrink-0 text-emerald-700 stroke-[2.5]" aria-hidden="true" />
            <span>{formCopy.savedFeedback}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={handleReset}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-stone-600 hover:text-zinc-900 hover:bg-stone-100 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D3E]"
          >
            {formCopy.clearButton}
          </button>

          <button
            type="submit"
            className="min-h-[44px] px-6 py-2.5 text-sm font-medium text-white bg-[#1F4D3E] hover:bg-[#173B2F] active:scale-[0.99] rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D3E]"
          >
            {formCopy.saveButton}
          </button>
        </div>
      </form>
    </section>
  );
}
