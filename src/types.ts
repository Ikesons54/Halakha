export type ContentStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export type RelationshipType = 'PRIMARY' | 'SUPPORTING' | 'RELATED';

export type LearningPreference = 'QUICK_DISCOVERIES' | 'GUIDED_STUDIES' | 'SCRIPTURE_READING' | 'EVERYTHING';

export type AvailableTime = '5_MIN' | '10_MIN' | '15_MIN' | '20_PLUS';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Deep Dive';

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  onboardingCompleted: boolean;
  preferredLanguage: string;
  learningPreference: LearningPreference;
  availableTime: AvailableTime;
  selectedTopics: string[]; // topic slugs or IDs
  streakDays: number;
  lastActiveDate: string;
  role: 'user' | 'admin';
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  isFeatured: boolean;
  hebrewName?: string;
  hebrewMeaning?: string;
}

export interface Scripture {
  id: string;
  book: string;
  bookAbbreviation: string;
  testament: 'Tanakh' | 'Apostolic';
  division: 'Torah' | 'Prophets' | 'Writings' | 'Gospels' | 'Epistles';
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  reference: string;
  text: string;
  translation: string;
}

export interface IdeaScripture {
  id: string;
  ideaId: string;
  scriptureId: string;
  relationshipType: RelationshipType;
  displayOrder: number;
}

export interface Idea {
  id: string;
  title: string;
  slug: string;
  category: string; // e.g. 'Messiah', 'Torah', 'Feasts', etc.
  hook: string; // Layer 1: Hook
  summary: string; // Layer 2: Core Idea short
  content: string; // Layer 2: Full explanation
  context: string; // Layer 4: Historical, linguistic, Second Temple context
  interpretation: string; // Layer 5: Messianic Jewish interpretation
  application: string; // Layer 5: Practical life application
  coverImageUrl?: string;
  status: ContentStatus;
  featured: boolean;
  createdBy: string;
  reviewedBy?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Denormalized relations for quick display
  scriptureIds: string[];
  topicSlugs: string[];
  readTimeMinutes: number;
}

export interface StudyLesson {
  id: string;
  studyPathId: string;
  title: string;
  description: string;
  ideaId?: string;
  lessonOrder: number;
  estimatedMinutes: number;
  scriptureReference: string;
  scriptureText: string;
  coreIdea: string;
  contextNote: string;
  messianicConnection: string;
  reflectionPrompt: string;
}

export interface StudyPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl?: string;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  published: boolean;
  lessons: StudyLesson[];
}

export interface SavedIdea {
  id: string;
  userId: string;
  ideaId: string;
  savedAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  ideaIds: string[];
}

export interface Note {
  id: string;
  userId: string;
  ideaId?: string;
  scriptureId?: string;
  referenceTitle: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  studyPathId: string;
  lessonId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  completedAt?: string;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  hebrew?: string;
  type: 'concept' | 'scripture' | 'messianic' | 'feast' | 'person' | 'event';
  description: string;
  scriptureRef?: string;
  x?: number;
  y?: number;
}

export interface KnowledgeEdge {
  from: string;
  to: string;
  relationship: string;
}

export interface KnowledgeGraphData {
  centralNode: string;
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}
