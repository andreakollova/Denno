
export interface Article {
  title: string;
  summary: string;
  link: string;
  published: string; // ISO date string
  source: string;
  imageUrl?: string;
}

export interface DigestSection {
  title: string;
  whatIsNew: string;
  whatChanged: string;
  whatToWatch: string;
  tags: string[];
  sourceTitle?: string; // Kept for backward compatibility if needed
  sourceLink?: string; // New: Unique identifier for exact matching
}

export interface BusyItem {
  title: string;
  summary: string;
}

export interface DailyDigest {
  id: string; // usually YYYY-MM-DD
  date: string; // ISO date string
  mainTitle: string;
  oneSentenceOverview: string; // Feature 7
  busyRead: BusyItem[]; // Feature 8
  sections: DigestSection[]; // Feature 9
  sourceArticles: Article[]; // New: Store articles to allow generating more
  createdAt: number;
  personaUsed: string;
}

export interface Topic {
  id: string;
  name: string;
  rssUrls: string[];
  category: string;
}

export interface UserProfile {
  streak: number;
  lastVisit: string;
  totalDigests: number;
  selectedPersona: PersonaType;
  city?: string;
}

export interface LearningPack {
  topic: string;
  definition: string;
  history: string;
  keyConcepts: string[];
  futureOutlook: string;
  quizQuestion: string;
}

export enum PersonaType {
  DEFAULT = 'default',
  CEO = 'ceo',
  ELI5 = 'eli5',
  NERD = 'nerd'
}

export enum AppTab {
  DIGEST = 'digest',
  HISTORY = 'history',
  TOOLS = 'tools',
  SETTINGS = 'settings'
}