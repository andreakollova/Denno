import { DailyDigest, UserProfile, PersonaType } from '../types';

const TOPICS_KEY = 'ai_digest_topics';
const DIGESTS_KEY = 'ai_digest_history';
const PROFILE_KEY = 'ai_digest_profile';

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