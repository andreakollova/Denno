import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Article, DailyDigest, DigestSection, PersonaType, LearningPack } from '../types';
import { getSystemInstruction } from '../constants';
import { fetchTextWithFallback } from './rssService';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyDigest = async (articles: Article[], persona: PersonaType): Promise<DailyDigest> => {
  if (articles.length === 0) {
    throw new Error("Žiadne články na spracovanie.");
  }

  // Limit articles to avoid token limits (top 80 most recent)
  const sortedArticles = articles.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()).slice(0, 80);

  // Added Link: ${a.link} to the input so AI can reference it
  const articlesText = sortedArticles.map(a => `Title: ${a.title}\nLink: ${a.link}\nSummary: ${a.summary}\nSource: ${a.source}\n`).join('\n---\n');

  const prompt = `Here are the news articles from the last 72 hours:\n\n${articlesText}\n\nCreate a comprehensive digest with 5 to 8 distinct sections. Ensure all titles use Slovak sentence case (only first letter capitalized). IMPORTANT: For each section, you MUST provide the exact 'sourceLink' of the article you used.`;

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
                sourceLink: { type: Type.STRING, description: "The EXACT Link URL of the source article used for this section" },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["title", "whatIsNew", "whatChanged", "whatToWatch", "tags", "sourceLink"]
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

  // Map directly without image processing
  const enrichedSections = jsonResponse.sections.map((s: any) => ({
    ...s
  }));

  return {
    id: todayId,
    date: new Date().toISOString(),
    mainTitle: jsonResponse.mainTitle,
    oneSentenceOverview: jsonResponse.oneSentenceOverview,
    busyRead: jsonResponse.busyRead,
    sections: enrichedSections,
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

  const articlesText = articles.map(a => `Title: ${a.title}\nLink: ${a.link}\nSummary: ${a.summary}\n`).join('\n---\n');
  const existingTitles = existingSections.map(s => s.title).join(", ");

  const prompt = `
    Here are the news articles:\n${articlesText}\n
    
    The current digest already covers these topics/titles:
    [${existingTitles}]
    
    TASK: Generate 3 NEW, DISTINCT sections based on the articles that cover different stories or angles NOT yet covered in the list above.
    Ensure strict Slovak sentence case for titles.
    Provide 'sourceLink' for each section.
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
            sourceLink: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "whatIsNew", "whatChanged", "whatToWatch", "tags", "sourceLink"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) return [];

  const rawSections = JSON.parse(text) as DigestSection[];

  // Return sections without image mapping
  return rawSections;
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

// Feature 43: Encyclopedia - Explain a term
export const explainTerm = async (term: string, persona: PersonaType): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Explain the concept or topic "${term}" clearly in Slovak. Use the persona: ${persona}. Keep it under 150 words.`,
    config: {
      systemInstruction: "You are an AI Encyclopedia. Your goal is to provide clear, accurate, and concise definitions of complex terms found in news articles. Output in Slovak Markdown."
    }
  });
  return response.text || "Nepodarilo sa nájsť vysvetlenie.";
};

// Feature 44: Fast Learning Packs
export const generateLearningPack = async (topic: string, persona: PersonaType): Promise<LearningPack> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Create a "10-minute Fast Learning Pack" about: ${topic}. Language: Slovak.`,
    config: {
      systemInstruction: `You are an educational AI. Create a structured crash course on the given topic. 
      Persona: ${persona}.
      Structure the JSON response exactly as requested.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          definition: { type: Type.STRING, description: "Simple definition of the topic" },
          history: { type: Type.STRING, description: "Brief history or timeline in 2-3 sentences" },
          keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 bullet points of main concepts" },
          futureOutlook: { type: Type.STRING, description: "What to expect in the future" },
          quizQuestion: { type: Type.STRING, description: "One simple quiz question to test understanding" }
        },
        required: ["topic", "definition", "history", "keyConcepts", "futureOutlook", "quizQuestion"]
      }
    }
  });

  if (!response.text) throw new Error("Generovanie zlyhalo");
  return JSON.parse(response.text) as LearningPack;
};