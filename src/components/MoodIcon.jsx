/**
 * @fileoverview Bespoke calm facial expression SVG icons for the 5 emotional states.
 */

/** @typedef {import('../types/journalTypes.js').MoodId} MoodId */

/**
 * Renders a crisp, expressive SVG face icon corresponding to a mood state.
 * @param {{ mood: MoodId, className?: string }} props
 */
export default function MoodIcon({ mood, className = 'w-5 h-5' }) {
  switch (mood) {
    case 'very_good':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9.5" />
          <path d="M8.2 10.2c.4-.7 1.2-.7 1.6 0" />
          <path d="M14.2 10.2c.4-.7 1.2-.7 1.6 0" />
          <path d="M8 14c.9 2 2.3 3 4 3s3.1-1 4-3" />
        </svg>
      );
    case 'good':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9.5" />
          <circle cx="9" cy="10" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10" r="0.9" fill="currentColor" stroke="none" />
          <path d="M8.8 14.5c.8 1.2 1.9 1.8 3.2 1.8s2.4-.6 3.2-1.8" />
        </svg>
      );
    case 'neutral':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9.5" />
          <circle cx="9" cy="10" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10" r="0.9" fill="currentColor" stroke="none" />
          <line x1="8.8" y1="15" x2="15.2" y2="15" />
        </svg>
      );
    case 'tired_anxious':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9.5" />
          <path d="M8 10.5h2.2" />
          <path d="M13.8 10.5H16" />
          <path d="M8.5 15.6c1-.8 2-.8 3.5 0 1.5.8 2.5.8 3.5 0" />
        </svg>
      );
    case 'difficult':
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9.5" />
          <circle cx="9" cy="10.2" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10.2" r="0.9" fill="currentColor" stroke="none" />
          <path d="M8.8 16.2c.8-1.2 1.9-1.8 3.2-1.8s2.4.6 3.2 1.8" />
        </svg>
      );
  }
}
