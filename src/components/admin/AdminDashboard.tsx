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
  Database,
} from 'lucide-react';
import { Idea, Topic, Scripture, ContentStatus } from '../../types';
import { DatabaseService } from '../../lib/database';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setErrorMessage(null);
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
    setErrorMessage(null);
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

  const handleSaveIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await DatabaseService.saveIdea({
        id: editingIdea?.id || `idea-${Date.now()}`,
        title: title.trim(),
        slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        hook: hook.trim() || summary.trim(),
        summary: summary.trim(),
        content: content.trim() || summary.trim(),
        context: context.trim(),
        interpretation: interpretation.trim(),
        application: application.trim(),
        status,
        featured,
        createdBy: editingIdea?.createdBy || 'admin',
        createdAt: editingIdea?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : editingIdea?.publishedAt,
        scriptureIds: selectedScriptureIds,
        readTimeMinutes: Number(readTimeMinutes) || 3,
        topicSlugs: [category.toLowerCase()],
      });

      setIsEditorOpen(false);
      onDataChanged();
    } catch (err: unknown) {
      console.error('Failed to save to cloud database:', err);
      const msg = err instanceof Error ? err.message : 'Permission denied or network error';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this discovery from the cloud database?')) {
      try {
        await DatabaseService.deleteIdea(id);
        onDataChanged();
      } catch (err: unknown) {
        alert('Could not delete idea: Only verified admins can delete production content.');
      }
    }
  };

  const handleQuickStatusChange = async (idea: Idea, newStatus: ContentStatus) => {
    try {
      await DatabaseService.saveIdea({
        ...idea,
        status: newStatus,
        publishedAt: newStatus === 'PUBLISHED' ? new Date().toISOString() : idea.publishedAt,
      });
      onDataChanged();
    } catch (err: unknown) {
      alert('Could not update status: Admin privileges required.');
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
              HALAKHA Cloud Editorial CMS
            </span>
          </div>
          <h1 className="font-scripture text-3xl font-bold text-[#202421] dark:text-[#F3F0E8] mt-1">
            Admin Content & Editorial Pipeline
          </h1>
          <p className="text-xs text-[#69716B] dark:text-[#AEB6AF] mt-0.5">
            Synchronized directly to Firestore with server-enforced security rules.
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
                    <span className="text-[11px] text-[#69716B] dark:text-[#AEB6AF] line-clamp-1 mt-0.5">
                      {idea.hook}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] dark:bg-[#19221E] border border-[#E8DDC8] dark:border-[#2E3B33] font-medium text-[11px]">
                      {idea.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase ${
                        idea.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : idea.status === 'APPROVED'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                          : idea.status === 'IN_REVIEW'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      {idea.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {idea.scriptureIds.map((scId) => {
                        const sc = scriptures.find((s) => s.id === scId);
                        return (
                          <span
                            key={scId}
                            className="px-1.5 py-0.5 rounded bg-[#B39452]/15 text-[#B39452] font-mono text-[10px]"
                          >
                            {sc ? sc.reference : scId}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onPreviewIdea(idea)}
                        title="Preview 5-Layer Card"
                        className="p-1.5 rounded-lg text-[#69716B] hover:text-[#202421] dark:hover:text-[#F3F0E8] hover:bg-[#E8DDC8]/40"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {idea.status !== 'PUBLISHED' && (
                        <button
                          onClick={() => handleQuickStatusChange(idea, 'PUBLISHED')}
                          title="Quick Publish to Feed"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEdit(idea)}
                        title="Edit Idea"
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(idea.id)}
                        title="Delete Idea"
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1C2420] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8DDC8]/60 dark:border-[#2E3B33] pb-3">
              <h2 className="font-scripture text-2xl font-bold text-[#202421] dark:text-[#F3F0E8]">
                {editingIdea ? 'Edit Discovery' : 'New 5-Layer Discovery'}
              </h2>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-lg text-[#69716B] hover:text-[#202421] hover:bg-[#E8DDC8]/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSaveIdea} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. The Suffering Servant of Isaiah"
                    className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#B39452]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#B39452]"
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.hebrewName || ''})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Layer 1: Hook */}
              <div>
                <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                  Layer 1: Hook (Curiosity statement) *
                </label>
                <input
                  type="text"
                  required
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  placeholder="One striking sentence highlighting the mystery or connection..."
                  className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#B39452]"
                />
              </div>

              {/* Layer 2: Core Idea Summary */}
              <div>
                <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                  Layer 2: Core Idea Summary *
                </label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Concise 2-3 sentence overview of the core biblical insight..."
                  className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#B39452]"
                />
              </div>

              {/* Layer 3: Linked Scriptures */}
              <div>
                <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                  Layer 3: Primary Scriptures Linked
                </label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl bg-[#F8F6F0] dark:bg-[#151D19]">
                  {scriptures.map((sc) => {
                    const isSelected = selectedScriptureIds.includes(sc.id);
                    return (
                      <button
                        type="button"
                        key={sc.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedScriptureIds(selectedScriptureIds.filter((id) => id !== sc.id));
                          } else {
                            setSelectedScriptureIds([...selectedScriptureIds, sc.id]);
                          }
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${
                          isSelected
                            ? 'bg-[#B39452] text-[#263A32] font-bold'
                            : 'bg-white dark:bg-[#1C2420] text-[#69716B] border border-[#E8DDC8] dark:border-[#2E3B33]'
                        }`}
                      >
                        {sc.reference}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Layer 4: Context (Evidence & Second Temple Background) */}
              <div>
                <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                  Layer 4: Historical, Linguistic & Second Temple Context *
                </label>
                <textarea
                  rows={3}
                  required
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Hebrew nuances, ancient Near Eastern or Second Temple Jewish context..."
                  className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#B39452]"
                />
              </div>

              {/* Layer 5A: Messianic Interpretation */}
              <div>
                <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                  Layer 5A: Messianic Jewish Interpretation *
                </label>
                <textarea
                  rows={3}
                  required
                  value={interpretation}
                  onChange={(e) => setInterpretation(e.target.value)}
                  placeholder="How this illuminates the person, mission, and kingship of Yeshua..."
                  className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#B39452]"
                />
              </div>

              {/* Layer 5B: Practical Life Application */}
              <div>
                <label className="font-semibold text-[#263A32] dark:text-[#E8DDC8] block mb-1">
                  Layer 5B: Practical Life Application *
                </label>
                <textarea
                  rows={2}
                  required
                  value={application}
                  onChange={(e) => setApplication(e.target.value)}
                  placeholder="How the disciple walks (halakha) in light of this truth today..."
                  className="w-full bg-[#F8F6F0] dark:bg-[#151D19] border border-[#E8DDC8] dark:border-[#2E3B33] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#B39452]"
                />
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
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#263A32] hover:bg-[#1F2F29] text-[#F8F6F0] text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to Firestore...' : status === 'PUBLISHED' ? 'Publish Discovery Live' : 'Save as ' + status}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
