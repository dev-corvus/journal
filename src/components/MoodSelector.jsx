/**
 * @fileoverview Accessible 5-state mood selector component with >=44px touch targets.
 */

import { MOOD_IDS, MOOD_VISUALS } from '../types/journalTypes.js';
import MoodIcon from './MoodIcon.jsx';

/** @typedef {import('../types/journalTypes.js').MoodId} MoodId */

/**
 * Allows rapid selection among the 5 core emotional states.
 * @param {{
 *   selectedMood: MoodId | '',
 *   onSelectMood: (mood: MoodId) => void,
 *   moodLabels: Record<MoodId, string>,
 *   groupLabel: string
 * }} props
 */
export default function MoodSelector({ selectedMood, onSelectMood, moodLabels, groupLabel }) {
  return (
    <div role="radiogroup" aria-label={groupLabel} className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {MOOD_IDS.map((moodId) => {
        const isSelected = selectedMood === moodId;
        const visual = MOOD_VISUALS[moodId];

        return (
          <button
            key={moodId}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelectMood(moodId)}
            className={`min-h-[56px] px-2.5 py-2 rounded-xl border text-left sm:text-center flex sm:flex-col items-center justify-start sm:justify-center gap-2 sm:gap-1.5 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D3E] cursor-pointer ${
              isSelected
                ? `${visual.activeBg} ${visual.activeBorder} ${visual.accentText} shadow-xs`
                : 'bg-[#FAF9F7] border-stone-200/90 text-stone-700 hover:bg-stone-100/80 hover:border-stone-300'
            }`}
          >
            <MoodIcon
              mood={moodId}
              className={`w-5 h-5 shrink-0 ${isSelected ? visual.iconTone : 'text-stone-500'}`}
            />
            <span className="text-xs font-medium leading-tight truncate max-w-full">
              {moodLabels[moodId]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
