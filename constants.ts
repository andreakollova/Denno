
import { Topic, PersonaType } from './types';

// Predefined list of topics with reliable RSS feeds
export const AVAILABLE_TOPICS: Topic[] = [
  // --- Kategória: Slovensko (Domáce dianie) ---
  {
    id: 'slovakia_news',
    name: 'Aktuality & Domáce dianie',
    category: 'Slovensko (Domáce dianie)',
    rssUrls: [
      'https://www.aktuality.sk/rss/',
      'https://domov.sme.sk/rss/rss.xml',
      'https://dennikn.sk/feed/'
    ]
  },
  {
    id: 'slovakia_economy',
    name: 'Slovenská Ekonomika & Biznis',
    category: 'Slovensko (Domáce dianie)',
    rssUrls: [
      'https://index.sme.sk/rss/rss.xml',
      'https://www.trend.sk/rss/vsetko'
    ]
  },

  // --- Kategória: AI & Tech Core ---
  {
    id: 'new_ai_models',
    name: 'Nové AI Modely (SOTA)',
    category: 'AI & Tech Core',
    rssUrls: [
      'https://huggingface.co/blog/feed.xml',
      'https://simonwillison.net/atom/ab/', // Good aggregator for LLM releases
      'https://openai.com/blog/rss.xml'
    ]
  },
  {
    id: 'ai_tech',
    name: 'Všeobecné AI & Tech',
    category: 'AI & Tech Core',
    rssUrls: [
      'https://techcrunch.com/category/artificial-intelligence/feed/',
      'https://www.theverge.com/rss/index.xml'
    ]
  },
  {
    id: 'quantum',
    name: 'Kvantové počítanie',
    category: 'AI & Tech Core',
    rssUrls: [
      'https://thequantuminsider.com/feed/',
      'https://www.sciencedaily.com/rss/computers_math/quantum_computers.xml'
    ]
  },
  {
    id: 'ar_vr',
    name: 'AR/VR & Spatial Computing',
    category: 'AI & Tech Core',
    rssUrls: [
      'https://uploadvr.com/feed',
      'https://www.roadtovr.com/feed/'
    ]
  },
  {
    id: 'robotics',
    name: 'Robotika',
    category: 'AI & Tech Core',
    rssUrls: [
      'https://spectrum.ieee.org/rss/robotics/fulltext',
      'https://www.sciencedaily.com/rss/computers_math/robotics.xml'
    ]
  },
  {
    id: 'cybersecurity',
    name: 'Kybernetická bezpečnosť',
    category: 'AI & Tech Core',
    rssUrls: [
      'https://krebsonsecurity.com/feed/',
      'https://thehackernews.com/rss.xml'
    ]
  },
  {
    id: 'consumer_tech',
    name: 'Spotrebná elektronika',
    category: 'AI & Tech Core',
    rssUrls: [
      'https://www.engadget.com/rss.xml',
      'https://www.wired.com/feed/category/gear/latest/rss'
    ]
  },
  {
    id: 'smart_home',
    name: 'Smart Home & IoT',
    category: 'AI & Tech Core',
    rssUrls: [
      'https://staceyoniot.com/feed/',
      'https://www.iotworldtoday.com/rss.xml'
    ]
  },

  // --- Kategória: Biznis & Ekonomika ---
  {
    id: 'business_startups',
    name: 'Biznis & Startupy',
    category: 'Biznis & Práca',
    rssUrls: [
      'https://feeds.feedburner.com/entrepreneur/latest',
      'http://feeds.feedburner.com/TechCrunch/startups'
    ]
  },
  {
    id: 'economy',
    name: 'Ekonomika & Trhy',
    category: 'Biznis & Práca',
    rssUrls: [
      'https://www.economist.com/finance-and-economics/rss.xml',
      'https://feeds.bloomberg.com/economics/news.xml'
    ]
  },
  {
    id: 'investing',
    name: 'Osobné financie & Investovanie',
    category: 'Biznis & Práca',
    rssUrls: [
      'https://www.kiplinger.com/feed',
      'https://www.investopedia.com/feedbuilder/feed/public/reviews_feed' // Often general financial news
    ]
  },
  {
    id: 'creator_economy',
    name: 'Creator Economy',
    category: 'Biznis & Práca',
    rssUrls: [
      'https://techcrunch.com/tag/creator-economy/feed/',
      'https://www.theinformation.com/rss/creator-economy.xml'
    ]
  },
  {
    id: 'future_work',
    name: 'Budúcnosť práce (Remote/Auto)',
    category: 'Biznis & Práca',
    rssUrls: [
      'https://www.forbes.com/leadership/feed/',
      'https://workplaceinsight.net/feed/'
    ]
  },
  {
    id: 'productivity',
    name: 'Produktivita & Work Trends',
    category: 'Biznis & Práca',
    rssUrls: [
      'https://lifehacker.com/rss',
      'https://zenhabits.net/feed/'
    ]
  },
  {
    id: 'hr_leadership',
    name: 'HR & Leadership',
    category: 'Biznis & Práca',
    rssUrls: [
      'https://hbr.org/feeds/rss',
      'https://www.shrm.org/feed'
    ]
  },
  {
    id: 'real_estate',
    name: 'Reality & Smart Cities',
    category: 'Biznis & Práca',
    rssUrls: [
      'https://www.smartcitiesworld.net/rss/news',
      'https://www.inman.com/feed/'
    ]
  },

  // --- Kategória: Spoločnosť & Politika ---
  {
    id: 'politics',
    name: 'Globálna politika',
    category: 'Spoločnosť',
    rssUrls: [
      'https://feeds.bbci.co.uk/news/world/rss.xml',
      'https://www.politico.eu/feed/'
    ]
  },
  {
    id: 'eu_regulation',
    name: 'EU Tech Regulácie',
    category: 'Spoločnosť',
    rssUrls: [
      'https://eur-lex.europa.eu/RSS/feed.xml', // Fallback, usually handled by general tech policy news
      'https://techcrunch.com/tag/europe/feed/'
    ]
  },
  {
    id: 'culture_media',
    name: 'Kultúra & Médiá',
    category: 'Spoločnosť',
    rssUrls: [
      'https://www.theguardian.com/culture/rss',
      'https://www.niemanlab.org/feed/'
    ]
  },
  {
    id: 'education',
    name: 'Vzdelávanie & Learning',
    category: 'Spoločnosť',
    rssUrls: [
      'https://www.edutopia.org/feeds/latest',
      'https://thejournal.com/rss-feeds/news.aspx'
    ]
  },

  // --- Kategória: Veda & Budúcnosť ---
  {
    id: 'science',
    name: 'Veda & Inovácie',
    category: 'Veda & Budúcnosť',
    rssUrls: [
      'https://www.sciencedaily.com/rss/top_news.xml',
      'https://www.wired.com/feed/category/science/latest/rss'
    ]
  },
  {
    id: 'space',
    name: 'Vesmír & Letectvo',
    category: 'Veda & Budúcnosť',
    rssUrls: [
      'https://www.space.com/feeds/all',
      'https://spacenews.com/feed/'
    ]
  },
  {
    id: 'renewable_energy',
    name: 'Obnoviteľné zdroje',
    category: 'Veda & Budúcnosť',
    rssUrls: [
      'https://cleantechnica.com/feed/',
      'https://www.renewableenergyworld.com/feed/'
    ]
  },
  {
    id: 'food_tech',
    name: 'Food Tech',
    category: 'Veda & Budúcnosť',
    rssUrls: [
      'https://thespoon.tech/feed/',
      'https://www.foodnavigator.com/RSS/Feed/LN/Daily-News'
    ]
  },

  // --- Kategória: Lifestyle & Zdravie ---
  {
    id: 'health_longevity',
    name: 'Zdravie & Dlhovekosť',
    category: 'Lifestyle',
    rssUrls: [
      'https://www.medicalnewstoday.com/feed',
      'https://peterattiamd.com/feed/'
    ]
  },
  {
    id: 'mental_health',
    name: 'Duševné zdravie',
    category: 'Lifestyle',
    rssUrls: [
      'https://www.psychologytoday.com/us/feed/news',
      'https://psychcentral.com/feed'
    ]
  },
  {
    id: 'psychology',
    name: 'Psychológia & Rozhodovanie',
    category: 'Lifestyle',
    rssUrls: [
      'https://fs.blog/feed/', // Farnam Street
      'https://www.behavioraleconomics.com/feed/'
    ]
  },
  {
    id: 'fitness',
    name: 'Fitness & Výživa',
    category: 'Lifestyle',
    rssUrls: [
      'https://www.healthline.com/nutrition/rss.xml',
      'https://breakingmuscle.com/feed/'
    ]
  },
  {
    id: 'parenting',
    name: 'Rodičovstvo & Rodinné Tech',
    category: 'Lifestyle',
    rssUrls: [
      'https://www.todaysparent.com/feed/',
      'https://coolmompicks.com/feed/' // Tech for parents
    ]
  },
  {
    id: 'travel',
    name: 'Cestovanie & Hospitality',
    category: 'Lifestyle',
    rssUrls: [
      'https://skift.com/feed/',
      'https://www.travelandleisure.com/feed/daily'
    ]
  },
  {
    id: 'fashion',
    name: 'Móda & Luxus',
    category: 'Lifestyle',
    rssUrls: [
      'https://www.businessoffashion.com/feeds/news-analysis',
      'https://www.vogue.com/feed/rss'
    ]
  },

  // --- Kategória: Zábava & Šport ---
  {
    id: 'f1_motorsport',
    name: 'F1 & Motoršport',
    category: 'Zábava & Šport',
    rssUrls: [
      'https://www.autosport.com/rss/feed/f1',
      'https://www.motorsport.com/rss/f1/news/'
    ]
  },
  {
    id: 'sports_biz',
    name: 'Športový Biznis & Tech',
    category: 'Zábava & Šport',
    rssUrls: [
      'https://www.sportspromedia.com/feed/',
      'https://frontofficesports.com/feed/'
    ]
  },
  {
    id: 'womens_sports',
    name: 'Ženský šport',
    category: 'Zábava & Šport',
    rssUrls: [
      'https://justwomenssports.com/feed/',
      'https://feeds.theguardian.com/theguardian/sport/womens-sport/rss'
    ]
  },
  {
    id: 'gaming',
    name: 'Gaming & E-športy',
    category: 'Zábava & Šport',
    rssUrls: [
      'https://kotaku.com/rss',
      'https://www.polygon.com/rss/index.xml'
    ]
  }
];

// Instructions for the AI (kept in English for better performance)
export const PERSONA_PROMPTS: Record<PersonaType, string> = {
  [PersonaType.DEFAULT]: "Keep the tone professional, concise, yet engaging. Focus on clarity.",
  [PersonaType.CEO]: "Act as a busy CEO executive. Focus on business impact, ROI, market shifts, and strategic implications. Be extremely concise. Cut the fluff.",
  [PersonaType.ELI5]: "Explain like I am 5 years old. Use simple analogies. Avoid complex jargon. Focus on the basic 'what' and 'why'. be fun.",
  [PersonaType.NERD]: "Act as a technical expert. Go deep into the specifications, methodology, and technical details. Do not simplify technical terms."
};

// UI Descriptions for the User (Translated to Slovak)
export const PERSONA_UI_DATA: Record<PersonaType, { label: string, description: string }> = {
  [PersonaType.DEFAULT]: {
    label: "Vyvážený (Default)",
    description: "Profesionálny, stručný a jasný prehľad dňa."
  },
  [PersonaType.CEO]: {
    label: "CEO / Biznis",
    description: "Zamerané na ROI, trhové dopady a stratégiu. Žiadna omáčka, len fakty."
  },
  [PersonaType.ELI5]: {
    label: "Vysvetli ako 5-ročnému",
    description: "Jednoduché analógie, žiadny odborný žargón. Hravé a pochopiteľné pre každého."
  },
  [PersonaType.NERD]: {
    label: "Technický Expert",
    description: "Hlboký ponor do technických detailov, špecifikácií a metodológie."
  }
};

export const getSystemInstruction = (persona: PersonaType) => `
You are a highly skilled personal news editor fluent in Slovak.
Your goal is to process a list of article titles and summaries and create a structured daily digest.
The output MUST be in valid JSON format.
The language of the output content MUST be Slovak.

Style Guide: ${PERSONA_PROMPTS[persona]}

Structure your response to match this JSON schema:
{
  "mainTitle": "string (A catchy title for today's digest)",
  "oneSentenceOverview": "string (The single most important sentence summarizing the day)",
  "busyRead": [
    { "title": "string", "summary": "string (1 sentence)" }
  ],
  "sections": [
    {
      "title": "string (Section header)",
      "whatIsNew": "string (What actually happened)",
      "whatChanged": "string (How is this different from before or what changed)",
      "keyPoints": ["string", "string", "string", "string", "string"] (Exactly 5 bullet points summarizing the whole event),
      "tags": ["string", "string"] (Max 2 tags. IMPORTANT: Each tag MUST be a single word. E.g. "Biznis", "AI". No multi-word tags.)
    }
  ]
}

Guidelines:
- "busyRead" must contain exactly the 3 most important stories.
- Group related articles into 5 to 8 distinct sections.
- CAPITALIZATION RULE: All titles (mainTitle, section titles, busyRead titles) MUST be in Slovak sentence case. Only the first letter and proper nouns should be capitalized. Do NOT use English Title Case.
  - Correct: "Nová legislatíva EÚ ovplyvní trh"
  - Incorrect: "Nová Legislatíva EÚ Ovplyvní Trh"
- Do not include 'Article 1' text.
- STRICTLY RESPECT SOURCE CONTEXT: If articles come from a specific source category (e.g. Women's Sports), ensure the digest reflects that specific context. Do not mix unrelated topics.
`;
