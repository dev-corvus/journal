/**
 * @fileoverview Clean 3-zone top navigation bar adhering to the Top Bar Contract.
 */

/**
 * Top navigation header with brand wordmark, section links, and primary write action.
 * @param {{
 *   navLabels: { write: string, consistency: string, timeline: string, prompts: string, newEntry: string },
 *   onStartNewEntry: () => void,
 *   onSelectGuidedPrompts: () => void
 * }} props
 */
export default function Header({ navLabels, onStartNewEntry, onSelectGuidedPrompts }) {
  return (
    <header className="sticky top-0 z-30 bg-[#F8F8F6]/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="font-display text-2xl font-semibold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1F4D3E]"
        >
          journal
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <a
            href="#write"
            className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {navLabels.write}
          </a>
          <a
            href="#consistency"
            className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {navLabels.consistency}
          </a>
          <a
            href="#timeline"
            className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {navLabels.timeline}
          </a>
          <a
            href="#write"
            onClick={onSelectGuidedPrompts}
            className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {navLabels.prompts}
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onStartNewEntry}
            className="min-h-[40px] px-4 py-2 text-sm font-medium text-white bg-[#1F4D3E] rounded-xl hover:bg-[#173B2F] active:scale-[0.99] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D3E]"
          >
            {navLabels.newEntry}
          </button>
        </div>
      </div>
    </header>
  );
}
