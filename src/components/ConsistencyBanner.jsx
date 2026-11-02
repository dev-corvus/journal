/**
 * @fileoverview Consistency & Retention overview card (RF05) displaying today's status, streak, and 7-day rhythm.
 */

import { Check, Clock, Flame } from 'lucide-react';
import { formatShortDay } from '../utils/consistencyUtils.js';

/** @typedef {import('../types/journalTypes.js').ConsistencyMetrics} ConsistencyMetrics */
/** @typedef {import('../types/journalTypes.js').LanguageCode} LanguageCode */

/**
 * Displays daily completion status, consecutive day streak, and interactive 7-day rhythm strip.
 * @param {{
 *   metrics: ConsistencyMetrics,
 *   locale: LanguageCode,
 *   copy: Record<string, string>,
 *   selectedDate: string,
 *   onSelectDay: (dateStr: string) => void,
 *   onFocusTodayWrite: () => void
 * }} props
 */
export default function ConsistencyBanner({
  metrics,
  locale,
  copy,
  selectedDate,
  onSelectDay,
  onFocusTodayWrite,
}) {
  const streakUnit =
    metrics.currentStreak === 1 ? copy.streakUnitSingle : copy.streakUnitPlural;

  return (
    <section
      id="consistency"
      aria-labelledby="consistency-heading"
      className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-7"
    >
      <h2 id="consistency-heading" className="sr-only">
        {copy.sectionTitle}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-stone-200/80">
        {/* Column 1: Today's Completion Status */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-stone-500">{copy.todayStatusLabel}</p>
              <div className="mt-1.5 flex items-center gap-2">
                {metrics.completedToday ? (
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 inline-flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                  </span>
                ) : (
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 inline-flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5 stroke-[2.2]" aria-hidden="true" />
                  </span>
                )}
                <span
                  className={`font-display text-xl font-semibold tracking-tight ${
                    metrics.completedToday ? 'text-emerald-900' : 'text-zinc-900'
                  }`}
                >
                  {metrics.completedToday ? copy.completedToday : copy.pendingToday}
                </span>
              </div>
            </div>

            {!metrics.completedToday && (
              <button
                type="button"
                onClick={onFocusTodayWrite}
                className="min-h-[40px] px-3.5 py-1.5 text-xs font-medium text-[#1F4D3E] bg-[#1F4D3E]/10 hover:bg-[#1F4D3E]/15 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D3E]"
              >
                {copy.writeNowAction}
              </button>
            )}
          </div>

          <p className="text-sm text-stone-600 leading-relaxed">
            {metrics.completedToday ? copy.completedHint : copy.pendingHint}
          </p>
        </div>

        {/* Column 2: Consecutive Day Streak (Offensive) */}
        <div className="lg:col-span-3 pt-5 lg:pt-0 lg:pl-8 flex flex-col justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-stone-500">{copy.streakLabel}</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <Flame
                className={`w-5 h-5 self-center shrink-0 ${
                  metrics.currentStreak > 0 ? 'text-amber-600' : 'text-stone-400'
                }`}
                aria-hidden="true"
              />
              <span className="font-display text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums">
                {metrics.currentStreak}
              </span>
              <span className="text-sm font-medium text-stone-600">{streakUnit}</span>
            </div>
          </div>

          {/* Clean unboxed metadata per Zero-Pill Discipline */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500 tabular-nums">
            <span>
              {copy.bestStreakLabel}: <strong className="font-medium text-stone-700">{metrics.longestStreak}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {copy.totalEntriesLabel}: <strong className="font-medium text-stone-700">{metrics.totalEntries}</strong>
            </span>
          </div>
        </div>

        {/* Column 3: Interactive 7-Day Rhythm Strip */}
        <div className="lg:col-span-5 pt-5 lg:pt-0 lg:pl-8 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
            <span className="font-medium">{copy.weekRhythmLabel}</span>
            <span className="tabular-nums">
              {copy.totalDaysLabel}: <strong className="font-medium text-stone-700">{metrics.uniqueDaysCount}</strong>
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {metrics.last7Days.map((day) => {
              const { weekday, dayNumber } = formatShortDay(day.date, locale);
              const isSelected = selectedDate === day.date;

              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => onSelectDay(day.date)}
                  aria-label={`${weekday} ${dayNumber}: ${
                    day.completed ? copy.dayCompletedAria : copy.dayMissingAria
                  }`}
                  className={`min-h-[58px] py-2 px-1 rounded-xl border flex flex-col items-center justify-between transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D3E] ${
                    day.completed
                      ? 'bg-[#1F4D3E]/8 border-[#1F4D3E]/30 text-[#1F4D3E]'
                      : 'bg-[#FAF9F7] border-stone-200/80 text-stone-500 hover:border-stone-300 hover:text-stone-800'
                  } ${isSelected ? 'ring-2 ring-[#1F4D3E]/40' : ''}`}
                >
                  <span className="text-[11px] font-medium truncate max-w-full">{weekday}</span>
                  <span className="text-xs font-mono font-medium tabular-nums">{dayNumber}</span>
                  <span className="h-3.5 flex items-center justify-center" aria-hidden="true">
                    {day.completed ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.5] text-[#1F4D3E]" />
                    ) : (
                      <span className="text-[11px] font-mono leading-none text-stone-400">–</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
