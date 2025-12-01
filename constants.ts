
import { Topic, PersonaType } from './types';

// Predefined list of topics with reliable RSS feeds
export const AVAILABLE_TOPICS: Topic[] = [
  // --- Kategória: Slovensko ---
  {
    id: 'slovakia_domestic',
    name: 'Slovenské spravodajstvo',
    category: 'Slovensko',
    rssUrls: [
      'https://www.aktuality.sk/rss/domace/',
      'https://domov.sme.sk/rss/rss.xml',
      'https://dennikn.sk/slovensko/feed'
    ]
  },
  {
    id: 'slovakia_world',
    name: 'Aktuality zo sveta',
    category: 'Slovensko',
    rssUrls: [
      'https://www.aktuality.sk/rss/zahranicne/',
      'https://svet.sme.sk/rss/rss.xml',
      'https://dennikn.sk/svet/feed'
    ]
  },
  {
    id: 'slovakia_economy',
    name: 'Slovenská ekonomika a biznis',
    category: 'Slovensko',
    rssUrls: [
      'https://index.sme.sk/rss/rss.xml',
      'https://www.trend.sk/rss/vsetko',
      'https://www.aktuality.sk/rss/ekonomika/'
    ]
  },

  // --- Kategória: Veda a budúcnosť ---
  {
    id: 'medicine',
    name: 'Medicína',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://www.nature.com/nature.rss',
      'https://rss.sciencedaily.com/health_medicine.xml',
      'https://www.nih.gov/news-events/feed.xml',
      'https://www.medicalnewstoday.com/feed',
      'https://rss.medicalxpress.com/medical-news.xml'
    ]
  },
  {
    id: 'new_ai_models',
    name: 'Nové AI modely (SOTA)',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://huggingface.co/blog/feed.xml',
      'https://simonwillison.net/atom/ab/',
      'https://openai.com/blog/rss.xml'
    ]
  },
  {
    id: 'science',
    name: 'Veda a inovácie',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://www.science.org/rss/news_current.xml',
      'https://www.sciencedaily.com/rss/top_news.xml',
      'https://www.wired.com/feed/category/science/latest/rss',
      'https://www.nature.com/nature.rss',
      'https://www.newscientist.com/feed/home/',
      'https://phys.org/rss-feed/',
      'https://feeds.arstechnica.com/arstechnica/science'
    ]
  },
  {
    id: 'quantum',
    name: 'Kvantové počítanie',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://thequantuminsider.com/feed/',
      'https://www.sciencedaily.com/rss/computers_math/quantum_computers.xml'
    ]
  },
  {
    id: 'ar_vr',
    name: 'AR/VR a spatial computing',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://uploadvr.com/feed',
      'https://www.roadtovr.com/feed/'
    ]
  },
  {
    id: 'robotics',
    name: 'Robotika',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://spectrum.ieee.org/rss/robotics/fulltext',
      'https://www.sciencedaily.com/rss/computers_math/robotics.xml'
    ]
  },
  {
    id: 'space',
    name: 'Vesmír a letectvo',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://www.space.com/feeds/all',
      'https://spacenews.com/feed/'
    ]
  },
  {
    id: 'renewable_energy',
    name: 'Obnoviteľné zdroje a energetika',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://cleantechnica.com/feed/',
      'https://www.renewableenergyworld.com/feed/',
      'https://www.power-technology.com/feed/'
    ]
  },
  {
    id: 'food_tech',
    name: 'Food tech',
    category: 'Veda a budúcnosť',
    rssUrls: [
      'https://thespoon.tech/feed/',
      'https://www.foodnavigator.com/RSS/Feed/LN/Daily-News'
    ]
  },

  // --- Kategória: Šport a zábava ---
  {
    id: 'sport_repre',
    name: 'Slovenská reprezentácia',
    category: 'Šport a zábava',
    rssUrls: [
      'https://sport.aktuality.sk/rss/reprezentacia/',
      'https://sport.sme.sk/rss/rss.xml'
    ]
  },
  {
    id: 'sport_football',
    name: 'Futbal',
    category: 'Šport a zábava',
    rssUrls: [
      'https://sport.aktuality.sk/rss/futbal/',
      'https://www.goal.com/feeds/en/news',
      'https://www.skysports.com/rss/12040'
    ]
  },
  {
    id: 'sport_hockey',
    name: 'Hokej',
    category: 'Šport a zábava',
    rssUrls: [
      'https://sport.aktuality.sk/rss/hokej/',
      'https://www.nhl.com/rss/news',
      'https://www.tsn.ca/rss/nhl'
    ]
  },
  {
    id: 'sport_field_hockey',
    name: 'Pozemný hokej',
    category: 'Šport a zábava',
    rssUrls: [
      'https://www.thehockeypaper.co.uk/feed',
      'https://fieldhockey.com/index.php?format=feed&type=rss'
    ]
  },
  {
    id: 'sport_basketball',
    name: 'Basketbal',
    category: 'Šport a zábava',
    rssUrls: [
      'https://www.nba.com/rss/nba_rss.xml',
      'https://www.eurohoops.net/feed/',
      'https://www.espn.com/espn/rss/nba/news'
    ]
  },
  {
    id: 'f1_motorsport',
    name: 'F1 a motoršport',
    category: 'Šport a zábava',
    rssUrls: [
      'https://www.autosport.com/rss/feed/f1',
      'https://www.motorsport.com/rss/f1/news/'
    ]
  },
  {
    id: 'gaming',
    name: 'Gaming a e-športy',
    category: 'Šport a zábava',
    rssUrls: [
      'https://kotaku.com/rss',
      'https://www.polygon.com/rss/index.xml',
      'https://www.ign.com/rss/articles/feed'
    ]
  },
  {
    id: 'womens_sports',
    name: 'Ženy v športe',
    category: 'Šport a zábava',
    rssUrls: [
      'https://justwomenssports.com/feed/',
      'https://feeds.theguardian.com/theguardian/sport/womens-sport/rss'
    ]
  },
  {
    id: 'sports_marketing',
    name: 'Športový marketing',
    category: 'Šport a zábava',
    rssUrls: [
      'https://www.sportspromedia.com/feed/',
      'https://sbcnews.co.uk/category/marketing/feed/'
    ]
  },
  // MOVED TO LAST PLACE IN CATEGORY
  {
    id: 'sports_biz',
    name: 'Športový biznis a tech',
    category: 'Šport a zábava',
    rssUrls: [
      'https://frontofficesports.com/feed/',
      'https://www.sporttechie.com/feed/'
    ]
  },

  // --- Kategória: Ostatné (Tech, Biznis, Lifestyle) ---
  {
    id: 'ai_tech',
    name: 'Všeobecné AI a tech',
    category: 'AI a tech core',
    rssUrls: [
      'https://techcrunch.com/category/artificial-intelligence/feed/',
      'https://www.theverge.com/rss/index.xml'
    ]
  },
  {
    id: 'ui_ux_design',
    name: 'UI/UX a kreatívny dizajn',
    category: 'AI a tech core',
    rssUrls: [
      'https://uxdesign.cc/feed',
      'https://www.smashingmagazine.com/categories/ux-design/index.xml',
      'https://sidebar.io/feed.xml'
    ]
  },
  {
    id: 'cybersecurity',
    name: 'Kybernetická bezpečnosť',
    category: 'AI a tech core',
    rssUrls: [
      'https://krebsonsecurity.com/feed/',
      'https://thehackernews.com/rss.xml'
    ]
  },
  {
    id: 'consumer_tech',
    name: 'Spotrebná elektronika',
    category: 'AI a tech core',
    rssUrls: [
      'https://www.engadget.com/rss.xml',
      'https://www.wired.com/feed/category/gear/latest/rss'
    ]
  },
  {
    id: 'smart_home',
    name: 'Smart home a IoT',
    category: 'AI a tech core',
    rssUrls: [
      'https://staceyoniot.com/feed/',
      'https://www.iotworldtoday.com/rss.xml'
    ]
  },
  {
    id: 'business_startups',
    name: 'Biznis a startupy',
    category: 'Biznis a práca',
    rssUrls: [
      'https://feeds.feedburner.com/entrepreneur/latest',
      'http://feeds.feedburner.com/TechCrunch/startups'
    ]
  },
  {
    id: 'deals_acquisitions',
    name: 'Fúzie, akvizície a dealy',
    category: 'Biznis a práca',
    rssUrls: [
      'https://techcrunch.com/tag/mergers-and-acquisitions/feed/',
      'https://www.pehub.com/feed/'
    ]
  },
  {
    id: 'economy',
    name: 'Ekonomika a trhy',
    category: 'Biznis a práca',
    rssUrls: [
      'https://www.economist.com/finance-and-economics/rss.xml',
      'https://feeds.bloomberg.com/economics/news.xml'
    ]
  },
  {
    id: 'investing',
    name: 'Osobné financie a investovanie',
    category: 'Biznis a práca',
    rssUrls: [
      'https://www.kiplinger.com/feed',
      'https://www.investopedia.com/feedbuilder/feed/public/reviews_feed'
    ]
  },
  {
    id: 'creator_economy',
    name: 'Creator economy',
    category: 'Biznis a práca',
    rssUrls: [
      'https://techcrunch.com/tag/creator-economy/feed/',
      'https://www.theinformation.com/rss/creator-economy.xml'
    ]
  },
  {
    id: 'productivity',
    name: 'Produktivita a work trends',
    category: 'Biznis a práca',
    rssUrls: [
      'https://lifehacker.com/rss',
      'https://zenhabits.net/feed/'
    ]
  },
  {
    id: 'hr_leadership',
    name: 'HR a leadership',
    category: 'Biznis a práca',
    rssUrls: [
      'https://hbr.org/feeds/rss',
      'https://www.shrm.org/feed'
    ]
  },
  {
    id: 'real_estate',
    name: 'Reality a smart cities',
    category: 'Biznis a práca',
    rssUrls: [
      'https://www.smartcitiesworld.net/rss/news',
      'https://www.inman.com/feed/'
    ]
  },
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
    name: 'EÚ tech regulácie',
    category: 'Spoločnosť',
    rssUrls: [
      'https://eur-lex.europa.eu/RSS/feed.xml',
      'https://techcrunch.com/tag/europe/feed/'
    ]
  },
  {
    id: 'culture_media',
    name: 'Kultúra a médiá',
    category: 'Spoločnosť',
    rssUrls: [
      'https://www.theguardian.com/culture/rss',
      'https://www.niemanlab.org/feed/'
    ]
  },
  {
    id: 'education',
    name: 'Vzdelávanie a e-learning',
    category: 'Spoločnosť',
    rssUrls: [
      'https://www.edutopia.org/feeds/latest',
      'https://thejournal.com/rss-feeds/news.aspx'
    ]
  },
  {
    id: 'health_longevity',
    name: 'Zdravie a dlhovekosť',
    category: 'Lifestyle',
    rssUrls: [
      'https://peterattiamd.com/feed/',
      'https://www.nia.nih.gov/news/rss',
      'https://www.nature.com/nature.rss'
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
    name: 'Psychológia a rozhodovanie',
    category: 'Lifestyle',
    rssUrls: [
      'https://fs.blog/feed/',
      'https://www.behavioraleconomics.com/feed/'
    ]
  },
  {
    id: 'fitness',
    name: 'Fitness a výživa',
    category: 'Lifestyle',
    rssUrls: [
      'https://www.healthline.com/nutrition/rss.xml',
      'https://breakingmuscle.com/feed/'
    ]
  },
  {
    id: 'parenting',
    name: 'Rodičovstvo a rodinné tech',
    category: 'Lifestyle',
    rssUrls: [
      'https://www.todaysparent.com/feed/',
      'https://coolmompicks.com/feed/'
    ]
  },
  {
    id: 'travel',
    name: 'Cestovanie a hospitality',
    category: 'Lifestyle',
    rssUrls: [
      'https://skift.com/feed/',
      'https://www.travelandleisure.com/feed/daily'
    ]
  },
  {
    id: 'music_lifestyle',
    name: 'Hudba',
    category: 'Lifestyle',
    rssUrls: [
      'https://www.rollingstone.com/music/music-news/feed/',
      'https://pitchfork.com/feed/feed-news/rss',
      'https://www.billboard.com/feed/'
    ]
  },
  {
    id: 'fashion',
    name: 'Móda a luxus',
    category: 'Lifestyle',
    rssUrls: [
      'https://www.businessoffashion.com/feeds/news-analysis',
      'https://www.vogue.com/feed/rss'
    ]
  }
];

export const CATEGORY_EMOJIS: Record<string, string> = {
    // Specific Topics
    'Futbal': '⚽',
    'Hokej': '🏒',
    'Pozemný hokej': '🏑',
    'Basketbal': '🏀',
    'F1': '🏎️',
    'Gaming': '🎮',
    'Športový marketing': '📢',
    'Medicína': '🩺',
    'Vesmír': '🚀',
    'Robotika': '🤖',
    'UI/UX': '🎨',
    'Peniaze': '💰',
    'Dealy': '🤝',
    'Krypto': '⛓️',
    'Jedlo': '🍔',
    'Móda': '👗',
    'Hudba': '🎵',
    'Cestovanie': '✈️',
    'Ekológia': '🌱',
    'Umenie': '🎨',
    'Kontroverzia': '🔥',

    // General Categories
    'Slovensko': '🇸🇰',
    'Veda a budúcnosť': '🧬',
    'Šport a zábava': '🏅',
    'AI a tech core': '🤖',
    'Biznis a práca': '💼',
    'Spoločnosť': '🌍',
    'Lifestyle': '🧘'
};

// Map tags to emojis for better visual cue
export const getTagEmoji = (tag: string): string => {
   // This helper is kept for reference or other uses
   return '🔹';
};

export const getCategoryForTags = (tags: string[]): string => {
    // Logic to determine the badge emoji/name based on the tags
    for (const tag of tags) {
        const t = tag.toLowerCase();

        // Check for Controversy FIRST
        if (t.includes('kontroverzia') || t.includes('controversy') || t.includes('škandál') || t.includes('konflikt')) return 'Kontroverzia';

        // Specific Sport Checks
        if (t.includes('marketing') && t.includes('šport')) return 'Športový marketing';
        if (t.includes('pozemný') && t.includes('hokej')) return 'Pozemný hokej';
        if (t.includes('futbal') || t.includes('football')) return 'Futbal';
        if (t.includes('hokej') || t.includes('nhl')) return 'Hokej';
        if (t.includes('basketbal') || t.includes('nba')) return 'Basketbal';
        if (t.includes('f1') || t.includes('formula') || t.includes('motor')) return 'F1';
        if (t.includes('gaming') || t.includes('esport') || t.includes('hry')) return 'Gaming';

        // Specific Science Checks
        if (t.includes('medicína') || t.includes('liek') || t.includes('zdravie') || t.includes('health')) return 'Medicína';
        if (t.includes('vesmír') || t.includes('nasa') || t.includes('space')) return 'Vesmír';
        if (t.includes('robot')) return 'Robotika';
        if (t.includes('ui/ux') || t.includes('dizajn') || t.includes('ux')) return 'UI/UX';

        // Specific Biz Checks
        if (t.includes('akvizíc') || t.includes('fúzie') || t.includes('deal')) return 'Dealy';
        if (t.includes('invest') || t.includes('financie') || t.includes('peniaze')) return 'Peniaze';
        if (t.includes('krypto') || t.includes('bitcoin') || t.includes('blockchain')) return 'Krypto';

        // Lifestyle Checks
        if (t.includes('jedlo') || t.includes('food')) return 'Jedlo';
        if (t.includes('móda') || t.includes('fashion') || t.includes('luxus')) return 'Móda';
        if (t.includes('hudba') || t.includes('music') || t.includes('kapela')) return 'Hudba';
        if (t.includes('cestovanie') || t.includes('travel')) return 'Cestovanie';
        if (t.includes('klíma') || t.includes('energia') || t.includes('eko')) return 'Ekológia';
        if (t.includes('dizajn') || t.includes('umenie')) return 'Umenie';

        // General Fallbacks
        if (t.includes('slovensko') || t.includes('domáce') || t.includes('spravodajstvo')) return 'Slovensko';
        if (t.includes('šport') || t.includes('zábava')) return 'Šport a zábava';
        if (t.includes('ai') || t.includes('tech') || t.includes('ui/ux')) return 'AI a tech core';
        if (t.includes('biznis') || t.includes('ekonomika')) return 'Biznis a práca';
        if (t.includes('veda')) return 'Veda a budúcnosť';
        if (t.includes('lifestyle')) return 'Lifestyle';
        if (t.includes('politika') || t.includes('spoločnosť')) return 'Spoločnosť';
    }
    return 'AI a tech core'; // Default fallback
};


export const PERSONA_PROMPTS: Record<PersonaType, string> = {
  [PersonaType.DEFAULT]: "Keep the tone professional, concise, yet engaging. Focus on clarity.",
  [PersonaType.CEO]: "Act as a busy CEO executive. Focus on business impact, ROI, market shifts, and strategic implications. Be extremely concise. Cut the fluff.",
  [PersonaType.ELI5]: "Explain like I am 5 years old. Use simple analogies. Avoid complex jargon. Focus on the basic 'what' and 'why'. be fun.",
  [PersonaType.NERD]: "Act as a technical expert. Go deep into the specifications, methodology, and technical details. Do not simplify technical terms."
};

// UI Descriptions for the User (Translated to Slovak)
export const PERSONA_UI_DATA: Record<PersonaType, { label: string, description: string }> = {
  [PersonaType.DEFAULT]: {
    label: "Redaktor (predvolené)",
    description: "Profesionálny, stručný a jasný prehľad dňa. Ideálny pre každodenné čítanie."
  },
  [PersonaType.CEO]: {
    label: "Biznisový stratég (CEO)",
    description: "Zamerané na ROI, trhové dopady a stratégiu. Žiadna omáčka, len fakty."
  },
  [PersonaType.ELI5]: {
    label: "Kamarát (jednoducho)",
    description: "Jednoduché analógie, žiadny odborný žargón. Hravé a pochopiteľné pre každého."
  },
  [PersonaType.NERD]: {
    label: "Technický expert",
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
      "sourceLink": "string (The EXACT Link URL of the source article used for this section)",
      "tags": ["string", "string"] (Max 2 tags. IMPORTANT: Tags MUST be single words. Transform multi-word phrases to single nouns. E.g. 'Artificial Intelligence' -> 'AI', 'Social Media' -> 'Social'. NO spaces allowed in tags.)
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
- STRICTLY RESPECT SOURCE CONTEXT: If articles come from a specific source category (e.g. Women's Sports, Slovak Repre), ensure the digest reflects that specific context. Do not mix unrelated topics.
`;
