import React, { useState, useEffect, useCallback } from 'react';
import {
  Navigation,
} from './components/Navigation';
import { DailyDiscoveryFeed } from './components/discovery/DailyDiscoveryFeed';
import { ExploreView } from './components/explore/ExploreView';
import { BibleReader } from './components/bible/BibleReader';
import { StudyPathsView } from './components/study/StudyPathsView';
import { StashView } from './components/stash/StashView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { KnowledgeGraphModal } from './components/connections/KnowledgeGraphModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { NoteModal } from './components/stash/NoteModal';
import { IdeaCard } from './components/discovery/IdeaCard';
import { AboutHalakhaModal } from './components/about/AboutHalakhaModal';
import { StorageService } from './lib/storage';
import { Idea, Scripture, Topic, StudyPath, Profile, KnowledgeGraphData } from './types';
import { X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'explore' | 'bible' | 'study' | 'stash' | 'admin'>('home');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('halakha_theme') === 'dark' ||
        localStorage.getItem('rooted_theme') === 'dark' ||
        (!('halakha_theme' in localStorage) && !('rooted_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // App data state synced with StorageService
  const [profile, setProfile] = useState<Profile>(() => StorageService.getProfile());
  const [ideas, setIdeas] = useState<Idea[]>(() => StorageService.getIdeas());
  const [topics, setTopics] = useState<Topic[]>(() => StorageService.getTopics());
  const [scriptures, setScriptures] = useState<Scripture[]>(() => StorageService.getScriptures());
  const [studyPaths, setStudyPaths] = useState<StudyPath[]>(() => StorageService.getStudyPaths());
  const [graphData, setGraphData] = useState<KnowledgeGraphData>(() => StorageService.getKnowledgeGraph());

  // Navigation target deep-links
  const [selectedStudyPathId, setSelectedStudyPathId] = useState<string | undefined>();
  const [selectedScriptureId, setSelectedScriptureId] = useState<string | undefined>();
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string | undefined>();

  // Modals
  const [isKnowledgeGraphOpen, setIsKnowledgeGraphOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [graphFocalNode, setGraphFocalNode] = useState<string | undefined>();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [noteModalTarget, setNoteModalTarget] = useState<{ idea?: Idea; scripture?: Scripture } | null>(null);
  const [previewIdea, setPreviewIdea] = useState<Idea | null>(null);

  // Sync theme with DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('halakha_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('halakha_theme', 'light');
    }
  }, [darkMode]);

  // Check onboarding on first load
  useEffect(() => {
    if (!profile.onboardingCompleted) {
      setIsOnboardingOpen(true);
    }
  }, [profile.onboardingCompleted]);

  // Refresh all state from StorageService
  const refreshData = useCallback(() => {
    setProfile(StorageService.getProfile());
    setIdeas(StorageService.getIdeas());
    setTopics(StorageService.getTopics());
    setScriptures(StorageService.getScriptures());
    setStudyPaths(StorageService.getStudyPaths());
    setGraphData(StorageService.getKnowledgeGraph());
  }, []);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleOpenKnowledgeGraph = (nodeId?: string) => {
    setGraphFocalNode(nodeId);
    setIsKnowledgeGraphOpen(true);
  };

  const handleOpenScripture = (scripture: Scripture) => {
    setSelectedScriptureId(scripture.id);
    setCurrentTab('bible');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenScriptureByRef = (ref: string) => {
    const sc = scriptures.find((s) => s.reference.toLowerCase().includes(ref.toLowerCase()));
    if (sc) {
      setSelectedScriptureId(sc.id);
    }
    setCurrentTab('bible');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToStudy = (pathId?: string) => {
    if (pathId) setSelectedStudyPathId(pathId);
    setCurrentTab('study');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToExplore = (topicSlug?: string) => {
    if (topicSlug) setSelectedTopicSlug(topicSlug);
    setCurrentTab('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Only published ideas should show in regular user feed
  const publishedIdeas = ideas.filter((i) => i.status === 'PUBLISHED');

  return (
    <div
      id="halakha-root-app"
      className="min-h-screen bg-[#F8F6F0] dark:bg-[#141A17] text-[#202421] dark:text-[#F3F0E8] font-ui transition-colors duration-200 flex flex-col"
    >
      {/* Universal Header & Desktop / Mobile Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        profile={profile}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenSearch={() => handleNavigateToExplore()}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'home' && (
          <DailyDiscoveryFeed
            ideas={publishedIdeas}
            scriptures={scriptures}
            studyPaths={studyPaths}
            profile={profile}
            onOpenScripture={handleOpenScripture}
            onOpenKnowledgeGraph={handleOpenKnowledgeGraph}
            onOpenNoteModal={(idea) => setNoteModalTarget({ idea })}
            onNavigateToStudy={handleNavigateToStudy}
            onNavigateToBible={() => {
              setCurrentTab('bible');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToExplore={handleNavigateToExplore}
            onDataChanged={refreshData}
          />
        )}

        {currentTab === 'explore' && (
          <ExploreView
            topics={topics}
            ideas={publishedIdeas}
            scriptures={scriptures}
            studyPaths={studyPaths}
            initialTopicSlug={selectedTopicSlug}
            onOpenIdeaCard={(idea) => setPreviewIdea(idea)}
            onOpenScripture={handleOpenScripture}
            onOpenStudyPath={handleNavigateToStudy}
            onOpenKnowledgeGraph={handleOpenKnowledgeGraph}
          />
        )}

        {currentTab === 'bible' && (
          <BibleReader
            scriptures={scriptures}
            ideas={publishedIdeas}
            initialScriptureId={selectedScriptureId}
            onOpenKnowledgeGraph={handleOpenKnowledgeGraph}
            onOpenNoteModal={(idea, scripture) => setNoteModalTarget({ idea, scripture })}
            onOpenIdeaCard={(idea) => setPreviewIdea(idea)}
          />
        )}

        {currentTab === 'study' && (
          <StudyPathsView
            studyPaths={studyPaths}
            selectedPathId={selectedStudyPathId}
            onOpenKnowledgeGraph={handleOpenKnowledgeGraph}
            onProgressUpdated={refreshData}
          />
        )}

        {currentTab === 'stash' && (
          <StashView
            ideas={ideas}
            scriptures={scriptures}
            profile={profile}
            onOpenIdeaCard={(idea) => setPreviewIdea(idea)}
            onOpenScripture={handleOpenScripture}
            onExploreDiscoveries={() => setCurrentTab('home')}
            onDataChanged={refreshData}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            ideas={ideas}
            topics={topics}
            scriptures={scriptures}
            onDataChanged={refreshData}
            onPreviewIdea={(idea) => setPreviewIdea(idea)}
          />
        )}
      </main>

      {/* Universal Footer */}
      <footer className="border-t border-[#E8DDC8] dark:border-[#2E3B33] bg-[#FAF8F5]/80 dark:bg-[#19211D]/80 py-6 text-xs text-[#69716B] dark:text-[#AEB6AF] mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="font-scripture text-base font-bold text-[#263A32] dark:text-[#E8DDC8]">
                הֲלָכָה • HALAKHA V1
              </span>
              <span>•</span>
              <span className="font-medium text-[#202421] dark:text-[#F3F0E8]">
                Discover Scripture • See the Connections • Go Deeper
              </span>
            </div>
            <span className="text-[11px] text-[#69716B] dark:text-[#AEB6AF]">
              Exploring the biblical world through a Messianic Jewish lens
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-[#B39452] transition-colors font-semibold"
            >
              About HALAKHA
            </button>
            <button
              onClick={() => setIsKnowledgeGraphOpen(true)}
              className="hover:text-[#B39452] transition-colors"
            >
              Knowledge Graph
            </button>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="hover:text-[#B39452] transition-colors"
            >
              Preferences
            </button>
            <button
              onClick={() => setCurrentTab('admin')}
              className="hover:text-[#B39452] transition-colors font-semibold"
            >
              CMS Admin
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}

      {/* 0. About HALAKHA Modal */}
      <AboutHalakhaModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* 1. Scripture Knowledge Graph Modal */}
      <KnowledgeGraphModal
        isOpen={isKnowledgeGraphOpen}
        onClose={() => setIsKnowledgeGraphOpen(false)}
        graphData={{
          ...graphData,
          centralNode: graphFocalNode || graphData.centralNode,
        }}
        onOpenScriptureByRef={handleOpenScriptureByRef}
      />

      {/* 2. Onboarding / Preferences Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentProfile={profile}
        onProfileUpdated={refreshData}
      />

      {/* 3. Scripture / Idea Reflection Note Modal */}
      <NoteModal
        isOpen={Boolean(noteModalTarget)}
        onClose={() => setNoteModalTarget(null)}
        idea={noteModalTarget?.idea}
        scripture={noteModalTarget?.scripture}
        onNoteSaved={refreshData}
      />

      {/* 4. Idea Preview Modal */}
      {previewIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-transparent relative">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setPreviewIdea(null)}
                className="p-2 rounded-full bg-white dark:bg-[#1C2420] text-[#202421] dark:text-[#F3F0E8] shadow-md hover:bg-[#E8DDC8] transition-colors"
                aria-label="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <IdeaCard
              idea={previewIdea}
              scriptures={scriptures.filter((s) => previewIdea.scriptureIds?.includes(s.id))}
              onOpenScripture={handleOpenScripture}
              onOpenKnowledgeGraph={handleOpenKnowledgeGraph}
              onOpenNoteModal={(idea) => setNoteModalTarget({ idea })}
              onIdeaUpdated={refreshData}
              defaultExpanded={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
