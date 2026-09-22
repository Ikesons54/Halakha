import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  ArrowRight,
  Compass,
  CheckCircle2,
  Calendar,
  Footprints,
} from 'lucide-react';
import { Idea, Scripture, StudyPath, Profile } from '../../types';
import { IdeaCard } from './IdeaCard';
import { StorageService } from '../../lib/storage';

interface DailyDiscoveryFeedProps {
  ideas: Idea[];
  scriptures: Scripture[];
  studyPaths: StudyPath[];
  profile: Profile;
  onOpenScripture: (scripture: Scripture) => void;
  onOpenKnowledgeGraph: (nodeId?: string) => void;
  onOpenNoteModal: (idea: Idea) => void;
  onNavigateToStudy: (pathId?: string) => void;
  onNavigateToBible: (book?: string, chapter?: number) => void;
  onNavigateToExplore: (topicSlug?: string) => void;
  onDataChanged: () => void;
}

export const DailyDiscoveryFeed: React.FC<DailyDiscoveryFeedProps> = ({
  ideas,
  scriptures,
  studyPaths,
  profile,
  onOpenScripture,
  onOpenKnowledgeGraph,
  onOpenNoteModal,
  onNavigateToStudy,
  onNavigateToBible,
  onNavigateToExplore,
  onDataChanged,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');

  const filteredIdeas = selectedTopicFilter === 'all'
    ? ideas
    : ideas.filter((i) => i.topicSlugs.includes(selectedTopicFilter) || i.category.toLowerCase() === selectedTopicFilter);

  const currentIdea = filteredIdeas[currentIndex] || filteredIdeas[0];

  const handleNext = () => {
    if (currentIndex < filteredIdeas.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(filteredIdeas.length - 1);
    }
  };

  // Find scriptures attached to the current idea
  const currentIdeaScriptures = currentIdea
    ? scriptures.filter((s) => currentIdea.scriptureIds.includes(s.id))
    : [];

  // Active study path progress
  const activeStudyPath = studyPaths[0];
  const progressInfo = activeStudyPath
    ? StorageService.getStudyPathProgress(activeStudyPath.id)
    : { completed: 0, total: 0, percentage: 0 };

  // Recommended ideas (excluding current idea)
  const recommended = ideas
    .filter((i) => i.id !== currentIdea?.id)
    .slice(0, 3);

  const topicFilters = [
    { slug: 'all', label: 'All Discoveries' },
    { slug: 'messiah', label: 'Messiah' },
    { slug: 'feasts', label: 'Feasts' },
    { slug: 'torah', label: 'Torah' },
    { slug: 'prophecy', label: 'Prophecy' },
    { slug: 'sabbath', label: 'Sabbath' },
    { slug: 'jewish-context', label: 'Jewish Context' },
  ];

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Welcome Banner */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B39452]">
            <Calendar className="w-3.5 h-3.5" />
            <span>Today's Biblical Walk • Day {profile.streakDays} Streak</span>
          </div>
          <h1 className="font-scripture text-3xl sm:text-4xl font-semibold text-[#202421] dark:text-[#F3F0E8] mt-1">
            Shalom, {profile.displayName || 'Seeker'}
          </h1>
          <p className="text-sm text-[#69716B] dark:text-[#AEB6AF] mt-0.5">
            Small discoveries. Deep roots. A clearer path into Scripture.
          </p>
        </div>

        {/* Learning Preference Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#E8DDC8]/60 dark:bg-[#222C27] text-[#263A32] dark:text-[#E8DDC8] px-3 py-1 rounded-full font-medium border border-[#E8DDC8] dark:border-[#2E3B33]">
            {profile.availableTime.replace('_', ' ')} study focus
          </span>
        </div>
      </section>

      {/* HALAKHA Identity & The Biblical Walk */}
      <section
        id="halakha-identity-banner"
        className="bg-gradient-to-br from-[#FAF8F5] via-white to-[#F3EFE6] dark:from-[#1A231F] dark:via-[#161D19] dark:to-[#131916] border border-[#B39452]/40 rounded-2xl p-4 sm:p-5 shadow-xs"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-scripture text-xl sm:text-2xl font-bold text-[#263A32] dark:text-[#E8DDC8]">
                הֲלָכָה • HALAKHA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#B39452]/20 text-[#B39452] flex items-center gap-1">
                <Footprints className="w-3 h-3" />
                <span>From Hebrew Root: הָלַךְ (To Walk)</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#4E5651] dark:text-[#CAD3CC] leading-relaxed max-w-2xl">
              A Scripture discovery and study platform exploring the biblical world through a Messianic Jewish lens. Walking through the living connections of Messiah, Torah, prophecy, covenant, and the feasts.
            </p>
          </div>
          <div className="text-right md:self-center shrink-0 border-t md:border-t-0 md:border-l border-[#E8DDC8] dark:border-[#2E3B33] pt-2 md:pt-0 md:pl-4">
            <span className="text-[11px] font-semibold text-[#263A32] dark:text-[#E8DDC8] block">
              Discover Scripture • See the Connections • Go Deeper
            </span>
            <span className="text-[10px] text-[#69716B] dark:text-[#AEB6AF]">
              5-Layer Content Integrity
            </span>
          </div>
        </div>
      </section>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {topicFilters.map((tab) => (
          <button
            key={tab.slug}
            onClick={() => {
              setSelectedTopicFilter(tab.slug);
              setCurrentIndex(0);
            }}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedTopicFilter === tab.slug
                ? 'bg-[#263A32] text-[#F8F6F0] shadow-xs'
                : 'bg-white dark:bg-[#222C27] text-[#69716B] dark:text-[#AEB6AF] border border-[#E8DDC8] dark:border-[#2E3B33] hover:border-[#B39452]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hero: Today's Discovery Card */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B39452] animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#263A32] dark:text-[#E8DDC8]">
              Today's Discovery ({currentIndex + 1} of {filteredIdeas.length})
            </h2>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              aria-label="Previous Discovery"
              className="p-1.5 rounded-lg border border-[#E8DDC8] dark:border-[#2E3B33] hover:bg-[#E8DDC8]/40 dark:hover:bg-[#222C27] text-[#263A32] dark:text-[#E8DDC8] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Discovery"
              className="p-1.5 rounded-lg border border-[#E8DDC8] dark:border-[#2E3B33] hover:bg-[#E8DDC8]/40 dark:hover:bg-[#222C27] text-[#263A32] dark:text-[#E8DDC8] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {currentIdea ? (
          <IdeaCard
            key={currentIdea.id}
            idea={currentIdea}
            scriptures={currentIdeaScriptures}
            onOpenScripture={onOpenScripture}
            onOpenKnowledgeGraph={onOpenKnowledgeGraph}
            onOpenNoteModal={onOpenNoteModal}
            onIdeaUpdated={onDataChanged}
            defaultExpanded={false}
          />
        ) : (
          <div className="p-8 text-center bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl">
            <p className="text-[#69716B] dark:text-[#AEB6AF] text-sm">
              No discoveries found for this topic filter.
            </p>
          </div>
        )}

        {/* Stepper Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {filteredIdeas.slice(0, 8).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Jump to discovery ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-6 bg-[#263A32] dark:bg-[#B39452]'
                  : 'w-1.5 bg-[#E8DDC8] dark:bg-[#2E3B33]'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Continue Studying Progress Card */}
      {activeStudyPath && (
        <section
          id="study-progress-card"
          className="bg-[#263A32] text-[#F8F6F0] rounded-2xl p-5 sm:p-6 shadow-sm border border-[#B39452]/30 relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-lg">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#B39452] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Continue Study Path
              </span>
              <h3 className="font-scripture text-2xl font-semibold leading-tight text-[#E8DDC8]">
                {activeStudyPath.title}
              </h3>
              <p className="text-xs text-[#CAD3CC] leading-relaxed">
                {activeStudyPath.description}
              </p>

              {/* Progress bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-[#E8DDC8] font-medium mb-1">
                  <span>Lesson {progressInfo.completed} of {progressInfo.total} Completed</span>
                  <span>{progressInfo.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/30 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#B39452] to-[#E8DDC8] rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(progressInfo.percentage, 10)}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateToStudy(activeStudyPath.id)}
              className="px-4 py-2.5 rounded-xl bg-[#B39452] hover:bg-[#8D7135] text-[#263A32] font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <span>Continue Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* Recommended For You Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-scripture text-2xl font-semibold text-[#202421] dark:text-[#F3F0E8]">
              Recommended for You
            </h3>
            <p className="text-xs text-[#69716B] dark:text-[#AEB6AF]">
              Curated based on your topics of interest and saved studies
            </p>
          </div>
          <button
            onClick={() => onNavigateToExplore()}
            className="text-xs font-semibold text-[#B39452] hover:text-[#8D7135] flex items-center gap-1"
          >
            <span>Browse all topics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommended.map((rec) => {
            const recScriptures = scriptures.filter((s) => rec.scriptureIds.includes(s.id));
            return (
              <div
                key={rec.id}
                onClick={() => {
                  const targetIdx = filteredIdeas.findIndex((i) => i.id === rec.id);
                  if (targetIdx >= 0) setCurrentIndex(targetIdx);
                }}
                className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl p-4.5 hover:border-[#B39452] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#B39452] mb-1.5 uppercase tracking-wider">
                    <span>{rec.category}</span>
                    <span className="text-[#69716B] dark:text-[#AEB6AF] lowercase">
                      {rec.readTimeMinutes}m
                    </span>
                  </div>
                  <h4 className="font-scripture text-lg font-semibold text-[#202421] dark:text-[#F3F0E8] group-hover:text-[#B39452] transition-colors leading-snug mb-1.5">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-[#69716B] dark:text-[#CAD3CC] line-clamp-2 leading-relaxed">
                    {rec.summary}
                  </p>
                </div>

                {recScriptures[0] && (
                  <div className="mt-3 pt-2.5 border-t border-[#E8DDC8]/60 dark:border-[#2E3B33] flex items-center justify-between text-[11px] text-[#263A32] dark:text-[#E8DDC8] font-medium">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-[#B39452]" />
                      {recScriptures[0].reference}
                    </span>
                    <span className="text-xs group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Intentional Scripture Reading Callout (Healthy Study Boundary) */}
      <section className="bg-[#FAF8F5] dark:bg-[#19211D] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-[#263A32]/10 dark:bg-[#B39452]/20 text-[#263A32] dark:text-[#B39452] flex items-center justify-center mx-auto">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h4 className="font-scripture text-xl font-semibold text-[#202421] dark:text-[#F3F0E8]">
            "The app doesn’t replace Bible study. It leads you into it."
          </h4>
          <p className="text-xs text-[#69716B] dark:text-[#AEB6AF] leading-relaxed">
            Take what you have discovered today and read the complete biblical passages directly in their native context.
          </p>
        </div>
        <div className="pt-1 flex items-center justify-center gap-3">
          <button
            onClick={() => onNavigateToBible()}
            className="px-4 py-2 rounded-xl bg-[#263A32] hover:bg-[#1F2F29] text-[#F8F6F0] text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Bible Reader</span>
          </button>
          <button
            onClick={() => onOpenKnowledgeGraph()}
            className="px-4 py-2 rounded-xl border border-[#B39452] text-[#B39452] hover:bg-[#B39452]/10 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Knowledge Graph</span>
          </button>
        </div>
      </section>
    </div>
  );
};
