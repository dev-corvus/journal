/**
 * @fileoverview Journal entry card component (RF02) displaying formatted date, mood, prompt, text, and actions.
 */

import { Pencil, Trash2 } from 'lucide-react';
import { MOOD_VISUALS } from '../types/journalTypes.js';
import { formatEntryDate, shiftDateString } from '../utils/consistencyUtils.js';
import MoodIcon from './MoodIcon.jsx';

/** @typedef {import('../types/journalTypes.js').JournalEntry} JournalEntry */
/** @typedef {import('../types/journalTypes.js').LanguageCode} LanguageCode */
/** @typedef {import('../types/journalTypes.js').MoodId} MoodId */

/**
 * Renders a single reflection card in the chronological timeline.
 * @param {{
 *   entry: JournalEntry,
 *   todayStr: string,
 *   locale: LanguageCode,
 *   moodLabels: Record<MoodId, string>,
 *   promptCopy: Record<string, string>,
 *   timelineCopy: Record<string, string>,
 *   onEdit: (entry: JournalEntry) => void,
 *   onRequestDelete: (entry: JournalEntry) => void
 * }} props
 */
export default function EntryCard({
  entry,
  todayStr,
  locale,
  moodLabels,
  promptCopy,
  timelineCopy,
  onEdit,
  onRequestDelete,
}) {
  const formattedDate = formatEntryDate(entry.date, locale);
  const yesterdayStr = shiftDateString(todayStr, -1);
  const relativeDayLabel =
    entry.date === todayStr
      ? timelineCopy.todayTag
      : entry.date === yesterdayStr
        ? timelineCopy.yesterdayTag
        : null;

  const isEdited = entry.updatedAt !== entry.createdAt;
  const moodVisual = MOOD_VISUALS[entry.mood];
  const promptQuestion =
    entry.mode === 'guided' && entry.promptId ? promptCopy[entry.promptId] : null;

  return (
    <article className="bg-white border border-stone-200/90 hover:border-stone-300 rounded-2xl p-5 sm:p-6 transition-colors">
      {/* Header Row: Unboxed clean metadata + Edit/Delete controls */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-stone-100">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
            <time dateTime={entry.date} className="font-medium text-zinc-900">
              {formattedDate}
            </time>
            {relativeDayLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-[#1F4D3E]">{relativeDayLabel}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>
              {entry.mode === 'guided' ? timelineCopy.guidedEntryTag : timelineCopy.freeEntryTag}
            </span>
            {isEdited && (
              <>
                <span aria-hidden="true">·</span>
                <span>{timelineCopy.editedTag}</span>
              </>
            )}
          </div>

          {/* Mood Indicator: Icon + explicit text label (no pill enclosure) */}
          <div className={`inline-flex items-center gap-1.5 text-sm font-medium ${moodVisual.accentText}`}>
            <MoodIcon mood={entry.mood} className={`w-4 h-4 shrink-0 ${moodVisual.iconTone}`} />
            <span>{moodLabels[entry.mood]}</span>
          </div>
        </div>

        {/* Interactive Edit & Delete Actions (>=44px touch hitboxes) */}
        <div className="flex items-center gap-1 shrink-0 -my-1 -mr-1">
          <button
            type="button"
            onClick={() => onEdit(entry)}
            aria-label={`${timelineCopy.editAction} — ${formattedDate}`}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-zinc-900 hover:bg-stone-100 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D3E]"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{timelineCopy.editAction}</span>
          </button>

          <button
            type="button"
            onClick={() => onRequestDelete(entry)}
            aria-label={`${timelineCopy.deleteAction} — ${formattedDate}`}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{timelineCopy.deleteAction}</span>
          </button>
        </div>
      </div>

      {/* Optional Guided Question Context */}
      {promptQuestion && (
        <p className="mt-3.5 text-sm font-display italic text-stone-600 leading-snug">
          {promptQuestion}
        </p>
      )}

      {/* Reflection Prose */}
      <p className="mt-3 text-[15px] sm:text-base text-zinc-800 leading-relaxed whitespace-pre-line break-words max-w-[70ch]">
        {entry.content}
      </p>
    </article>
  );
}
