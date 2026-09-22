import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  FileText,
  Sparkles,
  BookOpen,
  Filter,
  Eye,
  Check,
  X,
} from 'lucide-react';
import { Idea, Topic, Scripture, ContentStatus } from '../../types';
import { StorageService } from '../../lib/storage';

interface AdminDashboardProps {
  ideas: Idea[];
  topics: Topic[];
  scriptures: Scripture[];
  onDataChanged: () => void;
  onPreviewIdea: (idea: Idea) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  ideas,
  topics,
  scriptures,
  onDataChanged,
  onPreviewIdea,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | ContentStatus>('ALL');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Partial<Idea> | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Messiah');
  const [hook, setHook] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [context, setContext] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [application, setApplication] = useState('');
  const [status, setStatus] = useState<ContentStatus>('DRAFT');
  const [featured, setFeatured] = useState(false);
  const [selectedScriptureIds, setSelectedScriptureIds] = useState<string[]>([]);
  const [readTimeMinutes, setReadTimeMinutes] = useState(3);

  const filteredIdeas = statusFilter === 'ALL'
    ? ideas
    : ideas.filter((i) => i.status === statusFilter);

  const stats = {
    total: ideas.length,
    published: ideas.filter((i) => i.status === 'PUBLISHED').length,
    inReview: ideas.filter((i) => i.status === 'IN_REVIEW').length,
    approved: ideas.filter((i) => i.status === 'APPROVED').length,
    drafts: ideas.filter((i) => i.status === 'DRAFT').length,
  };

  const handleOpenCreate = () => {
    setEditingIdea(null);
    setTitle('');
    setCategory('Messiah');
    setHook('');
    setSummary('');
    setContent('');
    setContext('');
    setInterpretation('');
    setApplication('');
    setStatus('DRAFT');
    setFeatured(false);
    setSelectedScriptureIds(['sc-1']);
    setReadTimeMinutes(3);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (idea: Idea) => {
    setEditingIdea(idea);
    setTitle(idea.title);
    setCategory(idea.category);
    setHook(idea.hook || '');
    setSummary(idea.summary);
    setContent(idea.content || '');
    setContext(idea.context || '');
    setInterpretation(idea.interpretation || '');
    setApplication(idea.application || '');
    setStatus(idea.status);
    setFeatured(idea.featured);
    setSelectedScriptureIds(idea.scriptureIds || []);
    setReadTimeMinutes(idea.readTimeMinutes || 3);
    setIsEditorOpen(true);
  };

  const handleSaveIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category) return;

    StorageService.saveIdea({
      id: editingIdea?.id,
      title: title.trim(),
      category,
      hook: hook.trim() || summary.trim(),
      summary: summary.trim(),
      content: content.trim() || summary.trim(),
      context: context.trim(),
      interpretation: interpretation.trim(),
      application: application.trim(),
      status,
      featured,
      scriptureIds: selectedScriptureIds,
      readTimeMinutes: Number(readTimeMinutes) || 3,
      topicSlugs: [category.toLowerCase()],
    });

    setIsEditorOpen(false);
    onDataChanged();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this discovery?')) {
      StorageService.deleteIdea(id);
      onDataChanged();
    }
  };

  const handleQuickStatusChange = (idea: Idea, newStatus: ContentStatus) => {
    StorageService.saveIdea({
      ...idea,
      status: newStatus,
    });
    onDataChanged();
  };

  const getStatusBadge = (s: ContentStatus) => {
    switch (s) {
      case 'PUBLISHED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300';
      case 'IN_REVIEW':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
      case 'DRAFT':
        return 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300';
      case 'ARCHIVED':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <section className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#B39452]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#B39452]">
              HALAKHA Editorial CMS
            </span>
          </div>
          <h1 className="font-scripture text-3xl font-bold text-[#202421] dark:text-[#F3F0E8] mt-1">
            Admin Content & Editorial Pipeline
          </h1>
          <p className="text-xs text-[#69716B] dark:text-[#AEB6AF] mt-0.5">
            Maintain strict theological rigor, separate text from interpretation, and publish to the live discovery feed.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-[#263A32] hover:bg-[#1F2F29] text-[#F8F6F0] text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#B39452]" />
          <span>Create New Idea</span>
        </button>
      </section>

      {/* Stats Pipeline Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'ALL'
              ? 'border-[#263A32] bg-[#263A32] text-white shadow-xs'
              : 'border-[#E8DDC8] dark:border-[#2E3B33] bg-white dark:bg-[#1C2420]'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
            All Content
          </span>
          <span className="text-xl font-bold font-scripture mt-0.5 block">
            {stats.total}
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('PUBLISHED')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'PUBLISHED'
              ? 'border-emerald-600 bg-emerald-700 text-white shadow-xs'
              : 'border-[#E8DDC8] dark:border-[#2E3B33] bg-white dark:bg-[#1C2420]'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block text-emerald-600 dark:text-emerald-400">
            Published Live
          </span>
          <span className="text-xl font-bold font-scripture mt-0.5 block">
            {stats.published}
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('APPROVED')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'APPROVED'
              ? 'border-blue-600 bg-blue-700 text-white shadow-xs'
              : 'border-[#E8DDC8] dark:border-[#2E3B33] bg-white dark:bg-[#1C2420]'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block text-blue-600 dark:text-blue-400">
            Approved
          </span>
          <span className="text-xl font-bold font-scripture mt-0.5 block">
            {stats.approved}
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('IN_REVIEW')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'IN_REVIEW'
              ? 'border-amber-600 bg-amber-700 text-white shadow-xs'
              : 'border-[#E8DDC8] dark:border-[#2E3B33] bg-white dark:bg-[#1C2420]'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block text-amber-600 dark:text-amber-400">
            In Review
          </span>
          <span className="text-xl font-bold font-scripture mt-0.5 block">
            {stats.inReview}
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('DRAFT')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'DRAFT'
              ? 'border-stone-600 bg-stone-700 text-white shadow-xs'
              : 'border-[#E8DDC8] dark:border-[#2E3B33] bg-white dark:bg-[#1C2420]'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block text-stone-600 dark:text-stone-400">
            Drafts
          </span>
          <span className="text-xl font-bold font-scripture mt-0.5 block">
            {stats.drafts}
          </span>
        </div>
      </div>

      {/* Ideas Table */}
      <section className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E8DDC8] dark:border-[#2E3B33] flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[#202421] dark:text-[#F3F0E8]">
            Discoveries List ({filteredIdeas.length})
          </h3>
          <span className="text-xs text-[#69716B] dark:text-[#AEB6AF]">
            Editorial review state: {statusFilter}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] dark:bg-[#151D19] border-b border-[#E8DDC8] dark:border-[#2E3B33] text-[#69716B] dark:text-[#AEB6AF]">
                <th className="py-3 px-4 font-semibold">Title</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Scriptures</th>
                <th className="py-3 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DDC8]/60 dark:divide-[#2E3B33]">
              {filteredIdeas.map((idea) => (
                <tr
                  key={idea.id}
                  className="hover:bg-[#FAF8F5]/50 dark:hover:bg-[#151D19]/50 transition-colors"
                >
                  <td className="py-3.5 px-4 font-medium text-[#202421] dark:text-[#F3F0E8]">
                    <div className="flex items-center gap-1.5">
                      <span>{idea.title}</span>
                      {idea.featured && (
                        <span title="Featured">
                          <Sparkles className="w-3 h-3 text-[#B39452]" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-[#E8DDC8]/50 dark:bg-[#222C27] text-[#263A32] dark:text-[#E8DDC8] font-semibold">
                      {idea.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <select
                      value={idea.status}
                      onChange={(e) =>
                        handleQuickStatusChange(idea, e.target.value as ContentStatus)
                      }
                      className={`text-[11px] font-bold rounded-md px-2 py-1 border-0 focus:ring-1 focus:ring-[#B39452] ${getStatusBadge(
                        idea.status
                      )}`}
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="IN_REVIEW">IN REVIEW</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-3 text-[#69716B] dark:text-[#AEB6AF] font-mono">
                    {idea.scriptureIds?.length || 0} attached
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onPreviewIdea(idea)}
                        className="p-1.5 rounded-lg text-[#69716B] hover:text-[#202421] dark:hover:text-[#F3F0E8] hover:bg-[#E8DDC8]/40"
                        title="Preview Idea Card"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(idea)}
                        className="p-1.5 rounded-lg text-[#69716B] hover:text-[#202421] dark:hover:text-[#F3F0E8] hover:bg-[#E8DDC8]/40"
                        title="Edit Idea"
                      >
                        <Edit className="w-4 h-4 text-[#B39452]" />
                      </button>
                      <button
                        onClick={() => handleDelete(idea.id)}
                        className="p-1.5 rounded-lg text-[#69716B] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        title="Delete Idea"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Idea Create / Edit Modal (5-layer content creator) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[92vh] bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E8DDC8] dark:border-[#2E3B33] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B39452]">
                  5-Layer Content Model
                </span>
                <h3 className="font-scripture text-2xl font-bold text-[#202421] dark:text-[#F3F0E8]">
                  {editingIdea ? 'Edit Discovery Card' : 'Create New Discovery'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-lg text-[#69716B] hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Form */}
            <form onSubmit={handleSaveIdea} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Suffering Servant & The King"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl px-3 py-2 text-xs text-[#202421] dark:text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#B39452]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                    Category Pillar *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl px-3 py-2 text-xs text-[#202421] dark:text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#B39452]"
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Layer 1: Hook */}
              <div>
                <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                  Layer 1 — The Hook (One compelling introductory sentence)
                </label>
                <input
                  type="text"
                  placeholder="e.g. The wilderness was never just a desert path; it is God's sacred crucible."
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl px-3 py-2 text-xs text-[#202421] dark:text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#B39452]"
                />
              </div>

              {/* Layer 2: Summary */}
              <div>
                <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                  Layer 2 — Core Idea Summary *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Short, crystal-clear explanation of the biblical discovery..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl p-2.5 text-xs text-[#202421] dark:text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#B39452] resize-none"
                />
              </div>

              {/* Layer 4: Context */}
              <div>
                <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                  Layer 4 — Historical & Linguistic Context
                </label>
                <textarea
                  rows={2}
                  placeholder="Second Temple context, Hebrew word roots, cultural background..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl p-2.5 text-xs text-[#202421] dark:text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#B39452] resize-none"
                />
              </div>

              {/* Layer 5: Interpretation */}
              <div>
                <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                  Layer 5 — Messianic Jewish Interpretation (Distinct from raw Scripture text)
                </label>
                <textarea
                  rows={2}
                  placeholder="How Messianic Jewish tradition and Apostolic Scripture understand this..."
                  value={interpretation}
                  onChange={(e) => setInterpretation(e.target.value)}
                  className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl p-2.5 text-xs text-[#202421] dark:text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#B39452] resize-none"
                />
              </div>

              {/* Practical Application */}
              <div>
                <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                  Practical Application
                </label>
                <input
                  type="text"
                  placeholder="How does this transform personal discipleship and worship today?"
                  value={application}
                  onChange={(e) => setApplication(e.target.value)}
                  className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl px-3 py-2 text-xs text-[#202421] dark:text-[#F3F0E8] focus:outline-none focus:ring-2 focus:ring-[#B39452]"
                />
              </div>

              {/* Scripture Attachment Picker */}
              <div>
                <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                  Attached Scripture Passages
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-[#F8F6F0] dark:bg-[#151D19] rounded-xl border border-[#E8DDC8] dark:border-[#2E3B33]">
                  {scriptures.map((sc) => {
                    const isSelected = selectedScriptureIds.includes(sc.id);
                    return (
                      <label
                        key={sc.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-[#B39452]/20 font-semibold text-[#263A32] dark:text-[#E8DDC8]'
                            : 'hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedScriptureIds([...selectedScriptureIds, sc.id]);
                            } else {
                              setSelectedScriptureIds(
                                selectedScriptureIds.filter((id) => id !== sc.id)
                              );
                            }
                          }}
                        />
                        <span>{sc.reference}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Status & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                    Editorial Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ContentStatus)}
                    className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#B39452]"
                  >
                    <option value="DRAFT">DRAFT (Hidden from users)</option>
                    <option value="IN_REVIEW">IN REVIEW (Editorial check)</option>
                    <option value="APPROVED">APPROVED (Ready to publish)</option>
                    <option value="PUBLISHED">PUBLISHED (Live in user feed)</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#263A32] dark:text-[#E8DDC8]">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded"
                    />
                    <span>Feature on Home Banner</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E8DDC8]/60 dark:border-[#2E3B33]">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#69716B] hover:bg-[#E8DDC8]/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#263A32] hover:bg-[#1F2F29] text-[#F8F6F0] text-xs font-semibold shadow-xs"
                >
                  {status === 'PUBLISHED' ? 'Publish Discovery Live' : 'Save as ' + status}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
