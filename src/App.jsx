/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ConsistencyBanner from './components/ConsistencyBanner.jsx';
import DeleteConfirmModal from './components/DeleteConfirmModal.jsx';
import EditEntryModal from './components/EditEntryModal.jsx';
import EntryForm from './components/EntryForm.jsx';
import EntryTimeline from './components/EntryTimeline.jsx';
import Header from './components/Header.jsx';
import LanguageSwitcher from './components/LanguageSwitcher.jsx';
import { TRANSLATIONS } from './i18n/translations.js';
import {
  createJournalEntry,
  deleteJournalEntry,
  loadEntries,
  loadLanguagePreference,
  saveLanguagePreference,
  seedSampleJournalEntries,
  updateJournalEntry,
} from './services/storageService.js';
import { calculateConsistencyMetrics, getTodayDateString } from './utils/consistencyUtils.js';

/** @typedef {import('./types/journalTypes.js').JournalEntry} JournalEntry */
/** @typedef {import('./types/journalTypes.js').JournalEntryDraft} JournalEntryDraft */
/** @typedef {import('./types/journalTypes.js').LanguageCode} LanguageCode */
/** @typedef {import('./types/journalTypes.js').WritingMode} WritingMode */

export default function App() {
  const todayStr = useMemo(() => getTodayDateString(), []);

  const [language, setLanguage] = useState(/** @type {LanguageCode} */ (() => loadLanguagePreference()));
  const [entries, setEntries] = useState(/** @type {JournalEntry[]} */ (() => loadEntries()));
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [forcedMode, setForcedMode] = useState(/** @type {WritingMode | null} */ (null));
  const [entryBeingEdited, setEntryBeingEdited] = useState(/** @type {JournalEntry | null} */ (null));
  const [entryPendingDelete, setEntryPendingDelete] = useState(/** @type {JournalEntry | null} */ (null));

  /** @type {import('react').RefObject<HTMLTextAreaElement | null>} */
  const textareaRef = useRef(null);

  useEffect(() => {
    saveLanguagePreference(language);
  }, [language]);

  const copy = TRANSLATIONS[language];

  const consistencyMetrics = useMemo(
    () => calculateConsistencyMetrics(entries, todayStr),
    [entries, todayStr]
  );

  const focusComposer = useCallback(
    (/** @type {string} */ targetDate = todayStr, /** @type {WritingMode | null} */ mode = null) => {
      setSelectedDate(targetDate);
      if (mode) {
        setForcedMode(mode);
      }
      const writeSection = document.getElementById('write');
      writeSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => {
        textareaRef.current?.focus();
      }, 220);
    },
    [todayStr]
  );

  const handleConsumeForcedMode = useCallback(() => {
    setForcedMode(null);
  }, []);

  /** @param {JournalEntryDraft} draft */
  function handleCreateEntry(draft) {
    const updated = createJournalEntry(draft);
    setEntries(updated);
  }

  /**
   * @param {string} id
   * @param {JournalEntryDraft} draft
   */
  function handleUpdateEntry(id, draft) {
    const updated = updateJournalEntry(id, draft);
    setEntries(updated);
    setEntryBeingEdited(null);
  }

  /** @param {string} id */
  function handleConfirmDelete(id) {
    const updated = deleteJournalEntry(id);
    setEntries(updated);
    setEntryPendingDelete(null);
  }

  function handleLoadSamples() {
    const updated = seedSampleJournalEntries(copy.sampleEntries);
    setEntries(updated);
  }

  /** @param {string} dateStr */
  function handleSelectConsistencyDay(dateStr) {
    setSelectedDate(dateStr);
    focusComposer(dateStr);
  }

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F8F8F6] text-zinc-900">
      {/* Top Bar Contract (3-Zone Header) */}
      <Header
        navLabels={copy.nav}
        onStartNewEntry={() => focusComposer(todayStr)}
        onSelectGuidedPrompts={() => focusComposer(selectedDate, 'guided')}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10">
        {/* Editorial Welcome & Language Toolbar */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-[#1F4D3E]">{copy.hero.kicker}</p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 leading-[1.15] text-balance">
              {copy.hero.title}
            </h1>
            <p className="mt-3 text-base text-stone-600 leading-relaxed max-w-[65ch]">
              {copy.hero.subtitle}
            </p>
          </div>

          <div className="self-start md:self-end">
            <LanguageSwitcher
              currentLanguage={language}
              onChangeLanguage={setLanguage}
              ariaLabel={copy.hero.languageLabel}
            />
          </div>
        </section>

        {/* RF05: Consistency & Retention Overview */}
        <ConsistencyBanner
          metrics={consistencyMetrics}
          locale={language}
          copy={copy.consistency}
          selectedDate={selectedDate}
          onSelectDay={handleSelectConsistencyDay}
          onFocusTodayWrite={() => focusComposer(todayStr)}
        />

        {/* Two-Column Responsive Workspace: Composer + Chronological Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: RF01 Entry Composer */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <EntryForm
              todayStr={todayStr}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              forcedMode={forcedMode}
              onConsumeForcedMode={handleConsumeForcedMode}
              textareaRef={textareaRef}
              formCopy={copy.form}
              moodLabels={copy.moods}
              promptCopy={copy.prompts}
              onCreateEntry={handleCreateEntry}
            />
          </div>

          {/* Right Column: RF02 Timeline History */}
          <div className="lg:col-span-7">
            <EntryTimeline
              entries={entries}
              todayStr={todayStr}
              locale={language}
              moodLabels={copy.moods}
              promptCopy={copy.prompts}
              timelineCopy={copy.timeline}
              emptyStateCopy={copy.emptyState}
              onEditEntry={setEntryBeingEdited}
              onRequestDeleteEntry={setEntryPendingDelete}
              onStartWriting={() => focusComposer(todayStr)}
              onLoadSamples={handleLoadSamples}
            />
          </div>
        </div>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="mt-16 border-t border-stone-200/80 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <span className="font-display text-sm font-medium text-zinc-800">journal</span>
          <span>{copy.footer.note}</span>
        </div>
      </footer>

      {/* RF03: Edit Existing Entry Modal */}
      <EditEntryModal
        entry={entryBeingEdited}
        todayStr={todayStr}
        modalCopy={copy.editModal}
        formCopy={copy.form}
        moodLabels={copy.moods}
        promptCopy={copy.prompts}
        onSave={handleUpdateEntry}
        onClose={() => setEntryBeingEdited(null)}
      />

      {/* RF04: Delete Entry Confirmation Modal */}
      <DeleteConfirmModal
        entry={entryPendingDelete}
        locale={language}
        moodLabels={copy.moods}
        modalCopy={copy.deleteModal}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEntryPendingDelete(null)}
      />
    </div>
  );
}
