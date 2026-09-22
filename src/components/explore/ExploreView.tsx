import React, { useState } from 'react';
import {
  Compass,
  Search,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Network,
  X,
} from 'lucide-react';
import { Topic, Idea, Scripture, StudyPath } from '../../types';
import { StorageService } from '../../lib/storage';

interface ExploreViewProps {
  topics: Topic[];
  ideas: Idea[];
  scriptures: Scripture[];
  studyPaths: StudyPath[];
  initialTopicSlug?: string;
  onOpenIdeaCard: (idea: Idea) => void;
  onOpenScripture: (scripture: Scripture) => void;
  onOpenStudyPath: (pathId: string) => void;
  onOpenKnowledgeGraph: (nodeId?: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  topics,
  ideas,
  scriptures,
  studyPaths,
  initialTopicSlug,
  onOpenIdeaCard,
  onOpenScripture,
  onOpenStudyPath,
  onOpenKnowledgeGraph,
}) => {
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string | null>(
    initialTopicSlug || null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = searchQuery.trim()
    ? StorageService.searchAll(searchQuery)
    : null;

  const activeTopic = topics.find((t) => t.slug === selectedTopicSlug);

  // Filter content for the active topic
  const topicIdeas = activeTopic
    ? ideas.filter(
        (i) =>
          i.topicSlugs.includes(activeTopic.slug) ||
          i.category.toLowerCase() === activeTopic.name.toLowerCase()
      )
    : [];

  const topicScriptures = activeTopic
    ? scriptures.filter((s) => {
        // Find if any idea in this topic references this scripture
        const scriptureIdsInTopic = new Set(topicIdeas.flatMap((i) => i.scriptureIds));
        return scriptureIdsInTopic.has(s.id);
      })
    : [];

  const topicStudyPaths = activeTopic
    ? studyPaths.filter(
        (sp) =>
          sp.title.toLowerCase().includes(activeTopic.slug) ||
          sp.description.toLowerCase().includes(activeTopic.name.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Search Header */}
      <section className="space-y-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#B39452] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            Scripture & Theological Discovery
          </span>
          <h1 className="font-scripture text-3xl sm:text-4xl font-semibold text-[#202421] dark:text-[#F3F0E8] mt-1">
            Explore Topics
          </h1>
          <p className="text-xs sm:text-sm text-[#69716B] dark:text-[#AEB6AF] mt-0.5">
            Browse through central themes of the Tanakh and New Testament through a Jewish lens.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#69716B] dark:text-[#AEB6AF] absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            id="explore-search-input"
            type="text"
            placeholder="Search concepts, scriptures, prophets, Hebrew terms (e.g. Passover, Isaiah 53, Hesed)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-[#202421] dark:text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#B39452] shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-[#69716B] hover:text-[#202421] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* If Search Query is Active: Show Instant Search Results */}
      {searchResults ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8DDC8] dark:border-[#2E3B33] pb-2">
            <h3 className="font-semibold text-sm text-[#202421] dark:text-[#F3F0E8]">
              Search Results for "{searchQuery}"
            </h3>
            <span className="text-xs text-[#69716B] dark:text-[#AEB6AF]">
              {searchResults.ideas.length +
                searchResults.scriptures.length +
                searchResults.topics.length +
                searchResults.studyPaths.length}{' '}
              results
            </span>
          </div>

          {/* Ideas Results */}
          {searchResults.ideas.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B39452] block">
                Discoveries ({searchResults.ideas.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {searchResults.ideas.map((idea: Idea) => (
                  <div
                    key={idea.id}
                    onClick={() => onOpenIdeaCard(idea)}
                    className="p-4 bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl hover:border-[#B39452] cursor-pointer transition-all"
                  >
                    <span className="text-[10px] font-bold text-[#B39452] uppercase block mb-1">
                      {idea.category}
                    </span>
                    <h4 className="font-scripture text-lg font-bold text-[#202421] dark:text-[#F3F0E8]">
                      {idea.title}
                    </h4>
                    <p className="text-xs text-[#69716B] dark:text-[#CAD3CC] line-clamp-2 mt-1">
                      {idea.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scripture Results */}
          {searchResults.scriptures.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B39452] block">
                Scripture Passages ({searchResults.scriptures.length})
              </span>
              <div className="space-y-2">
                {searchResults.scriptures.map((sc: Scripture) => (
                  <div
                    key={sc.id}
                    onClick={() => onOpenScripture(sc)}
                    className="p-3.5 bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl hover:border-[#B39452] cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-xs text-[#263A32] dark:text-[#E8DDC8]">
                        {sc.reference}
                      </span>
                      <p className="font-scripture text-sm italic text-[#69716B] dark:text-[#CAD3CC] line-clamp-1 mt-0.5">
                        "{sc.text}"
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#B39452] shrink-0 ml-3" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty search */}
          {searchResults.ideas.length === 0 &&
            searchResults.scriptures.length === 0 &&
            searchResults.topics.length === 0 &&
            searchResults.studyPaths.length === 0 && (
              <div className="p-10 text-center bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl">
                <p className="text-sm text-[#69716B] dark:text-[#AEB6AF]">
                  No matching discoveries found. Try searching for "Passover", "Messiah", "Isaiah", or "Covenant".
                </p>
              </div>
            )}
        </section>
      ) : activeTopic ? (
        /* Active Topic Deep Dive View */
        <section className="space-y-6">
          <button
            onClick={() => setSelectedTopicSlug(null)}
            className="text-xs font-semibold text-[#B39452] hover:underline flex items-center gap-1"
          >
            ← Back to all 10 topics
          </button>

          {/* Active Topic Banner */}
          <div className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#B39452]">
                    Biblical Category
                  </span>
                  {activeTopic.hebrewName && (
                    <span className="font-scripture text-xl text-[#263A32] dark:text-[#E8DDC8] font-bold">
                      {activeTopic.hebrewName}
                    </span>
                  )}
                </div>
                <h2 className="font-scripture text-3xl sm:text-4xl font-bold text-[#202421] dark:text-[#F3F0E8]">
                  {activeTopic.name}
                </h2>
                {activeTopic.hebrewMeaning && (
                  <p className="text-xs font-medium text-[#B39452] mt-0.5">
                    Hebrew Insight: {activeTopic.hebrewMeaning}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-[#69716B] dark:text-[#AEB6AF] mt-2 max-w-xl leading-relaxed">
                  {activeTopic.description}
                </p>
              </div>

              <button
                onClick={() => onOpenKnowledgeGraph()}
                className="px-4 py-2.5 rounded-xl bg-[#263A32] hover:bg-[#1F2F29] text-[#F8F6F0] text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-xs"
              >
                <Network className="w-4 h-4 text-[#B39452]" />
                <span>View in Knowledge Graph</span>
              </button>
            </div>
          </div>

          {/* Topic Discoveries */}
          <div className="space-y-3">
            <h3 className="font-scripture text-2xl font-bold text-[#202421] dark:text-[#F3F0E8] flex items-center justify-between">
              <span>Discoveries ({topicIdeas.length})</span>
            </h3>

            {topicIdeas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topicIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    onClick={() => onOpenIdeaCard(idea)}
                    className="p-5 bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl hover:border-[#B39452] cursor-pointer transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#B39452] block mb-1">
                        {idea.category}
                      </span>
                      <h4 className="font-scripture text-xl font-bold text-[#202421] dark:text-[#F3F0E8] group-hover:text-[#B39452] transition-colors leading-snug mb-1.5">
                        {idea.title}
                      </h4>
                      <p className="text-xs text-[#69716B] dark:text-[#CAD3CC] line-clamp-3 leading-relaxed">
                        {idea.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E8DDC8]/60 dark:border-[#2E3B33] flex items-center justify-between text-xs text-[#263A32] dark:text-[#E8DDC8] font-semibold">
                      <span>Explore Idea</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#B39452] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl">
                <p className="text-xs text-[#69716B] dark:text-[#AEB6AF]">
                  No published discoveries under this topic yet. More are currently in the editorial pipeline.
                </p>
              </div>
            )}
          </div>
        </section>
      ) : (
        /* Default Topic Grid (10 Core Categories) */
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-scripture text-2xl font-bold text-[#202421] dark:text-[#F3F0E8]">
              The 10 Core Pillars
            </h3>
            <span className="text-xs text-[#69716B] dark:text-[#AEB6AF]">
              Structured Messianic Knowledge
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => {
              const count = ideas.filter(
                (i) =>
                  i.topicSlugs.includes(topic.slug) ||
                  i.category.toLowerCase() === topic.name.toLowerCase()
              ).length;

              return (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopicSlug(topic.slug)}
                  className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-5 hover:border-[#B39452] transition-all cursor-pointer group flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#B39452]/10 text-[#B39452]">
                        {count} {count === 1 ? 'Idea' : 'Ideas'}
                      </span>
                      {topic.hebrewName && (
                        <span className="font-scripture text-xl text-[#263A32] dark:text-[#E8DDC8] font-bold">
                          {topic.hebrewName}
                        </span>
                      )}
                    </div>
                    <h3 className="font-scripture text-2xl font-bold text-[#202421] dark:text-[#F3F0E8] group-hover:text-[#B39452] transition-colors leading-tight mb-1">
                      {topic.name}
                    </h3>
                    <p className="text-xs text-[#69716B] dark:text-[#CAD3CC] leading-relaxed line-clamp-3">
                      {topic.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E8DDC8]/60 dark:border-[#2E3B33] flex items-center justify-between text-xs text-[#263A32] dark:text-[#E8DDC8] font-semibold">
                    <span>Explore Pillar</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B39452] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
