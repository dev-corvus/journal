/**
 * @fileoverview Chronological timeline section (RF02) with mood filtering, search, and empty states.
 */

import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MOOD_IDS } from '../types/journalTypes.js';
import EmptyState from './EmptyState.jsx';
import EntryCard from './EntryCard.jsx';

/** @typedef {import('../types/journalTypes.js').JournalEntry} JournalEntry */
/** @typedef {import('../types/journalTypes.js').LanguageCode} LanguageCode */
/** @typedef {import('../types/journalTypes.js').MoodId} MoodId */

/**
 * Displays saved reflections ordered chronologically from newest to oldest.
 * @param {{
 *   entries: JournalEntry[],
 *   todayStr: string,
 *   locale: LanguageCode,
 *   moodLabels: Record<MoodId, string>,
 *   promptCopy: Record<string, string>,
 *   timelineCopy: Record<string, string>,
 *   emptyStateCopy: { title: string, body: string, primaryAction: string, sampleAction: string },
 *   onEditEntry: (entry: JournalEntry) => void,
 *   onRequestDeleteEntry: (entry: JournalEntry) => void,
 *   onStartWriting: () => void,
 *   onLoadSamples: () => void
 * }} props
 */
export default function EntryTimeline({
  entries,
  todayStr,
  locale,
  moodLabels,
  promptCopy,
  timelineCopy,
  emptyStateCopy,
  onEditEntry,
  onRequestDeleteEntry,
  onStartWriting,
  onLoadSamples,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState(/** @type {'all' | MoodId} */ ('all'));

  const filteredEntries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return entries.filter((entry) => {
      if (moodFilter !== 'all' && entry.mood !== moodFilter) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const promptText =
        entry.mode === 'guided' && entry.promptId
          ? (promptCopy[entry.promptId] || '').toLowerCase()
          : '';
      return (
        entry.content.toLowerCase().includes(normalizedQuery) ||
        entry.date.includes(normalizedQuery) ||
        promptText.includes(normalizedQuery)
      );
    });
  }, [entries, moodFilter, searchQuery, promptCopy]);

  const countLabel =
    filteredEntries.length === 1
      ? timelineCopy.entriesCountSingle
      : timelineCopy.entriesCountPlural;

  const hasActiveFilters = moodFilter !== 'all' || searchQuery.trim().length > 0;

  function handleClearFilters() {
    setSearchQuery('');
    setMoodFilter('all');
  }

  return (
    <section id="timeline" aria-labelledby="timeline-heading" className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2
            id="timeline-heading"
            className="font-display text-2xl font-semibold tracking-tight text-zinc-900"
          >
            {timelineCopy.title}
          </h2>
          <p className="mt-1 text-sm text-stone-600">{timelineCopy.subtitle}</p>
        </div>

        {entries.length > 0 && (
          <span className="text-xs font-mono text-stone-500 tabular-nums">
            {filteredEntries.length} {countLabel}
          </span>
        )}
      </div>

      {/* Search & Mood Filter Toolbar (shown when at least 1 entry exists) */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <Search
              className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={timelineCopy.searchPlaceholder}
              aria-label={timelineCopy.searchPlaceholder}
              className="w-full min-h-[44px] pl-10 pr-10 py-2 text-sm text-zinc-900 placeholder:text-stone-400 bg-white border border-stone-200/90 rounded-xl focus:outline-none focus:border-[#1F4D3E] focus:ring-2 focus:ring-[#1F4D3E]/15 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label={timelineCopy.clearFilters}
                className="min-h-[36px] min-w-[36px] absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-stone-400 hover:text-zinc-900 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Interactive Mood Filter Segmented Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setMoodFilter('all')}
              aria-pressed={moodFilter === 'all'}
              className={`min-h-[38px] px-3 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                moodFilter === 'all'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white border border-stone-200/90 text-stone-600 hover:text-zinc-900'
              }`}
            >
              {timelineCopy.filterAll}
            </button>

            {MOOD_IDS.map((moodId) => {
              const isActive = moodFilter === moodId;
              return (
                <button
                  key={moodId}
                  type="button"
                  onClick={() => setMoodFilter(moodId)}
                  aria-pressed={isActive}
                  className={`min-h-[38px] px-3 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 text-white'
                      : 'bg-white border border-stone-200/90 text-stone-600 hover:text-zinc-900'
                  }`}
                >
                  {moodLabels[moodId]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content States */}
      {entries.length === 0 ? (
        <EmptyState
          copy={emptyStateCopy}
          onStartWriting={onStartWriting}
          onLoadSamples={onLoadSamples}
        />
      ) : filteredEntries.length === 0 ? (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-8 text-center">
          <h3 className="font-display text-lg font-semibold text-zinc-900">
            {timelineCopy.noFilterResultsTitle}
          </h3>
          <p className="mt-1.5 text-sm text-stone-600 max-w-md mx-auto">
            {timelineCopy.noFilterResultsBody}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-5 min-h-[44px] px-4 py-2 text-sm font-medium text-[#1F4D3E] bg-[#1F4D3E]/10 hover:bg-[#1F4D3E]/15 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {timelineCopy.clearFilters}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              todayStr={todayStr}
              locale={locale}
              moodLabels={moodLabels}
              promptCopy={promptCopy}
              timelineCopy={timelineCopy}
              onEdit={onEditEntry}
              onRequestDelete={onRequestDeleteEntry}
            />
          ))}
        </div>
      )}
    </section>
  );
}
