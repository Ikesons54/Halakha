import React, { useState } from 'react';
import {
  BookOpen,
  Bookmark,
  Edit3,
  Network,
  Share2,
  ChevronDown,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { Scripture, Idea } from '../../types';
import { StorageService } from '../../lib/storage';

interface BibleReaderProps {
  scriptures: Scripture[];
  ideas: Idea[];
  initialScriptureId?: string;
  onOpenKnowledgeGraph: (nodeId?: string) => void;
  onOpenNoteModal: (idea?: Idea, scripture?: Scripture) => void;
  onOpenIdeaCard: (idea: Idea) => void;
}

export const BibleReader: React.FC<BibleReaderProps> = ({
  scriptures,
  ideas,
  initialScriptureId,
  onOpenKnowledgeGraph,
  onOpenNoteModal,
  onOpenIdeaCard,
}) => {
  const [selectedScriptureId, setSelectedScriptureId] = useState<string>(
    initialScriptureId || scriptures[0]?.id || 'sc-1'
  );
  const [activeVerseSheet, setActiveVerseSheet] = useState<Scripture | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentScripture =
    scriptures.find((s) => s.id === selectedScriptureId) || scriptures[0];

  // Find ideas related to the current scripture
  const relatedIdeas = ideas.filter(
    (i) => i.scriptureIds.includes(currentScripture?.id || '')
  );

  const handleSaveVerse = () => {
    if (currentScripture) {
      StorageService.saveNote({
        scriptureId: currentScripture.id,
        referenceTitle: `${currentScripture.reference} (${currentScripture.translation})`,
        content: `Bookmarked: "${currentScripture.text}"`,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header & Book Selector */}
      <div className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#B39452] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Scripture Reading Sanctuary
          </span>
          <h2 className="font-scripture text-2xl sm:text-3xl font-semibold text-[#202421] dark:text-[#F3F0E8] mt-1">
            {currentScripture?.book} Chapter {currentScripture?.chapter}
          </h2>
          <p className="text-xs text-[#69716B] dark:text-[#AEB6AF] mt-0.5">
            {currentScripture?.testament} • {currentScripture?.division} • {currentScripture?.translation}
          </p>
        </div>

        {/* Quick Passage Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="passage-select" className="sr-only">
            Select Biblical Passage
          </label>
          <div className="relative">
            <select
              id="passage-select"
              value={selectedScriptureId}
              onChange={(e) => {
                setSelectedScriptureId(e.target.value);
                setActiveVerseSheet(null);
              }}
              className="appearance-none bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl px-4 py-2.5 pr-9 text-xs sm:text-sm font-semibold text-[#202421] dark:text-[#F3F0E8] hover:border-[#B39452] focus:outline-none focus:ring-2 focus:ring-[#B39452]"
            >
              <optgroup label="Tanakh (Hebrew Bible)">
                {scriptures
                  .filter((s) => s.testament === 'Tanakh')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.reference} ({s.book})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Apostolic Scriptures (Brit Chadashah)">
                {scriptures
                  .filter((s) => s.testament === 'Apostolic')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.reference} ({s.book})
                    </option>
                  ))}
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-[#69716B] dark:text-[#AEB6AF] absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Scripture Text Card */}
      {currentScripture && (
        <section
          id="scripture-passage-view"
          className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-6 sm:p-10 shadow-xs relative"
        >
          {/* Translation Tag */}
          <div className="flex items-center justify-between border-b border-[#E8DDC8]/60 dark:border-[#2E3B33] pb-3 mb-6">
            <span className="text-xs font-semibold text-[#263A32] dark:text-[#E8DDC8] uppercase tracking-wider">
              {currentScripture.reference}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#E8DDC8]/60 dark:bg-[#222C27] text-[#69716B] dark:text-[#AEB6AF]">
              Translation: {currentScripture.translation}
            </span>
          </div>

          {/* Verses Block */}
          <div
            onClick={() => setActiveVerseSheet(currentScripture)}
            className="cursor-pointer group p-3 sm:p-5 rounded-xl hover:bg-[#F8F6F0] dark:hover:bg-[#151D19] transition-all border border-transparent hover:border-[#B39452]/40"
          >
            <div className="flex items-start gap-3">
              <span className="text-xs font-bold font-mono text-[#B39452] pt-1 select-none">
                v.{currentScripture.verseStart}
              </span>
              <p className="font-scripture text-xl sm:text-2xl lg:text-3xl text-[#202421] dark:text-[#F3F0E8] leading-relaxed tracking-normal font-normal">
                {currentScripture.text}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-end">
              <span className="text-xs text-[#B39452] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-medium">
                Tap verse to explore connections, save, or take notes →
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Verse Action Sheet / Exploration Modal Banner */}
      {activeVerseSheet && (
        <div
          id="verse-action-sheet"
          className="bg-[#263A32] text-[#F8F6F0] rounded-2xl p-5 sm:p-6 shadow-md border border-[#B39452]/40 animate-in slide-in-from-bottom-2 duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B39452]" />
              <h4 className="font-semibold text-sm text-[#E8DDC8]">
                Verse Study Actions • {activeVerseSheet.reference}
              </h4>
            </div>
            <button
              onClick={() => setActiveVerseSheet(null)}
              className="text-xs text-[#CAD3CC] hover:text-white"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={handleSaveVerse}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-colors"
            >
              {savedSuccess ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Bookmark className="w-4 h-4 text-[#B39452]" />
              )}
              <span>{savedSuccess ? 'Saved!' : 'Save Verse'}</span>
            </button>

            <button
              onClick={() => {
                onOpenNoteModal(undefined, activeVerseSheet);
                setActiveVerseSheet(null);
              }}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-4 h-4 text-[#B39452]" />
              <span>Add Reflection</span>
            </button>

            <button
              onClick={() => {
                onOpenKnowledgeGraph();
                setActiveVerseSheet(null);
              }}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-colors"
            >
              <Network className="w-4 h-4 text-[#B39452]" />
              <span>Connection Graph</span>
            </button>

            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(`"${activeVerseSheet.text}" — ${activeVerseSheet.reference}`);
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 2000);
                }
              }}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4 text-[#B39452]" />
              <span>Copy Verse</span>
            </button>
          </div>
        </div>
      )}

      {/* Connected HALAKHA Discoveries */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-scripture text-2xl font-semibold text-[#202421] dark:text-[#F3F0E8] flex items-center gap-2">
            <span>Related HALAKHA Insights</span>
            <span className="text-xs font-sans font-medium px-2 py-0.5 rounded-full bg-[#B39452]/20 text-[#B39452]">
              {relatedIdeas.length} available
            </span>
          </h3>
          <span className="text-xs text-[#69716B] dark:text-[#AEB6AF]">
            Connecting passage to biblical theology
          </span>
        </div>

        {relatedIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedIdeas.map((idea) => (
              <div
                key={idea.id}
                onClick={() => onOpenIdeaCard(idea)}
                className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl p-4.5 hover:border-[#B39452] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#B39452] mb-1 block">
                    {idea.category}
                  </span>
                  <h4 className="font-scripture text-xl font-semibold text-[#202421] dark:text-[#F3F0E8] group-hover:text-[#B39452] transition-colors leading-snug mb-1.5">
                    {idea.title}
                  </h4>
                  <p className="text-xs text-[#69716B] dark:text-[#CAD3CC] line-clamp-2 leading-relaxed">
                    {idea.summary}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#E8DDC8]/60 dark:border-[#2E3B33] flex items-center justify-between text-xs text-[#263A32] dark:text-[#E8DDC8] font-semibold">
                  <span>Explore full discovery</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl">
            <p className="text-xs text-[#69716B] dark:text-[#AEB6AF]">
              No direct idea cards linked to this passage yet. Use Admin CMS to attach new discoveries.
            </p>
          </div>
        )}
      </section>

      {/* Scripture & Translation Note */}
      <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#151D19] border border-[#E8DDC8]/60 dark:border-[#2E3B33] flex items-start gap-3 text-xs text-[#69716B] dark:text-[#AEB6AF]">
        <Info className="w-4 h-4 text-[#B39452] shrink-0 mt-0.5" />
        <p>
          HALAKHA preserves the Jewish names and context (Tanakh, Yeshua, Adonai, Torah) while utilizing recognized public and licensed translations (such as TLV, ESV, and Messianic readings) to uphold both literary reverence and scholarly precision.
        </p>
      </div>
    </div>
  );
};
