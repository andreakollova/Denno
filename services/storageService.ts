
import { DailyDigest, UserProfile, PersonaType, SavedInsight, DigestSection, UserNote, NotificationFrequency, SubscriptionStatus, SubscriptionPlan } from '../types';

const TOPICS_KEY = 'ai_digest_topics';
const DIGESTS_KEY = 'ai_digest_history';
const PROFILE_KEY = 'ai_digest_profile';
const COLLECTION_KEY = 'ai_digest_collection';
const NOTES_KEY = 'ai_digest_notes';
const SECRET_CODE = 'AK2026'; // The code to unlock lifetime access

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

// --- USER PROFILE & SUBSCRIPTION ---

export const getUserProfile = (): UserProfile => {
  const stored = localStorage.getItem(PROFILE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Backward compatibility & Safety checks
    if (!parsed.theme || (parsed.theme !== 'light' && parsed.theme !== 'dark')) {
        parsed.theme = 'light'; 
    }
    if (!parsed.notificationFrequency) parsed.notificationFrequency = NotificationFrequency.DAILY;
    
    // Initialize Subscription if missing
    if (!parsed.subscriptionStatus) {
        parsed.subscriptionStatus = SubscriptionStatus.TRIAL;
        parsed.subscriptionPlan = SubscriptionPlan.NONE;
        parsed.trialStartDate = Date.now();
    }
    
    return parsed;
  }
  return {
    streak: 0,
    lastVisit: '',
    totalDigests: 0,
    selectedPersona: PersonaType.DEFAULT,
    city: 'Bratislava',
    theme: 'light',
    notificationFrequency: NotificationFrequency.DAILY,
    lastNotification: 0,
    // New Subscription Defaults
    subscriptionStatus: SubscriptionStatus.TRIAL,
    subscriptionPlan: SubscriptionPlan.NONE,
    trialStartDate: Date.now()
  };
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

// Check if user has access
export const checkSubscriptionAccess = (): boolean => {
    const profile = getUserProfile();
    
    if (profile.subscriptionStatus === SubscriptionStatus.LIFETIME) return true;
    if (profile.subscriptionStatus === SubscriptionStatus.ACTIVE) {
        // Check expiry if we were implementing real dates
        // For now, active is active.
        return true;
    }

    if (profile.subscriptionStatus === SubscriptionStatus.TRIAL) {
        const now = Date.now();
        const trialLength = 7 * 24 * 60 * 60 * 1000; // 7 days
        const diff = now - profile.trialStartDate;
        
        if (diff > trialLength) {
            // Trial Expired
            const updated = { ...profile, subscriptionStatus: SubscriptionStatus.EXPIRED };
            saveUserProfile(updated);
            return false;
        }
        return true;
    }

    return false; // Expired
};

// Activate plan (Mock payment success)
export const activateSubscription = (plan: SubscriptionPlan) => {
    const profile = getUserProfile();
    saveUserProfile({
        ...profile,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionPlan: plan,
        subscriptionExpiryDate: Date.now() + (plan === SubscriptionPlan.YEARLY ? 31536000000 : 2592000000)
    });
};

// Unlock via Secret Code
export const redeemSecretCode = (code: string): boolean => {
    if (code.trim() === SECRET_CODE) {
        const profile = getUserProfile();
        saveUserProfile({
            ...profile,
            subscriptionStatus: SubscriptionStatus.LIFETIME,
            subscriptionPlan: SubscriptionPlan.NONE
        });
        return true;
    }
    return false;
};


export const updateStreak = () => {
  const profile = getUserProfile();
  const today = new Date().toISOString().split('T')[0];
  
  if (profile.lastVisit === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = profile.streak;

  if (profile.lastVisit === yesterdayStr) {
    newStreak += 1;
  } else {
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

export const toggleTheme = () => {
  const profile = getUserProfile();
  const newTheme = profile.theme === 'dark' ? 'light' : 'dark';
  saveUserProfile({ ...profile, theme: newTheme });
  return newTheme;
};

export const updateLastNotification = () => {
  const profile = getUserProfile();
  saveUserProfile({ ...profile, lastNotification: Date.now() });
};
