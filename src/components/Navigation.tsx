import React from 'react';
import {
  Compass,
  BookOpen,
  Bookmark,
  Search,
  ShieldCheck,
  Moon,
  Sun,
  GraduationCap,
  RotateCcw,
  Info,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';
import { Profile } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface NavigationProps {
  currentTab: 'home' | 'explore' | 'bible' | 'study' | 'stash' | 'admin';
  onSelectTab: (tab: 'home' | 'explore' | 'bible' | 'study' | 'stash' | 'admin') => void;
  profile: Profile;
  currentUser: FirebaseUser | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSearch: () => void;
  onOpenOnboarding: () => void;
  onOpenAbout: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  profile,
  currentUser,
  darkMode,
  onToggleDarkMode,
  onOpenSearch,
  onOpenOnboarding,
  onOpenAbout,
  onOpenAuth,
  onSignOut,
}) => {
  const isAdminUser = profile.role === 'admin' || currentUser?.email === 'savedsoul898@gmail.com';

  return (
    <>
      {/* Top App Header */}
      <header
        id="app-header"
        className={`sticky top-0 z-40 w-full border-b transition-colors duration-200 ${
          darkMode ? 'bg-[#19211D]/95 border-[#2E3B33] text-[#F3F0E8]' : 'bg-[#F8F6F0]/95 border-[#E8DDC8] text-[#202421]'
        } backdrop-blur-md`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            id="brand-logo"
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#263A32] text-[#E8DDC8] flex items-center justify-center font-scripture text-2xl font-bold tracking-tight shadow-sm border border-[#B39452]/40 group-hover:border-[#B39452] transition-colors">
              ה
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-widest text-base uppercase text-[#263A32] dark:text-[#E8DDC8]">
                  HALAKHA
                </span>
                <span className="font-scripture text-xs text-[#B39452] hidden sm:inline font-semibold">
                  (הֲלָכָה)
                </span>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#B39452]/20 text-[#B39452] font-semibold">
                  V1
                </span>
              </div>
              <p className="text-[11px] text-[#69716B] dark:text-[#AEB6AF] hidden sm:block tracking-wide">
                Discover Scripture • See the Connections • Go Deeper
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav id="desktop-nav-links" className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              id="nav-feed"
              onClick={() => onSelectTab('home')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'home'
                  ? 'bg-[#263A32] text-[#F8F6F0] shadow-xs'
                  : 'text-[#69716B] dark:text-[#AEB6AF] hover:text-[#202421] dark:hover:text-[#F3F0E8] hover:bg-[#E8DDC8]/30 dark:hover:bg-[#222C27]'
              }`}
            >
              <Compass className="w-4 h-4 text-[#B39452]" />
              <span>Discoveries</span>
            </button>

            <button
              id="nav-explore"
              onClick={() => onSelectTab('explore')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'explore'
                  ? 'bg-[#263A32] text-[#F8F6F0] shadow-xs'
                  : 'text-[#69716B] dark:text-[#AEB6AF] hover:text-[#202421] dark:hover:text-[#F3F0E8] hover:bg-[#E8DDC8]/30 dark:hover:bg-[#222C27]'
              }`}
            >
              <Search className="w-4 h-4 text-[#B39452]" />
              <span>Explore</span>
            </button>

            <button
              id="nav-bible"
              onClick={() => onSelectTab('bible')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'bible'
                  ? 'bg-[#263A32] text-[#F8F6F0] shadow-xs'
                  : 'text-[#69716B] dark:text-[#AEB6AF] hover:text-[#202421] dark:hover:text-[#F3F0E8] hover:bg-[#E8DDC8]/30 dark:hover:bg-[#222C27]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#B39452]" />
              <span>Bible Reader</span>
            </button>

            <button
              id="nav-study"
              onClick={() => onSelectTab('study')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'study'
                  ? 'bg-[#263A32] text-[#F8F6F0] shadow-xs'
                  : 'text-[#69716B] dark:text-[#AEB6AF] hover:text-[#202421] dark:hover:text-[#F3F0E8] hover:bg-[#E8DDC8]/30 dark:hover:bg-[#222C27]'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-[#B39452]" />
              <span>Study Paths</span>
            </button>

            <button
              id="nav-stash"
              onClick={() => onSelectTab('stash')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'stash'
                  ? 'bg-[#263A32] text-[#F8F6F0] shadow-xs'
                  : 'text-[#69716B] dark:text-[#AEB6AF] hover:text-[#202421] dark:hover:text-[#F3F0E8] hover:bg-[#E8DDC8]/30 dark:hover:bg-[#222C27]'
              }`}
            >
              <Bookmark className="w-4 h-4 text-[#B39452]" />
              <span>Stash</span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Search */}
            <button
              id="btn-quick-search"
              onClick={onOpenSearch}
              aria-label="Quick Search"
              className="p-2 rounded-lg text-[#69716B] dark:text-[#AEB6AF] hover:text-[#202421] dark:hover:text-[#F3F0E8] hover:bg-[#E8DDC8]/40 dark:hover:bg-[#222C27] transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="btn-theme-toggle"
              onClick={onToggleDarkMode}
              aria-label="Toggle Dark Mode"
              className="p-2 rounded-lg text-[#69716B] dark:text-[#AEB6AF] hover:text-[#202421] dark:hover:text-[#F3F0E8] hover:bg-[#E8DDC8]/40 dark:hover:bg-[#222C27] transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-[#B39452]" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* About HALAKHA Trigger */}
            <button
              id="btn-about-halakha"
              onClick={onOpenAbout}
              aria-label="About HALAKHA"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#263A32] dark:text-[#E8DDC8] hover:bg-[#E8DDC8]/40 dark:hover:bg-[#222C27] transition-colors"
              title="About HALAKHA: The Name & Biblical Journey"
            >
              <Info className="w-3.5 h-3.5 text-[#B39452]" />
              <span>About</span>
            </button>

            {/* Onboarding Preferences Reset */}
            <button
              id="btn-onboarding-trigger"
              onClick={onOpenOnboarding}
              aria-label="Re-open Onboarding Interests"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#69716B] dark:text-[#AEB6AF] hover:bg-[#E8DDC8]/40 dark:hover:bg-[#222C27] transition-colors"
              title="Preferences & Interests"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Interests</span>
            </button>

            {/* Authentication Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-[#E8DDC8] dark:border-[#2E3B33]">
                <div
                  className="w-7 h-7 rounded-full bg-[#263A32] text-[#E8DDC8] flex items-center justify-center text-xs font-bold border border-[#B39452]/40"
                  title={currentUser.email || profile.displayName}
                >
                  {profile.displayName ? profile.displayName[0].toUpperCase() : 'U'}
                </div>
                <button
                  id="btn-sign-out"
                  onClick={onSignOut}
                  className="p-1.5 rounded-lg text-[#69716B] dark:text-[#AEB6AF] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-sign-in"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#263A32] hover:bg-[#1F2F29] text-[#F8F6F0] text-xs font-semibold transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-[#B39452]" />
                <span>Sign In</span>
              </button>
            )}

            {/* Admin CMS Mode Toggle (STRICTLY rendered only for verified Admin role or Master Email) */}
            {isAdminUser && (
              <button
                id="btn-admin-toggle"
                onClick={() => onSelectTab(currentTab === 'admin' ? 'home' : 'admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  currentTab === 'admin'
                    ? 'bg-[#B39452] text-[#263A32] border-[#B39452]'
                    : 'bg-[#263A32]/10 dark:bg-[#263A32]/40 text-[#263A32] dark:text-[#E8DDC8] border-[#263A32]/20 dark:border-[#B39452]/40 hover:bg-[#263A32]/20'
                }`}
                title="Editorial Content Management"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#B39452]" />
                <span className="hidden sm:inline">{currentTab === 'admin' ? 'Exit CMS' : 'Admin CMS'}</span>
                <span className="sm:hidden">CMS</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t ${
          darkMode ? 'bg-[#19211D]/95 border-[#2E3B33]' : 'bg-[#F8F6F0]/95 border-[#E8DDC8]'
        } backdrop-blur-lg px-2 py-1.5 flex items-center justify-around`}
      >
        <button
          id="mobile-nav-home"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
            currentTab === 'home' ? 'text-[#B39452]' : 'text-[#69716B] dark:text-[#AEB6AF]'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Discover</span>
        </button>

        <button
          id="mobile-nav-explore"
          onClick={() => onSelectTab('explore')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
            currentTab === 'explore' ? 'text-[#B39452]' : 'text-[#69716B] dark:text-[#AEB6AF]'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Explore</span>
        </button>

        <button
          id="mobile-nav-bible"
          onClick={() => onSelectTab('bible')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
            currentTab === 'bible' ? 'text-[#B39452]' : 'text-[#69716B] dark:text-[#AEB6AF]'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Bible</span>
        </button>

        <button
          id="mobile-nav-study"
          onClick={() => onSelectTab('study')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
            currentTab === 'study' ? 'text-[#B39452]' : 'text-[#69716B] dark:text-[#AEB6AF]'
          }`}
        >
          <GraduationCap className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Study</span>
        </button>

        <button
          id="mobile-nav-stash"
          onClick={() => onSelectTab('stash')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
            currentTab === 'stash' ? 'text-[#B39452]' : 'text-[#69716B] dark:text-[#AEB6AF]'
          }`}
        >
          <Bookmark className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Stash</span>
        </button>
      </nav>
    </>
  );
};
