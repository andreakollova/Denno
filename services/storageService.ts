
import { DailyDigest, UserProfile, PersonaType, SavedInsight, DigestSection, UserNote } from '../types';

const TOPICS_KEY = 'ai_digest_topics';
const DIGESTS_KEY = 'ai_digest_history';
const PROFILE_KEY = 'ai_digest_profile';
const COLLECTION_KEY = 'ai_digest_collection';
const NOTES_KEY = 'ai_digest_notes';

export const getSelectedTopicIds = (): string[] => {
  const stored = localStorage.getItem(TOPICS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveSelectedTopicIds = (ids: string[]) => {
  localStorage.setItem(TOPICS_KEY, JSON.stringify(ids));
};

export const getDigests = (): DailyDigest[] => {
  const stored = localStorage.getItem(DIGESTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveDigest = (digest: DailyDigest) => {
  const current = getDigests();
  const existsIndex = current.findIndex(d => d.id === digest.id);
  
  if (existsIndex >= 0) {
    current[existsIndex] = digest;
  } else {
    current.unshift(digest);
    updateStreak(); // Update streak when saving a new digest
  }
  
  localStorage.setItem(DIGESTS_KEY, JSON.stringify(current));
};

export const deleteDigest = (id: string) => {
  const current = getDigests();
  const updated = current.filter(d => d.id !== id);
  localStorage.setItem(DIGESTS_KEY, JSON.stringify(updated));
};

export const getDigestById = (id: string): DailyDigest | undefined => {
  const digests = getDigests();
  return digests.find(d => d.id === id);
};

// --- SAVED COLLECTION (INSIGHTS) ---

export const getSavedInsights = (): SavedInsight[] => {
  const stored = localStorage.getItem(COLLECTION_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveInsight = (section: DigestSection, sourceDigestId: string, sourceDigestDate: string) => {
  const current = getSavedInsights();
  // Unique ID based on title + date
  const id = `${sourceDigestId}-${section.title.substring(0, 10).replace(/\s+/g, '')}`;
  
  // Avoid duplicates
  if (current.some(i => i.id === id)) return;

  const newInsight: SavedInsight = {
    id,
    section,
    savedAt: Date.now(),
    sourceDigestId,
    sourceDigestDate
  };

  localStorage.setItem(COLLECTION_KEY, JSON.stringify([newInsight, ...current]));
};

export const removeInsight = (id: string) => {
  const current = getSavedInsights();
  const updated = current.filter(i => i.id !== id);
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(updated));
};

export const isInsightSaved = (sectionTitle: string, sourceDigestId: string): boolean => {
  const current = getSavedInsights();
  const id = `${sourceDigestId}-${sectionTitle.substring(0, 10).replace(/\s+/g, '')}`;
  return current.some(i => i.id === id);
};

// --- USER NOTES (MYŠLIENKY) ---

export const getNotes = (): UserNote[] => {
  const stored = localStorage.getItem(NOTES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveNote = (text: string) => {
  const current = getNotes();
  const newNote: UserNote = {
    id: Date.now().toString(),
    text,
    createdAt: Date.now()
  };
  localStorage.setItem(NOTES_KEY, JSON.stringify([newNote, ...current]));
};

export const deleteNote = (id: string) => {
  const current = getNotes();
  const updated = current.filter(n => n.id !== id);
  localStorage.setItem(NOTES_KEY, JSON.stringify(updated));
};

// --- USER PROFILE ---

export const getUserProfile = (): UserProfile => {
  const stored = localStorage.getItem(PROFILE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    streak: 0,
    lastVisit: '',
    totalDigests: 0,
    selectedPersona: PersonaType.DEFAULT,
    city: 'Bratislava'
  };
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const updateStreak = () => {
  const profile = getUserProfile();
  const today = new Date().toISOString().split('T')[0];
  
  // If already generated today, don't update stats again
  if (profile.lastVisit === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = profile.streak;

  if (profile.lastVisit === yesterdayStr) {
    newStreak += 1;
  } else {
    // Reset streak if missed a day (unless it's the very first time)
    newStreak = profile.lastVisit ? 1 : 1;
  }

  saveUserProfile({
    ...profile,
    streak: newStreak,
    lastVisit: today,
    totalDigests: profile.totalDigests + 1
  });
};

export const setPersona = (persona: PersonaType) => {
  const profile = getUserProfile();
  saveUserProfile({ ...profile, selectedPersona: persona });
};
