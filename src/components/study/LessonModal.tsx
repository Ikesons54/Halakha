import React, { useState } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Network,
} from 'lucide-react';
import { StudyLesson, StudyPath } from '../../types';
import { StorageService } from '../../lib/storage';

interface LessonModalProps {
  lesson: StudyLesson | null;
  path: StudyPath | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteLesson: (lessonId: string) => void;
  onOpenKnowledgeGraph: (nodeId?: string) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  path,
  isOpen,
  onClose,
  onCompleteLesson,
  onOpenKnowledgeGraph,
}) => {
  const [reflectionText, setReflectionText] = useState('');
  const [savedReflection, setSavedReflection] = useState(false);

  if (!isOpen || !lesson || !path) return null;

  const handleComplete = () => {
    if (reflectionText.trim()) {
      StorageService.saveNote({
        referenceTitle: `Lesson Note: ${lesson.title}`,
        content: reflectionText.trim(),
      });
      setSavedReflection(true);
    }
    onCompleteLesson(lesson.id);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div
      id="lesson-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="lesson-modal"
        className="w-full max-w-3xl max-h-[92vh] bg-[#F8F6F0] dark:bg-[#19211D] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8DDC8] dark:border-[#2E3B33] bg-white dark:bg-[#1C2420] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B39452] bg-[#B39452]/10 px-2 py-0.5 rounded">
                Lesson {lesson.lessonOrder} of {path.lessons.length}
              </span>
              <span className="text-xs text-[#69716B] dark:text-[#AEB6AF] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {lesson.estimatedMinutes} min
              </span>
            </div>
            <h3 className="font-scripture text-2xl font-bold text-[#202421] dark:text-[#F3F0E8] mt-1">
              {lesson.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Close lesson"
            className="p-1.5 rounded-lg text-[#69716B] dark:text-[#AEB6AF] hover:text-[#202421] dark:hover:text-[#F3F0E8] hover:bg-[#E8DDC8]/50 dark:hover:bg-[#222C27] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 01: The Core Idea */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#263A32] text-[#E8DDC8] text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#263A32] dark:text-[#E8DDC8]">
                The Core Insight
              </h4>
            </div>
            <div className="bg-white dark:bg-[#1C2420] p-4.5 rounded-xl border border-[#E8DDC8] dark:border-[#2E3B33] shadow-xs">
              <p className="text-sm sm:text-base text-[#202421] dark:text-[#F3F0E8] leading-relaxed font-medium">
                {lesson.coreIdea}
              </p>
            </div>
          </section>

          {/* Step 02: Scripture Anchor */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#263A32] text-[#E8DDC8] text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#263A32] dark:text-[#E8DDC8]">
                Scripture Passage • {lesson.scriptureReference}
              </h4>
            </div>
            <div className="bg-[#FAF8F5] dark:bg-[#151D19] p-5 rounded-xl border-l-3 border-[#B39452] border-y border-r border-[#E8DDC8] dark:border-[#2E3B33]">
              <p className="font-scripture text-lg sm:text-xl text-[#202421] dark:text-[#F3F0E8] italic leading-relaxed">
                "{lesson.scriptureText}"
              </p>
            </div>
          </section>

          {/* Step 03: Context & Messianic Connection */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#263A32] text-[#E8DDC8] text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#263A32] dark:text-[#E8DDC8]">
                Context & Messianic Lens
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#1C2420] p-4 rounded-xl border border-[#E8DDC8] dark:border-[#2E3B33] space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#69716B] dark:text-[#AEB6AF] block">
                  Historical Background
                </span>
                <p className="text-xs sm:text-sm text-[#333C37] dark:text-[#CAD3CC] leading-relaxed">
                  {lesson.contextNote}
                </p>
              </div>
              <div className="bg-white dark:bg-[#1C2420] p-4 rounded-xl border border-[#E8DDC8] dark:border-[#2E3B33] space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B39452] block">
                  Messianic Fulfillment
                </span>
                <p className="text-xs sm:text-sm text-[#333C37] dark:text-[#CAD3CC] leading-relaxed">
                  {lesson.messianicConnection}
                </p>
              </div>
            </div>
          </section>

          {/* Step 04: Visual Connection Trigger */}
          <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#222C27] rounded-xl border border-[#E8DDC8] dark:border-[#2E3B33] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#263A32] dark:text-[#E8DDC8] font-medium">
              <Network className="w-4 h-4 text-[#B39452]" />
              <span>Explore connected themes in the Knowledge Graph</span>
            </div>
            <button
              onClick={() => onOpenKnowledgeGraph()}
              className="text-xs font-semibold text-[#B39452] hover:text-[#8D7135] underline"
            >
              Open Graph →
            </button>
          </div>

          {/* Step 05: Personal Reflection Box */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#B39452] text-[#263A32] text-xs font-bold flex items-center justify-center">
                  5
                </span>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#263A32] dark:text-[#E8DDC8]">
                  Personal Reflection
                </h4>
              </div>
              <span className="text-xs text-[#69716B] dark:text-[#AEB6AF]">
                Saves to your private Stash
              </span>
            </div>

            <div className="bg-white dark:bg-[#1C2420] p-4 rounded-xl border border-[#E8DDC8] dark:border-[#2E3B33] space-y-2.5">
              <p className="text-xs font-semibold text-[#263A32] dark:text-[#E8DDC8] italic">
                "{lesson.reflectionPrompt}"
              </p>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Write what stood out to you in this passage..."
                rows={3}
                className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-lg p-3 text-xs sm:text-sm text-[#202421] dark:text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#B39452] resize-none"
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8DDC8] dark:border-[#2E3B33] bg-white dark:bg-[#1C2420] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#69716B] dark:text-[#AEB6AF] hover:bg-[#E8DDC8]/40 transition-colors"
          >
            Review Later
          </button>

          <button
            onClick={handleComplete}
            className="px-5 py-2.5 rounded-xl bg-[#263A32] hover:bg-[#1F2F29] text-[#F8F6F0] text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-[#B39452]" />
            <span>Complete & Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
