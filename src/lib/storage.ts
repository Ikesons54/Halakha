import {
  Profile,
  Topic,
  Scripture,
  Idea,
  StudyPath,
  SavedIdea,
  Collection,
  Note,
  UserProgress,
  KnowledgeGraphData,
  ContentStatus,
} from '../types';
import {
  INITIAL_TOPICS,
  INITIAL_SCRIPTURES,
  INITIAL_IDEAS,
  INITIAL_STUDY_PATHS,
  INITIAL_KNOWLEDGE_GRAPH,
} from '../data/initialData';

const STORAGE_KEYS = {
  PROFILE: 'halakha_profile_v1',
  TOPICS: 'halakha_topics_v1',
  SCRIPTURES: 'halakha_scriptures_v1',
  IDEAS: 'halakha_ideas_v1',
  STUDY_PATHS: 'halakha_study_paths_v1',
  SAVED_IDEAS: 'halakha_saved_ideas_v1',
  COLLECTIONS: 'halakha_collections_v1',
  NOTES: 'halakha_notes_v1',
  USER_PROGRESS: 'halakha_user_progress_v1',
  KNOWLEDGE_GRAPH: 'halakha_knowledge_graph_v1',
  THEME: 'halakha_theme_v1',
};

const LEGACY_KEYS: Record<string, string> = {
  halakha_profile_v1: 'rooted_profile_v1',
  halakha_topics_v1: 'rooted_topics_v1',
  halakha_scriptures_v1: 'rooted_scriptures_v1',
  halakha_ideas_v1: 'rooted_ideas_v1',
  halakha_study_paths_v1: 'rooted_study_paths_v1',
  halakha_saved_ideas_v1: 'rooted_saved_ideas_v1',
  halakha_collections_v1: 'rooted_collections_v1',
  halakha_notes_v1: 'rooted_notes_v1',
  halakha_user_progress_v1: 'rooted_user_progress_v1',
  halakha_knowledge_graph_v1: 'rooted_knowledge_graph_v1',
  halakha_theme_v1: 'rooted_theme_v1',
};

function getStorageRaw(key: string): string | null {
  if (typeof window === 'undefined') return null;
  const current = localStorage.getItem(key);
  if (current) return current;
  const legacyKey = LEGACY_KEYS[key];
  if (legacyKey) {
    const legacyVal = localStorage.getItem(legacyKey);
    if (legacyVal) {
      localStorage.setItem(key, legacyVal);
      return legacyVal;
    }
  }
  return null;
}

const DEFAULT_PROFILE: Profile = {
  id: 'user-default-1',
  displayName: 'Saved Soul',
  avatarUrl: '',
  bio: 'Seeking to understand Scripture in its original Jewish and Messianic context.',
  onboardingCompleted: true,
  preferredLanguage: 'English',
  learningPreference: 'QUICK_DISCOVERIES',
  availableTime: '10_MIN',
  selectedTopics: ['messiah', 'feasts', 'torah', 'prophecy'],
  streakDays: 7,
  lastActiveDate: new Date().toISOString().split('T')[0],
  role: 'user', // toggle to 'admin'
};

const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    userId: 'user-default-1',
    name: 'My Messianic Prophecy Study',
    description: 'Foundational passages predicting the Suffering Servant and King in the Tanakh.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ideaIds: ['idea-1', 'idea-8'],
  },
  {
    id: 'col-2',
    userId: 'user-default-1',
    name: 'Passover & The Moedim',
    description: 'Exploring the appointed times and their prophetic fulfillment in Yeshua.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ideaIds: ['idea-2', 'idea-6'],
  },
];

const DEFAULT_NOTES: Note[] = [
  {
    id: 'note-1',
    userId: 'user-default-1',
    ideaId: 'idea-1',
    referenceTitle: 'The Suffering Servant & The King',
    content: 'Targum Jonathan explicitly translates Isaiah 52:13 with "Behold, my servant the Messiah shall prosper." Shows ancient Jewish recognition of the Messianic nature of the text.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'note-2',
    userId: 'user-default-1',
    scriptureId: 'sc-2',
    referenceTitle: 'Exodus 12:13 — The Blood of the Lamb',
    content: 'The blood applied on the lintel and posts formed three contact points. The sign of protective cover from judgment.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

export class StorageService {
  // Profile
  static getProfile(): Profile {
    try {
      const data = getStorageRaw(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  static saveProfile(profile: Partial<Profile>): Profile {
    const current = this.getProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  }

  // Topics
  static getTopics(): Topic[] {
    try {
      const data = getStorageRaw(STORAGE_KEYS.TOPICS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(INITIAL_TOPICS));
        return INITIAL_TOPICS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TOPICS;
    }
  }

  static getTopicBySlug(slug: string): Topic | undefined {
    return this.getTopics().find((t) => t.slug === slug);
  }

  // Scriptures
  static getScriptures(): Scripture[] {
    try {
      const data = getStorageRaw(STORAGE_KEYS.SCRIPTURES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SCRIPTURES, JSON.stringify(INITIAL_SCRIPTURES));
        return INITIAL_SCRIPTURES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SCRIPTURES;
    }
  }

  static getScriptureById(id: string): Scripture | undefined {
    return this.getScriptures().find((s) => s.id === id);
  }

  static addScripture(scripture: Omit<Scripture, 'id'>): Scripture {
    const list = this.getScriptures();
    const newItem: Scripture = {
      ...scripture,
      id: `sc-${Date.now()}`,
    };
    list.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.SCRIPTURES, JSON.stringify(list));
    return newItem;
  }

  // Ideas
  static getIdeas(): Idea[] {
    try {
      const data = getStorageRaw(STORAGE_KEYS.IDEAS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(INITIAL_IDEAS));
        return INITIAL_IDEAS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_IDEAS;
    }
  }

  static getPublishedIdeas(): Idea[] {
    return this.getIdeas().filter((i) => i.status === 'PUBLISHED');
  }

  static getIdeaById(id: string): Idea | undefined {
    return this.getIdeas().find((i) => i.id === id);
  }

  static saveIdea(ideaData: Partial<Idea> & { title: string; category: string }): Idea {
    const list = this.getIdeas();
    const now = new Date().toISOString();
    const existingIndex = list.findIndex((i) => i.id === ideaData.id);

    if (existingIndex >= 0) {
      const updated: Idea = {
        ...list[existingIndex],
        ...ideaData,
        updatedAt: now,
      };
      if (ideaData.status === 'PUBLISHED' && !updated.publishedAt) {
        updated.publishedAt = now;
      }
      list[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(list));
      return updated;
    } else {
      const newIdea: Idea = {
        id: ideaData.id || `idea-${Date.now()}`,
        title: ideaData.title,
        slug: ideaData.slug || ideaData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: ideaData.category,
        hook: ideaData.hook || '',
        summary: ideaData.summary || '',
        content: ideaData.content || '',
        context: ideaData.context || '',
        interpretation: ideaData.interpretation || '',
        application: ideaData.application || '',
        status: ideaData.status || 'DRAFT',
        featured: ideaData.featured ?? false,
        createdBy: ideaData.createdBy || 'Admin',
        publishedAt: ideaData.status === 'PUBLISHED' ? now : undefined,
        createdAt: now,
        updatedAt: now,
        scriptureIds: ideaData.scriptureIds || [],
        topicSlugs: ideaData.topicSlugs || [ideaData.category.toLowerCase()],
        readTimeMinutes: ideaData.readTimeMinutes || 3,
      };
      list.unshift(newIdea);
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(list));
      return newIdea;
    }
  }

  static deleteIdea(id: string): void {
    const list = this.getIdeas().filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(list));
  }

  // Study Paths
  static getStudyPaths(): StudyPath[] {
    try {
      const data = getStorageRaw(STORAGE_KEYS.STUDY_PATHS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.STUDY_PATHS, JSON.stringify(INITIAL_STUDY_PATHS));
        return INITIAL_STUDY_PATHS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_STUDY_PATHS;
    }
  }

  static getStudyPathById(id: string): StudyPath | undefined {
    return this.getStudyPaths().find((sp) => sp.id === id);
  }

  // User Progress
  static getUserProgress(): UserProgress[] {
    try {
      const data = getStorageRaw(STORAGE_KEYS.USER_PROGRESS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static markLessonComplete(studyPathId: string, lessonId: string): void {
    const list = this.getUserProgress();
    const existing = list.find((p) => p.studyPathId === studyPathId && p.lessonId === lessonId);
    if (existing) {
      existing.status = 'COMPLETED';
      existing.completedAt = new Date().toISOString();
    } else {
      list.push({
        id: `prog-${Date.now()}`,
        userId: this.getProfile().id,
        studyPathId,
        lessonId,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(list));
  }

  static getStudyPathProgress(studyPathId: string): { completed: number; total: number; percentage: number } {
    const path = this.getStudyPathById(studyPathId);
    if (!path) return { completed: 0, total: 0, percentage: 0 };
    const progress = this.getUserProgress().filter(
      (p) => p.studyPathId === studyPathId && p.status === 'COMPLETED'
    );
    const total = path.lessons.length;
    const completed = progress.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }

  // Saved Ideas
  static getSavedIdeas(): SavedIdea[] {
    try {
      const data = getStorageRaw(STORAGE_KEYS.SAVED_IDEAS);
      if (!data) {
        const init = [
          { id: 'save-1', userId: 'user-default-1', ideaId: 'idea-1', savedAt: new Date().toISOString() },
          { id: 'save-2', userId: 'user-default-1', ideaId: 'idea-2', savedAt: new Date().toISOString() },
        ];
        localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, JSON.stringify(init));
        return init;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static isIdeaSaved(ideaId: string): boolean {
    return this.getSavedIdeas().some((s) => s.ideaId === ideaId);
  }

  static toggleSaveIdea(ideaId: string): boolean {
    const list = this.getSavedIdeas();
    const index = list.findIndex((s) => s.ideaId === ideaId);
    if (index >= 0) {
      list.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, JSON.stringify(list));
      return false;
    } else {
      list.unshift({
        id: `save-${Date.now()}`,
        userId: this.getProfile().id,
        ideaId,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, JSON.stringify(list));
      return true;
    }
  }

  // Collections
  static getCollections(): Collection[] {
    try {
      const data = getStorageRaw(STORAGE_KEYS.COLLECTIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(DEFAULT_COLLECTIONS));
        return DEFAULT_COLLECTIONS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_COLLECTIONS;
    }
  }

  static createCollection(name: string, description: string): Collection {
    const list = this.getCollections();
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      userId: this.getProfile().id,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ideaIds: [],
    };
    list.unshift(newCol);
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(list));
    return newCol;
  }

  static addIdeaToCollection(collectionId: string, ideaId: string): void {
    const list = this.getCollections();
    const col = list.find((c) => c.id === collectionId);
    if (col && !col.ideaIds.includes(ideaId)) {
      col.ideaIds.push(ideaId);
      col.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(list));
    }
  }

  static removeIdeaFromCollection(collectionId: string, ideaId: string): void {
    const list = this.getCollections();
    const col = list.find((c) => c.id === collectionId);
    if (col) {
      col.ideaIds = col.ideaIds.filter((id) => id !== ideaId);
      col.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(list));
    }
  }

  // Notes
  static getNotes(): Note[] {
    try {
      const data = getStorageRaw(STORAGE_KEYS.NOTES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(DEFAULT_NOTES));
        return DEFAULT_NOTES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_NOTES;
    }
  }

  static saveNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'> & { id?: string }): Note {
    const list = this.getNotes();
    const now = new Date().toISOString();
    if (note.id) {
      const index = list.findIndex((n) => n.id === note.id);
      if (index >= 0) {
        list[index] = { ...list[index], ...note, updatedAt: now };
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(list));
        return list[index];
      }
    }
    const newNote: Note = {
      id: `note-${Date.now()}`,
      userId: this.getProfile().id,
      referenceTitle: note.referenceTitle,
      content: note.content,
      ideaId: note.ideaId,
      scriptureId: note.scriptureId,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(newNote);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(list));
    return newNote;
  }

  static deleteNote(id: string): void {
    const list = this.getNotes().filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(list));
  }

  // Knowledge Graph
  static getKnowledgeGraph(): KnowledgeGraphData {
    try {
      const data = getStorageRaw(STORAGE_KEYS.KNOWLEDGE_GRAPH);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_GRAPH, JSON.stringify(INITIAL_KNOWLEDGE_GRAPH));
        return INITIAL_KNOWLEDGE_GRAPH;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_KNOWLEDGE_GRAPH;
    }
  }

  // V1 Recommendation Logic matching Section 20
  // Messiah preference +5, Previously saved topic +3, Related to current study +4, Featured +2
  static getRecommendedIdeas(): Idea[] {
    const profile = this.getProfile();
    const published = this.getPublishedIdeas();
    const saved = this.getSavedIdeas();
    const savedIdeaIds = new Set(saved.map((s) => s.ideaId));

    const scored = published.map((idea) => {
      let score = 0;
      // Topic interest match
      const matchesUserTopic = idea.topicSlugs.some((ts) => profile.selectedTopics.includes(ts));
      if (matchesUserTopic) score += 5;

      // Featured content bonus
      if (idea.featured) score += 2;

      // Topic was saved previously
      const savedIdeasObj = published.filter((i) => savedIdeaIds.has(i.id));
      const savedTopicSlugs = new Set(savedIdeasObj.flatMap((i) => i.topicSlugs));
      if (idea.topicSlugs.some((ts) => savedTopicSlugs.has(ts))) score += 3;

      // Available time filter compatibility
      if (profile.availableTime === '5_MIN' && idea.readTimeMinutes <= 3) score += 2;

      return { idea, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.idea);
  }

  // Search Engine
  static searchAll(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { ideas: [], scriptures: [], topics: [], studyPaths: [] };
    }

    const ideas = this.getPublishedIdeas().filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.summary.toLowerCase().includes(q) ||
        i.content.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.context.toLowerCase().includes(q)
    );

    const scriptures = this.getScriptures().filter(
      (s) =>
        s.reference.toLowerCase().includes(q) ||
        s.text.toLowerCase().includes(q) ||
        s.book.toLowerCase().includes(q)
    );

    const topics = this.getTopics().filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.hebrewName && t.hebrewName.includes(q)) ||
        (t.hebrewMeaning && t.hebrewMeaning.toLowerCase().includes(q))
    );

    const studyPaths = this.getStudyPaths().filter(
      (sp) =>
        sp.title.toLowerCase().includes(q) ||
        sp.description.toLowerCase().includes(q)
    );

    return { ideas, scriptures, topics, studyPaths };
  }
}
