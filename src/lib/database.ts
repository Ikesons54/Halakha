import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { db, auth, googleProvider } from './firebase';
import { supabase } from './supabase';
import { StorageService } from './storage';
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
} from '../types';
import {
  INITIAL_TOPICS,
  INITIAL_SCRIPTURES,
  INITIAL_IDEAS,
  INITIAL_STUDY_PATHS,
  INITIAL_KNOWLEDGE_GRAPH,
} from '../data/initialData';

// Fallback guest profile
const DEFAULT_GUEST_PROFILE: Profile = {
  id: 'guest',
  displayName: 'Seeker of Halakha',
  bio: 'Walking through Scripture, discovering Messiah, and exploring biblical roots.',
  onboardingCompleted: false,
  preferredLanguage: 'en',
  learningPreference: 'EVERYTHING',
  availableTime: '15_MIN',
  selectedTopics: ['messiah', 'torah', 'feasts', 'prophecy'],
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  role: 'user',
};

export class DatabaseService {
  private static isInitialized = false;

  /**
   * One-time database bootstrapper:
   * Checks if Firestore collections have seeded content; if empty, populates curated topics,
   * scriptures, 5-layer ideas, study paths, and knowledge graph.
   */
  static async initializePublicCorpus(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const topicsSnap = await getDocs(collection(db, 'topics'));
      if (topicsSnap.empty) {
        console.log('Seeding initial HALAKHA corpus into Firestore...');
        // Seed Topics
        for (const t of INITIAL_TOPICS) {
          await setDoc(doc(db, 'topics', t.id), t);
        }
        // Seed Scriptures
        for (const s of INITIAL_SCRIPTURES) {
          await setDoc(doc(db, 'scriptures', s.id), s);
        }
        // Seed Ideas
        for (const i of INITIAL_IDEAS) {
          await setDoc(doc(db, 'ideas', i.id), i);
        }
        // Seed Study Paths
        for (const sp of INITIAL_STUDY_PATHS) {
          await setDoc(doc(db, 'study_paths', sp.id), sp);
        }
        // Seed Knowledge Graph
        await setDoc(doc(db, 'knowledge_graphs', 'v1_main'), INITIAL_KNOWLEDGE_GRAPH);
        console.log('HALAKHA Firestore corpus seeding complete.');
      }
      this.isInitialized = true;
    } catch (err) {
      console.warn('Public corpus initialization skipped or already present:', err);
      this.isInitialized = true;
    }
  }

  // ==========================================
  // AUTHENTICATION & SESSION MANAGEMENT
  // Prioritizes Supabase Auth while maintaining Firebase Auth compatibility
  // ==========================================
  static onAuthChange(callback: (user: FirebaseUser | null) => void): Unsubscribe {
    // 1. Listen for Supabase session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = session.user;
        const mappedUser: FirebaseUser = {
          uid: u.id,
          email: u.email || null,
          displayName: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Member',
          photoURL: u.user_metadata?.avatar_url || null,
          emailVerified: Boolean(u.email_confirmed_at),
        } as unknown as FirebaseUser;
        callback(mappedUser);
      } else {
        // Fallback to Firebase current auth state
        const fbUser = auth.currentUser;
        callback(fbUser);
      }
    });

    // 2. Also listen for Firebase auth changes
    const unsubFb = onAuthStateChanged(auth, (fbUser) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.user) {
          callback(fbUser);
        }
      });
    });

    return () => {
      subscription.unsubscribe();
      unsubFb();
    };
  }

  static async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
    } catch {
      // Continue with Firebase Google provider
    }
    const res = await signInWithPopup(auth, googleProvider);
    await this.ensureUserProfile(res.user);
    return res.user;
  }

  static async signInWithEmail(email: string, pass: string): Promise<FirebaseUser> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (!error && data.user) {
        const mappedUser: FirebaseUser = {
          uid: data.user.id,
          email: data.user.email || null,
          displayName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Member',
          photoURL: null,
          emailVerified: true,
        } as unknown as FirebaseUser;
        await this.ensureUserProfile(mappedUser);
        return mappedUser;
      }
    } catch {
      // Fallback to Firebase
    }
    const res = await signInWithEmailAndPassword(auth, email, pass);
    await this.ensureUserProfile(res.user);
    return res.user;
  }

  static async registerWithEmail(email: string, pass: string, name?: string): Promise<FirebaseUser> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { full_name: name || email.split('@')[0] },
        },
      });
      if (!error && data.user) {
        const mappedUser: FirebaseUser = {
          uid: data.user.id,
          email: data.user.email || null,
          displayName: name || data.user.email?.split('@')[0] || 'Member',
          photoURL: null,
          emailVerified: false,
        } as unknown as FirebaseUser;
        await this.ensureUserProfile(mappedUser, name);
        return mappedUser;
      }
    } catch {
      // Fallback to Firebase
    }
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    await this.ensureUserProfile(res.user, name);
    return res.user;
  }

  static async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    await fbSignOut(auth);
  }

  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // ==========================================
  // USER PROFILES
  // ==========================================
  static async ensureUserProfile(user: FirebaseUser, customName?: string): Promise<Profile> {
    const userRef = doc(db, 'profiles', user.uid);
    const isMasterAdmin = user.email === 'savedsoul898@gmail.com';

    try {
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data() as Profile;
        // If master email hasn't gained admin role yet, update it
        if (isMasterAdmin && data.role !== 'admin') {
          await updateDoc(userRef, { role: 'admin' });
          data.role = 'admin';
        }
        return data;
      }

      const newProfile: Profile = {
        id: user.uid,
        displayName: customName || user.displayName || user.email?.split('@')[0] || 'Seeker',
        avatarUrl: user.photoURL || undefined,
        bio: 'Walking through Scripture and exploring the biblical world.',
        onboardingCompleted: false,
        preferredLanguage: 'en',
        learningPreference: 'EVERYTHING',
        availableTime: '15_MIN',
        selectedTopics: ['messiah', 'torah', 'feasts', 'prophecy'],
        streakDays: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        role: isMasterAdmin ? 'admin' : 'user',
      };

      await setDoc(userRef, newProfile);
      return newProfile;
    } catch (err) {
      console.warn('Could not sync user profile with Firestore, using fallback profile:', err);
      return {
        ...DEFAULT_GUEST_PROFILE,
        id: user.uid,
        displayName: customName || user.displayName || user.email?.split('@')[0] || 'Seeker',
        role: isMasterAdmin ? 'admin' : 'user',
      };
    }
  }

  static async getProfile(userId: string): Promise<Profile> {
    if (!userId || userId === 'guest') return DEFAULT_GUEST_PROFILE;
    try {
      const snap = await getDoc(doc(db, 'profiles', userId));
      if (snap.exists()) {
        return snap.data() as Profile;
      }
    } catch (err) {
      console.error('Error fetching profile from Firestore:', err);
    }
    return DEFAULT_GUEST_PROFILE;
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
    if (!userId || userId === 'guest') return;
    const ref = doc(db, 'profiles', userId);
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  // ==========================================
  // PUBLIC CORPUS: TOPICS, SCRIPTURES, IDEAS, PATHS
  // ==========================================
  static async getTopics(): Promise<Topic[]> {
    try {
      const snap = await getDocs(collection(db, 'topics'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as Topic);
      }
    } catch (err) {
      console.warn('Falling back to initial topics:', err);
    }
    return INITIAL_TOPICS;
  }

  static async getScriptures(): Promise<Scripture[]> {
    try {
      const snap = await getDocs(collection(db, 'scriptures'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as Scripture);
      }
    } catch (err) {
      console.warn('Falling back to initial scriptures:', err);
    }
    return INITIAL_SCRIPTURES;
  }

  static async getIdeas(userRole: 'user' | 'admin' = 'user'): Promise<Idea[]> {
    try {
      const colRef = collection(db, 'ideas');
      const q = userRole === 'admin'
        ? query(colRef)
        : query(colRef, where('status', '==', 'PUBLISHED'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as Idea);
      }
    } catch (err) {
      console.warn('Falling back to initial ideas:', err);
    }
    return userRole === 'admin' ? INITIAL_IDEAS : INITIAL_IDEAS.filter((i) => i.status === 'PUBLISHED');
  }

  static async getStudyPaths(userRole: 'user' | 'admin' = 'user'): Promise<StudyPath[]> {
    try {
      const colRef = collection(db, 'study_paths');
      const q = userRole === 'admin'
        ? query(colRef)
        : query(colRef, where('published', '==', true));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as StudyPath);
      }
    } catch (err) {
      console.warn('Falling back to initial study paths:', err);
    }
    return INITIAL_STUDY_PATHS;
  }

  static async getKnowledgeGraph(): Promise<KnowledgeGraphData> {
    try {
      const snap = await getDoc(doc(db, 'knowledge_graphs', 'v1_main'));
      if (snap.exists()) {
        return snap.data() as KnowledgeGraphData;
      }
    } catch (err) {
      console.warn('Falling back to initial graph:', err);
    }
    return INITIAL_KNOWLEDGE_GRAPH;
  }

  // ==========================================
  // REAL-TIME LISTENERS
  // ==========================================
  static subscribeToIdeas(onUpdate: (ideas: Idea[]) => void, userRole: 'user' | 'admin' = 'user'): Unsubscribe {
    // When querying as a standard user or unauthenticated guest, Firestore rules require
    // that the query only requests documents with status == 'PUBLISHED'.
    // Requesting the entire collection without this filter causes permission-denied for non-admins.
    const colRef = collection(db, 'ideas');
    const q = userRole === 'admin'
      ? query(colRef)
      : query(colRef, where('status', '==', 'PUBLISHED'));

    return onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          onUpdate(userRole === 'admin' ? INITIAL_IDEAS : INITIAL_IDEAS.filter((i) => i.status === 'PUBLISHED'));
          return;
        }
        const list = snap.docs.map((d) => d.data() as Idea);
        onUpdate(list);
      },
      (err) => {
        console.warn('Real-time ideas subscription note (falling back to local cache):', err.message);
        // Fallback gracefully so the UI never crashes or breaks
        onUpdate(userRole === 'admin' ? INITIAL_IDEAS : INITIAL_IDEAS.filter((i) => i.status === 'PUBLISHED'));
      }
    );
  }

  // ==========================================
  // USER PRIVATE SUB-COLLECTIONS IN FIRESTORE:
  // /users/{userId}/saved_ideas
  // /users/{userId}/collections
  // /users/{userId}/notes
  // /users/{userId}/user_progress
  // ==========================================
  static subscribeToSavedIdeas(userId: string, onUpdate: (saved: SavedIdea[]) => void): Unsubscribe {
    if (!userId || userId === 'guest') {
      onUpdate(StorageService.getSavedIdeas());
      return () => {};
    }
    const subCol = collection(db, 'users', userId, 'saved_ideas');
    return onSnapshot(
      subCol,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as SavedIdea);
        onUpdate(list);
      },
      (err) => {
        console.warn('Real-time user subcollection saved_ideas note:', err.message);
        // Fallback to top-level collection or local storage
        const topQ = query(collection(db, 'saved_ideas'), where('userId', '==', userId));
        getDocs(topQ)
          .then((topSnap) => {
            if (!topSnap.empty) {
              onUpdate(topSnap.docs.map((d) => d.data() as SavedIdea));
            } else {
              onUpdate(StorageService.getSavedIdeas());
            }
          })
          .catch(() => {
            onUpdate(StorageService.getSavedIdeas());
          });
      }
    );
  }

  static async toggleSaveIdea(userId: string, ideaId: string): Promise<boolean> {
    if (!userId || userId === 'guest') {
      return StorageService.toggleSaveIdea(ideaId);
    }
    const saveDocId = `${userId}_${ideaId}`;
    const subRef = doc(db, 'users', userId, 'saved_ideas', ideaId);
    const topRef = doc(db, 'saved_ideas', saveDocId);

    try {
      const snap = await getDoc(subRef);
      if (snap.exists()) {
        await deleteDoc(subRef);
        try { await deleteDoc(topRef); } catch {}
        StorageService.toggleSaveIdea(ideaId);
        return false;
      } else {
        const newSave: SavedIdea = {
          id: saveDocId,
          userId,
          ideaId,
          savedAt: new Date().toISOString(),
        };
        await setDoc(subRef, newSave);
        try { await setDoc(topRef, newSave); } catch {}
        StorageService.toggleSaveIdea(ideaId);
        return true;
      }
    } catch {
      return StorageService.toggleSaveIdea(ideaId);
    }
  }

  static subscribeToCollections(userId: string, onUpdate: (cols: Collection[]) => void): Unsubscribe {
    if (!userId || userId === 'guest') {
      onUpdate(StorageService.getCollections());
      return () => {};
    }
    const subCol = collection(db, 'users', userId, 'collections');
    return onSnapshot(
      subCol,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as Collection);
        onUpdate(list.length ? list : StorageService.getCollections());
      },
      (err) => {
        console.warn('Real-time user subcollection collections note:', err.message);
        onUpdate(StorageService.getCollections());
      }
    );
  }

  static async saveCollection(userId: string, col: Partial<Omit<Collection, 'id' | 'userId'>> & { name: string; id?: string }): Promise<Collection> {
    const id = col.id || `col_${Date.now()}`;
    const newCol: Collection = {
      name: col.name,
      description: col.description || '',
      ideaIds: col.ideaIds || [],
      id,
      userId: userId || 'guest',
      createdAt: col.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!userId || userId === 'guest') {
      StorageService.createCollection(col.name, col.description || '');
      return newCol;
    }

    try {
      const subRef = doc(db, 'users', userId, 'collections', id);
      await setDoc(subRef, newCol);
      try { await setDoc(doc(db, 'collections', id), newCol); } catch {}
    } catch (e) {
      console.warn('Could not save to Firestore subcollection, saving locally:', e);
    }
    StorageService.createCollection(col.name, col.description || '');
    return newCol;
  }

  static async deleteCollection(userId: string, colId: string): Promise<void> {
    if (!userId || userId === 'guest') {
      StorageService.deleteCollection(colId);
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', userId, 'collections', colId));
      try { await deleteDoc(doc(db, 'collections', colId)); } catch {}
    } catch (e) {
      console.warn('Could not delete from Firestore subcollection:', e);
    }
    StorageService.deleteCollection(colId);
  }

  static subscribeToNotes(userId: string, onUpdate: (notes: Note[]) => void): Unsubscribe {
    if (!userId || userId === 'guest') {
      onUpdate(StorageService.getNotes());
      return () => {};
    }
    const subCol = collection(db, 'users', userId, 'notes');
    return onSnapshot(
      subCol,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as Note);
        onUpdate(list.length ? list : StorageService.getNotes());
      },
      (err) => {
        console.warn('Real-time user subcollection notes note:', err.message);
        onUpdate(StorageService.getNotes());
      }
    );
  }

  static async saveNote(
    userId: string,
    noteData: {
      id?: string;
      ideaId?: string;
      scriptureId?: string;
      referenceTitle: string;
      content: string;
    }
  ): Promise<Note> {
    const id = noteData.id || `note_${Date.now()}`;
    const newNote: Note = {
      ...noteData,
      id,
      userId: userId || 'guest',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!userId || userId === 'guest') {
      StorageService.saveNote(noteData);
      return newNote;
    }

    try {
      const subRef = doc(db, 'users', userId, 'notes', id);
      await setDoc(subRef, newNote);
      try { await setDoc(doc(db, 'notes', id), newNote); } catch {}
    } catch (e) {
      console.warn('Could not save note to Firestore subcollection:', e);
    }
    StorageService.saveNote(noteData);
    return newNote;
  }

  static async deleteNote(userId: string, noteId: string): Promise<void> {
    if (!userId || userId === 'guest') {
      StorageService.deleteNote(noteId);
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', userId, 'notes', noteId));
      try { await deleteDoc(doc(db, 'notes', noteId)); } catch {}
    } catch (e) {
      console.warn('Could not delete note from Firestore subcollection:', e);
    }
    StorageService.deleteNote(noteId);
  }

  static subscribeToUserProgress(userId: string, onUpdate: (progress: UserProgress[]) => void): Unsubscribe {
    if (!userId || userId === 'guest') {
      onUpdate(StorageService.getUserProgress());
      return () => {};
    }
    const subCol = collection(db, 'users', userId, 'user_progress');
    return onSnapshot(
      subCol,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as UserProgress);
        onUpdate(list.length ? list : StorageService.getUserProgress());
      },
      (err) => {
        console.warn('Real-time user subcollection user_progress note:', err.message);
        onUpdate(StorageService.getUserProgress());
      }
    );
  }

  static async completeLesson(userId: string, studyPathId: string, lessonId: string): Promise<void> {
    const progId = `${userId}_${studyPathId}_${lessonId}`;
    const prog: UserProgress = {
      id: progId,
      userId: userId || 'guest',
      studyPathId,
      lessonId,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
    };

    StorageService.markLessonComplete(studyPathId, lessonId);

    if (!userId || userId === 'guest') return;
    try {
      const subRef = doc(db, 'users', userId, 'user_progress', progId);
      await setDoc(subRef, prog);
      try { await setDoc(doc(db, 'user_progress', progId), prog); } catch {}
    } catch (e) {
      console.warn('Could not save progress to Firestore subcollection:', e);
    }
  }

  // ==========================================
  // ADMIN CMS OPERATIONS (PROTECTED BY FIRESTORE RULES)
  // ==========================================
  static async saveIdea(idea: Idea): Promise<void> {
    const id = idea.id || `idea-${Date.now()}`;
    const payload: Idea = {
      ...idea,
      id,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'ideas', id), payload);
  }

  static async deleteIdea(ideaId: string): Promise<void> {
    await deleteDoc(doc(db, 'ideas', ideaId));
  }

  static async saveScripture(sc: Scripture): Promise<void> {
    const id = sc.id || `sc-${Date.now()}`;
    await setDoc(doc(db, 'scriptures', id), { ...sc, id });
  }

  static async saveTopic(top: Topic): Promise<void> {
    const id = top.id || `top-${Date.now()}`;
    await setDoc(doc(db, 'topics', id), { ...top, id });
  }
}
