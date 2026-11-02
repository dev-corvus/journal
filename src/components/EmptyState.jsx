/**
 * @fileoverview Welcoming empty state component shown when no journal entries exist yet.
 */

import { BookOpen, PenLine } from 'lucide-react';

/**
 * Encourages overwhelmed beginners to write their first reflection or preview sample entries.
 * @param {{
 *   copy: { title: string, body: string, primaryAction: string, sampleAction: string },
 *   onStartWriting: () => void,
 *   onLoadSamples: () => void
 * }} props
 */
export default function EmptyState({ copy, onStartWriting, onLoadSamples }) {
  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl px-6 py-12 sm:px-10 sm:py-14 text-center">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-[#1F4D3E]/10 text-[#1F4D3E] flex items-center justify-center mb-5">
        <BookOpen className="w-6 h-6" aria-hidden="true" />
      </div>

      <h3 className="font-display text-2xl font-semibold tracking-tight text-zinc-900 max-w-md mx-auto text-balance">
        {copy.title}
      </h3>

      <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed max-w-lg mx-auto">
        {copy.body}
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onStartWriting}
          className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1F4D3E] hover:bg-[#173B2F] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D3E]"
        >
          <PenLine className="w-4 h-4" aria-hidden="true" />
          <span>{copy.primaryAction}</span>
        </button>

        <button
          type="button"
          onClick={onLoadSamples}
          className="min-h-[44px] px-4 py-2.5 text-sm font-medium text-stone-600 hover:text-zinc-900 hover:bg-stone-100 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D3E]"
        >
          {copy.sampleAction}
        </button>
      </div>
    </div>
  );
}
