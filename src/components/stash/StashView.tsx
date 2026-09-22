import React, { useState } from 'react';
import {
  Bookmark,
  FolderPlus,
  BookOpen,
  Edit3,
  Trash2,
  Plus,
  Sparkles,
  Flame,
  CheckCircle2,
  Folder,
  ArrowRight,
} from 'lucide-react';
import { Idea, Collection, Note, Scripture, Profile } from '../../types';
import { StorageService } from '../../lib/storage';

interface StashViewProps {
  ideas: Idea[];
  scriptures: Scripture[];
  profile: Profile;
  onOpenIdeaCard: (idea: Idea) => void;
  onOpenScripture: (scripture: Scripture) => void;
  onExploreDiscoveries: () => void;
  onDataChanged: () => void;
}

export const StashView: React.FC<StashViewProps> = ({
  ideas,
  scriptures,
  profile,
  onOpenIdeaCard,
  onOpenScripture,
  onExploreDiscoveries,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'collections' | 'notes' | 'stats'>('saved');
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

  const savedEntries = StorageService.getSavedIdeas();
  const savedIdeaIds = new Set(savedEntries.map((s) => s.ideaId));
  const savedIdeas = ideas.filter((i) => savedIdeaIds.has(i.id));

  const collections = StorageService.getCollections();
  const notes = StorageService.getNotes();
  const progress = StorageService.getUserProgress();

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    StorageService.createCollection(newColName.trim(), newColDesc.trim());
    setNewColName('');
    setNewColDesc('');
    setShowCreateCollectionModal(false);
    onDataChanged();
  };

  const handleDeleteNote = (id: string) => {
    StorageService.deleteNote(id);
    onDataChanged();
  };

  const handleRemoveSaved = (ideaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.toggleSaveIdea(ideaId);
    onDataChanged();
  };

  const activeCollection = collections.find((c) => c.id === activeCollectionId);
  const collectionIdeas = activeCollection
    ? ideas.filter((i) => activeCollection.ideaIds.includes(i.id))
    : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#B39452] flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5" />
            Personal Biblical Repository
          </span>
          <h1 className="font-scripture text-3xl sm:text-4xl font-semibold text-[#202421] dark:text-[#F3F0E8] mt-1">
            My Stash
          </h1>
          <p className="text-xs sm:text-sm text-[#69716B] dark:text-[#AEB6AF] mt-0.5">
            Your saved discoveries, custom collections, and personal Scripture reflections.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowCreateCollectionModal(true)}
          className="px-4 py-2 rounded-xl bg-[#263A32] hover:bg-[#1F2F29] text-[#F8F6F0] text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <FolderPlus className="w-4 h-4 text-[#B39452]" />
          <span>New Collection</span>
        </button>
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8DDC8] dark:border-[#2E3B33] pb-2">
        <button
          onClick={() => {
            setActiveTab('saved');
            setActiveCollectionId(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'saved' && !activeCollectionId
              ? 'bg-[#263A32] text-[#F8F6F0]'
              : 'text-[#69716B] dark:text-[#AEB6AF] hover:bg-[#E8DDC8]/40 dark:hover:bg-[#222C27]'
          }`}
        >
          Saved Discoveries ({savedIdeas.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('collections');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'collections' || activeCollectionId
              ? 'bg-[#263A32] text-[#F8F6F0]'
              : 'text-[#69716B] dark:text-[#AEB6AF] hover:bg-[#E8DDC8]/40 dark:hover:bg-[#222C27]'
          }`}
        >
          Collections ({collections.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('notes');
            setActiveCollectionId(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'notes'
              ? 'bg-[#263A32] text-[#F8F6F0]'
              : 'text-[#69716B] dark:text-[#AEB6AF] hover:bg-[#E8DDC8]/40 dark:hover:bg-[#222C27]'
          }`}
        >
          Notes & Reflections ({notes.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('stats');
            setActiveCollectionId(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'stats'
              ? 'bg-[#263A32] text-[#F8F6F0]'
              : 'text-[#69716B] dark:text-[#AEB6AF] hover:bg-[#E8DDC8]/40 dark:hover:bg-[#222C27]'
          }`}
        >
          Learning Stats
        </button>
      </div>

      {/* Tab 1: Saved Ideas */}
      {activeTab === 'saved' && !activeCollectionId && (
        <section className="space-y-4">
          {savedIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedIdeas.map((idea) => {
                const ideaScriptures = scriptures.filter((s) => idea.scriptureIds.includes(s.id));
                return (
                  <div
                    key={idea.id}
                    onClick={() => onOpenIdeaCard(idea)}
                    className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-5 hover:border-[#B39452] transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#B39452] mb-1.5">
                        <span>{idea.category}</span>
                        <button
                          onClick={(e) => handleRemoveSaved(idea.id, e)}
                          className="text-[#69716B] hover:text-red-600 transition-colors p-1"
                          title="Remove from Saved"
                        >
                          <Bookmark className="w-3.5 h-3.5 fill-current text-[#B39452]" />
                        </button>
                      </div>
                      <h3 className="font-scripture text-xl font-bold text-[#202421] dark:text-[#F3F0E8] group-hover:text-[#B39452] transition-colors leading-snug mb-1.5">
                        {idea.title}
                      </h3>
                      <p className="text-xs text-[#69716B] dark:text-[#CAD3CC] line-clamp-2 leading-relaxed">
                        {idea.summary}
                      </p>
                    </div>

                    {ideaScriptures[0] && (
                      <div className="mt-4 pt-2.5 border-t border-[#E8DDC8]/60 dark:border-[#2E3B33] flex items-center justify-between text-xs text-[#263A32] dark:text-[#E8DDC8] font-medium">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <BookOpen className="w-3 h-3 text-[#B39452]" />
                          {ideaScriptures[0].reference}
                        </span>
                        <span className="text-xs font-semibold text-[#B39452]">Read →</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#E8DDC8]/50 dark:bg-[#222C27] flex items-center justify-center mx-auto text-[#263A32] dark:text-[#B39452]">
                <Bookmark className="w-5 h-5" />
              </div>
              <h3 className="font-scripture text-xl font-semibold text-[#202421] dark:text-[#F3F0E8]">
                Your Stash is empty
              </h3>
              <p className="text-xs text-[#69716B] dark:text-[#AEB6AF] max-w-sm mx-auto leading-relaxed">
                When something in Scripture speaks to you, tap the bookmark icon on any discovery card to save it here for future study.
              </p>
              <button
                onClick={onExploreDiscoveries}
                className="px-4 py-2 rounded-xl bg-[#263A32] text-[#F8F6F0] text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <span>Explore Today's Discoveries</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B39452]" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Collections Grid or Selected Collection Detail */}
      {(activeTab === 'collections' || activeCollectionId) && (
        <section className="space-y-4">
          {activeCollection ? (
            // Inside a specific collection
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8DDC8] dark:border-[#2E3B33] pb-3">
                <div>
                  <button
                    onClick={() => setActiveCollectionId(null)}
                    className="text-xs font-semibold text-[#B39452] hover:underline mb-1 block"
                  >
                    ← Back to all collections
                  </button>
                  <h3 className="font-scripture text-2xl font-bold text-[#202421] dark:text-[#F3F0E8]">
                    {activeCollection.name}
                  </h3>
                  <p className="text-xs text-[#69716B] dark:text-[#AEB6AF]">
                    {activeCollection.description} • {collectionIdeas.length} items
                  </p>
                </div>
              </div>

              {collectionIdeas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {collectionIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      onClick={() => onOpenIdeaCard(idea)}
                      className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-4.5 hover:border-[#B39452] cursor-pointer transition-all"
                    >
                      <span className="text-[11px] font-bold uppercase text-[#B39452] block mb-1">
                        {idea.category}
                      </span>
                      <h4 className="font-scripture text-lg font-bold text-[#202421] dark:text-[#F3F0E8] leading-tight mb-1">
                        {idea.title}
                      </h4>
                      <p className="text-xs text-[#69716B] dark:text-[#CAD3CC] line-clamp-2">
                        {idea.summary}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl">
                  <p className="text-xs text-[#69716B] dark:text-[#AEB6AF]">
                    No ideas in this collection yet. You can save ideas directly from the Discovery feed.
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Collections list
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => setActiveCollectionId(col.id)}
                  className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-5 hover:border-[#B39452] transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
                >
                  <div className="space-y-1.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E8DDC8]/50 dark:bg-[#222C27] flex items-center justify-center text-[#263A32] dark:text-[#B39452] mb-2">
                      <Folder className="w-4 h-4" />
                    </div>
                    <h3 className="font-scripture text-xl font-bold text-[#202421] dark:text-[#F3F0E8] group-hover:text-[#B39452] transition-colors">
                      {col.name}
                    </h3>
                    <p className="text-xs text-[#69716B] dark:text-[#CAD3CC] line-clamp-2 leading-relaxed">
                      {col.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E8DDC8]/60 dark:border-[#2E3B33] flex items-center justify-between text-xs text-[#263A32] dark:text-[#E8DDC8] font-semibold">
                    <span>{col.ideaIds.length} Discoveries</span>
                    <span className="text-[#B39452]">Open →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 3: Notes & Reflections */}
      {activeTab === 'notes' && !activeCollectionId && (
        <section className="space-y-4">
          {notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-5 shadow-xs relative"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-semibold text-sm text-[#263A32] dark:text-[#E8DDC8] tracking-tight">
                      {note.referenceTitle}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 rounded-md text-[#69716B] hover:text-red-600 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-[#333C37] dark:text-[#CAD3CC] leading-relaxed whitespace-pre-wrap font-sans">
                    {note.content}
                  </p>
                  <span className="text-[10px] text-[#69716B] dark:text-[#AEB6AF] block mt-3 font-mono">
                    {new Date(note.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl space-y-2">
              <p className="text-xs text-[#69716B] dark:text-[#AEB6AF]">
                No study notes written yet. Tap "Reflect" on any idea or verse to record what God is teaching you.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Tab 4: Learning Stats */}
      {activeTab === 'stats' && !activeCollectionId && (
        <section className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-4 text-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-[#B39452]/20 text-[#B39452] flex items-center justify-center mx-auto mb-1">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-2xl font-bold font-scripture text-[#263A32] dark:text-[#E8DDC8]">
                {profile.streakDays} Days
              </span>
              <span className="text-[11px] text-[#69716B] dark:text-[#AEB6AF] block uppercase tracking-wider">
                Discovery Streak
              </span>
            </div>

            <div className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-4 text-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-[#263A32]/10 dark:bg-[#222C27] text-[#263A32] dark:text-[#E8DDC8] flex items-center justify-center mx-auto mb-1">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-2xl font-bold font-scripture text-[#263A32] dark:text-[#E8DDC8]">
                {savedIdeas.length}
              </span>
              <span className="text-[11px] text-[#69716B] dark:text-[#AEB6AF] block uppercase tracking-wider">
                Ideas Saved
              </span>
            </div>

            <div className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-4 text-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-[#263A32]/10 dark:bg-[#222C27] text-[#263A32] dark:text-[#E8DDC8] flex items-center justify-center mx-auto mb-1">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-2xl font-bold font-scripture text-[#263A32] dark:text-[#E8DDC8]">
                {scriptures.length}
              </span>
              <span className="text-[11px] text-[#69716B] dark:text-[#AEB6AF] block uppercase tracking-wider">
                Passages Studied
              </span>
            </div>

            <div className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-4 text-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-[#263A32]/10 dark:bg-[#222C27] text-[#263A32] dark:text-[#E8DDC8] flex items-center justify-center mx-auto mb-1">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-2xl font-bold font-scripture text-[#263A32] dark:text-[#E8DDC8]">
                {progress.filter((p) => p.status === 'COMPLETED').length}
              </span>
              <span className="text-[11px] text-[#69716B] dark:text-[#AEB6AF] block uppercase tracking-wider">
                Lessons Finished
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Create Collection Modal */}
      {showCreateCollectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="font-scripture text-2xl font-bold text-[#202421] dark:text-[#F3F0E8]">
              Create New Collection
            </h3>
            <form onSubmit={handleCreateCollection} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prophecies of the King"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#202421] dark:text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#B39452]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What is the focus of this collection?"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl p-3 text-xs sm:text-sm text-[#202421] dark:text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#B39452] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCollectionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#69716B] hover:bg-[#E8DDC8]/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#263A32] text-[#F8F6F0] text-xs font-semibold"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
