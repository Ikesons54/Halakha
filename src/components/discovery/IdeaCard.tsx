import React, { useState } from 'react';
import {
  Bookmark,
  Share2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Network,
  Edit3,
  Clock,
  Sparkles,
  Check,
  Tag,
} from 'lucide-react';
import { Idea, Scripture } from '../../types';
import { StorageService } from '../../lib/storage';

interface IdeaCardProps {
  idea: Idea;
  scriptures: Scripture[];
  onOpenScripture: (scripture: Scripture) => void;
  onOpenKnowledgeGraph: (nodeId?: string) => void;
  onOpenNoteModal: (idea: Idea) => void;
  onIdeaUpdated?: () => void;
  defaultExpanded?: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  scriptures,
  onOpenScripture,
  onOpenKnowledgeGraph,
  onOpenNoteModal,
  onIdeaUpdated,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isSaved, setIsSaved] = useState(() => StorageService.isIdeaSaved(idea.id));
  const [copiedToast, setCopiedToast] = useState(false);

  const handleToggleSave = () => {
    const newState = StorageService.toggleSaveIdea(idea.id);
    setIsSaved(newState);
    if (onIdeaUpdated) onIdeaUpdated();
  };

  const handleShare = () => {
    const shareText = `"${idea.title}" — ${idea.hook}\n\nRead more on HALAKHA: Scripture Discovery & Study`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  return (
    <article
      id={`idea-card-${idea.id}`}
      className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden"
    >
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#263A32] via-[#B39452] to-[#263A32] opacity-80" />

      {/* Header: Category, Read time & Save button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#B39452] bg-[#B39452]/10 dark:bg-[#B39452]/20 px-2.5 py-1 rounded-md">
            {idea.category}
          </span>
          <span className="text-[12px] text-[#69716B] dark:text-[#AEB6AF] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {idea.readTimeMinutes} min discovery
          </span>
          {idea.featured && (
            <span className="text-[11px] font-medium text-[#263A32] dark:text-[#E8DDC8] bg-[#E8DDC8]/60 dark:bg-[#222C27] px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#B39452]" /> Featured
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            id={`btn-share-${idea.id}`}
            onClick={handleShare}
            aria-label="Share this idea"
            className="p-2 rounded-lg text-[#69716B] dark:text-[#AEB6AF] hover:text-[#202421] dark:hover:text-[#F3F0E8] hover:bg-[#F8F6F0] dark:hover:bg-[#222C27] transition-colors relative"
            title="Share Idea"
          >
            {copiedToast ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            id={`btn-save-${idea.id}`}
            onClick={handleToggleSave}
            aria-label={isSaved ? 'Remove from Stash' : 'Save to Stash'}
            className={`p-2 rounded-lg transition-colors ${
              isSaved
                ? 'text-[#B39452] bg-[#B39452]/10 dark:bg-[#B39452]/20'
                : 'text-[#69716B] dark:text-[#AEB6AF] hover:text-[#202421] dark:hover:text-[#F3F0E8] hover:bg-[#F8F6F0] dark:hover:bg-[#222C27]'
            }`}
            title={isSaved ? 'Saved in Stash' : 'Save to Stash'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Layer 1: Title & Hook */}
      <h3 className="font-scripture text-2xl sm:text-3xl font-semibold text-[#202421] dark:text-[#F3F0E8] leading-tight mb-2 tracking-normal">
        {idea.title}
      </h3>

      <div className="bg-[#F8F6F0] dark:bg-[#151D19] border-l-3 border-[#B39452] p-3.5 rounded-r-xl my-3.5">
        <p className="text-sm sm:text-base italic text-[#263A32] dark:text-[#E8DDC8] font-medium leading-relaxed">
          "{idea.hook}"
        </p>
      </div>

      {/* Layer 2: Core Idea Summary */}
      <p className="text-sm sm:text-[15px] text-[#333C37] dark:text-[#CAD3CC] leading-relaxed mb-4">
        {idea.summary}
      </p>

      {/* Layer 3: Connected Scripture Quotation Card */}
      {scriptures.length > 0 && (
        <div className="space-y-2.5 my-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#69716B] dark:text-[#AEB6AF] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#B39452]" />
              Scripture Foundation
            </span>
          </div>

          {scriptures.map((sc) => (
            <div
              key={sc.id}
              className="group bg-[#FAF8F5] dark:bg-[#222C27] border border-[#E8DDC8]/80 dark:border-[#2E3B33] rounded-xl p-3.5 hover:border-[#B39452]/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <span className="font-semibold text-sm text-[#263A32] dark:text-[#E8DDC8] tracking-tight">
                  {sc.reference}
                </span>
                <span className="text-[10px] text-[#69716B] dark:text-[#AEB6AF] uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5">
                  {sc.translation}
                </span>
              </div>
              <p className="font-scripture text-base sm:text-lg text-[#202421] dark:text-[#F3F0E8] leading-relaxed italic">
                "{sc.text}"
              </p>
              <div className="mt-2.5 flex items-center justify-end">
                <button
                  onClick={() => onOpenScripture(sc)}
                  className="text-xs font-semibold text-[#B39452] hover:text-[#8D7135] flex items-center gap-1 transition-colors"
                >
                  <span>Read chapter in Bible</span>
                  <span className="text-xs">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expanded Deeper Layers: Context, Messianic Interpretation, Application */}
      {isExpanded && (
        <div className="pt-4 mt-4 border-t border-[#E8DDC8]/70 dark:border-[#2E3B33] space-y-4 animate-in fade-in duration-300">
          {/* Layer 4: Context (Historical, Linguistic, 2nd Temple) */}
          <div className="bg-[#F8F6F0] dark:bg-[#151D19] p-4 rounded-xl border border-[#E8DDC8]/60 dark:border-[#2E3B33]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#263A32] dark:text-[#E8DDC8] px-2 py-0.5 rounded bg-[#E8DDC8] dark:bg-[#222C27]">
                Context
              </span>
              <span className="text-xs text-[#69716B] dark:text-[#AEB6AF]">
                Historical & Linguistic Background
              </span>
            </div>
            <p className="text-sm text-[#333C37] dark:text-[#CAD3CC] leading-relaxed">
              {idea.context}
            </p>
          </div>

          {/* Layer 5: Messianic Interpretation */}
          <div className="bg-[#F8F6F0] dark:bg-[#151D19] p-4 rounded-xl border border-[#E8DDC8]/60 dark:border-[#2E3B33]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#B39452] px-2 py-0.5 rounded bg-[#B39452]/10 dark:bg-[#B39452]/20">
                Interpretation
              </span>
              <span className="text-xs text-[#69716B] dark:text-[#AEB6AF]">
                Messianic Jewish Lens
              </span>
            </div>
            <p className="text-sm text-[#333C37] dark:text-[#CAD3CC] leading-relaxed">
              {idea.interpretation}
            </p>
          </div>

          {/* Practical Application */}
          <div className="bg-[#FAF8F5] dark:bg-[#222C27] p-4 rounded-xl border-l-3 border-[#263A32] dark:border-[#B39452]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#263A32] dark:text-[#E8DDC8]">
                Application
              </span>
            </div>
            <p className="text-sm text-[#333C37] dark:text-[#CAD3CC] leading-relaxed">
              {idea.application}
            </p>
          </div>

          {/* Topic Tags */}
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <span className="text-xs text-[#69716B] dark:text-[#AEB6AF] flex items-center gap-1 font-medium">
              <Tag className="w-3.5 h-3.5" /> Topics:
            </span>
            {idea.topicSlugs.map((t) => (
              <span
                key={t}
                className="text-xs px-2.5 py-1 rounded-md bg-[#E8DDC8]/50 dark:bg-[#222C27] text-[#263A32] dark:text-[#E8DDC8] font-medium"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Card Footer Action Bar */}
      <div className="mt-5 pt-3.5 border-t border-[#E8DDC8]/60 dark:border-[#2E3B33] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {/* Expand / Collapse Deeper Study */}
          <button
            id={`btn-expand-${idea.id}`}
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#263A32] dark:text-[#E8DDC8] hover:bg-[#E8DDC8]/50 dark:hover:bg-[#222C27] transition-colors"
          >
            <span>{isExpanded ? 'Less' : 'Go Deeper'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Add / View Note Reflection */}
          <button
            id={`btn-note-${idea.id}`}
            onClick={() => onOpenNoteModal(idea)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#69716B] dark:text-[#AEB6AF] hover:text-[#202421] dark:hover:text-[#F3F0E8] hover:bg-[#E8DDC8]/40 dark:hover:bg-[#222C27] transition-colors"
            title="Attach a personal reflection note"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#B39452]" />
            <span>Reflect</span>
          </button>
        </div>

        {/* Explore Connections Knowledge Graph Button */}
        <button
          id={`btn-connections-${idea.id}`}
          onClick={() => onOpenKnowledgeGraph()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#B39452] bg-[#B39452]/10 dark:bg-[#B39452]/20 hover:bg-[#B39452]/20 transition-all border border-[#B39452]/30"
          title="See connections in Knowledge Graph"
        >
          <Network className="w-3.5 h-3.5" />
          <span>See Connections</span>
        </button>
      </div>

      {copiedToast && (
        <div className="absolute bottom-3 right-4 bg-[#263A32] text-[#F8F6F0] text-xs font-medium px-3 py-1.5 rounded-md shadow-md">
          Copied idea to clipboard!
        </div>
      )}
    </article>
  );
};
