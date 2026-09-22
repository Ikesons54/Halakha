import React, { useState } from 'react';
import { X, Edit3, BookOpen, Sparkles, Check } from 'lucide-react';
import { Idea, Scripture } from '../../types';
import { StorageService } from '../../lib/storage';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea?: Idea | null;
  scripture?: Scripture | null;
  onNoteSaved: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  idea,
  scripture,
  onNoteSaved,
}) => {
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const defaultTitle = idea
    ? `Reflection on: ${idea.title}`
    : scripture
    ? `Note on ${scripture.reference}`
    : 'Personal Study Reflection';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    StorageService.saveNote({
      ideaId: idea?.id,
      scriptureId: scripture?.id,
      referenceTitle: defaultTitle,
      content: content.trim(),
    });

    setIsSaved(true);
    onNoteSaved();
    setTimeout(() => {
      setIsSaved(false);
      setContent('');
      onClose();
    }, 600);
  };

  return (
    <div
      id="note-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="note-modal"
        className="w-full max-w-lg bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-3xl shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-[#E8DDC8]/60 dark:border-[#2E3B33] pb-3">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[#B39452]" />
            <h3 className="font-scripture text-xl font-bold text-[#202421] dark:text-[#F3F0E8]">
              Record Scripture Reflection
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#69716B] hover:text-[#202421] dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Anchor Context Reference */}
        <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#151D19] border border-[#E8DDC8]/60 dark:border-[#2E3B33] text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#B39452] block">
            Anchor Reference
          </span>
          <p className="font-semibold text-[#202421] dark:text-[#F3F0E8]">
            {defaultTitle}
          </p>
          {scripture && (
            <p className="font-scripture italic text-[#69716B] dark:text-[#CAD3CC] line-clamp-2">
              "{scripture.text}"
            </p>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
              Your Insight or Question
            </label>
            <textarea
              rows={4}
              required
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did the Holy Spirit highlight in this text? How does this connect to Yeshua or your walk?"
              className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl p-3 text-xs sm:text-sm text-[#202421] dark:text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#B39452] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#69716B] hover:bg-[#E8DDC8]/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#263A32] text-[#F8F6F0] text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Saved to Stash!</span>
                </>
              ) : (
                <span>Save to Stash</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
