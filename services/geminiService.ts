import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Article, DailyDigest, DigestSection, PersonaType } from '../types';
import { getSystemInstruction } from '../constants';
import { fetchTextWithFallback } from './rssService';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyDigest = async (articles: Article[], persona: PersonaType): Promise<DailyDigest> => {
  if (articles.length === 0) {
    throw new Error("Žiadne články na spracovanie.");
  }

  // Limit articles to avoid token limits (top 80 most recent)
  // Increased from 30 to 80 to allow for "Generating More" content
  const sortedArticles = articles.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()).slice(0, 80);

  const articlesText = sortedArticles.map(a => `Title: ${a.title}\nSummary: ${a.summary}\nSource: ${a.source}\n`).join('\n---\n');

  const prompt = `Here are the news articles from the last 72 hours:\n\n${articlesText}\n\nCreate a comprehensive digest with 5 to 8 distinct sections. Ensure all titles use Slovak sentence case (only first letter capitalized).`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(persona),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mainTitle: { type: Type.STRING },
          oneSentenceOverview: { type: Type.STRING },
          busyRead: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING }
              },
              required: ["title", "summary"]
            }
          },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                whatIsNew: { type: Type.STRING },
                whatChanged: { type: Type.STRING },
                whatToWatch: { type: Type.STRING },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["title", "whatIsNew", "whatChanged", "whatToWatch", "tags"]
            }
          }
        },
        required: ["mainTitle", "oneSentenceOverview", "busyRead", "sections"]
      }
    }
  });

  const text = response.text;
  if (!text) {
      throw new Error("Failed to generate digest content");
  }

  const jsonResponse = JSON.parse(text);
  const todayId = new Date().toISOString().split('T')[0];

  return {
    id: todayId,
    date: new Date().toISOString(),
    mainTitle: jsonResponse.mainTitle,
    oneSentenceOverview: jsonResponse.oneSentenceOverview,
    busyRead: jsonResponse.busyRead,
    sections: jsonResponse.sections,
    sourceArticles: sortedArticles, // Save source for "Generate More"
    createdAt: Date.now(),
    personaUsed: persona
  };
};

export const generateAdditionalSections = async (
  articles: Article[], 
  existingSections: DigestSection[], 
  persona: PersonaType
): Promise<DigestSection[]> => {
  
  if (articles.length === 0) return [];

  const articlesText = articles.map(a => `Title: ${a.title}\nSummary: ${a.summary}\n`).join('\n---\n');
  const existingTitles = existingSections.map(s => s.title).join(", ");

  const prompt = `
    Here are the news articles:\n${articlesText}\n
    
    The current digest already covers these topics/titles:
    [${existingTitles}]
    
    TASK: Generate 3 NEW, DISTINCT sections based on the articles that cover different stories or angles NOT yet covered in the list above.
    Ensure strict Slovak sentence case for titles.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(persona), // Reuse style
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            whatIsNew: { type: Type.STRING },
            whatChanged: { type: Type.STRING },
            whatToWatch: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "whatIsNew", "whatChanged", "whatToWatch", "tags"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) return [];

  return JSON.parse(text) as DigestSection[];
};

export const createChatSession = (section: DigestSection): Chat => {
  const contextString = `
    Téma článku: ${section.title}
    Čo je nové: ${section.whatIsNew}
    Čo sa zmenilo: ${section.whatChanged}
    Na čo sa zamerať: ${section.whatToWatch}
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `Si nápomocný AI asistent pre spravodajskú aplikáciu.
      Používateľ číta správu z denného prehľadu s nasledujúcim kontextom:
      ${contextString}

      Tvojou úlohou je odpovedať na doplňujúce otázky používateľa k tejto konkrétnej téme.
      Pravidlá:
      1. Odpovedaj stručne, jasne a v slovenskom jazyku.
      2. Buď priateľský.`
    }
  });
};

export const summarizeUrl = async (url: string, persona: PersonaType): Promise<string> => {
  try {
    const content = await fetchTextWithFallback(url);
    if (!content) {
      throw new Error("Nedá sa načítať obsah stránky.");
    }
    
    // Limit content size roughly
    const truncatedContent = content.substring(0, 15000);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize this text in Slovak language. Use the following persona: ${persona}. Text: ${truncatedContent}`,
      config: {
        systemInstruction: "You are a helpful assistant. Summarize the provided web content. Return only the summary text, formatted with Markdown."
      }
    });

    return response.text || "Nepodarilo sa vygenerovať zhrnutie.";

  } catch (error) {
    console.error("Link summary error:", error);
    return "Prepáč, nepodarilo sa mi načítať alebo analyzovať tento odkaz.";
  }
}