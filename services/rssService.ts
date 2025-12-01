
import { Article } from '../types';
import { AVAILABLE_TOPICS } from '../constants';

// Definition of proxy strategies
interface ProxyConfig {
  name: string;
  getUrl: (target: string) => string;
  extract: (response: Response) => Promise<string>;
}

// Ordered list of proxies to try
// Switched AllOrigins to first as it returns JSON and handles encoding well
const PROXIES: ProxyConfig[] = [
  {
    name: 'AllOrigins',
    getUrl: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    extract: async (res) => {
      const json = await res.json();
      if (!json.contents) throw new Error('AllOrigins: No content returned');
      return json.contents;
    }
  },
  {
    name: 'CodeTabs',
    getUrl: (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    extract: (res) => res.text()
  },
  {
    name: 'ThingProxy',
    getUrl: (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
    extract: (res) => res.text()
  }
];

// Helper to fetch text content using fallback proxies
export const fetchTextWithFallback = async (url: string): Promise<string | null> => {
  for (const proxy of PROXIES) {
    try {
      const proxyUrl = proxy.getUrl(url);
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 15000); // Increased timeout to 15s

      const response = await fetch(proxyUrl, { 
        signal: controller.signal
      });
      clearTimeout(id);
      
      if (response.ok) {
        const text = await proxy.extract(response);
        // Basic validation - ensure we got something resembling HTML/XML
        if (text && text.length > 50) { 
          return text;
        }
      }
    } catch (e) {
      console.warn(`[RSS] Proxy ${proxy.name} failed for ${url}`);
      // Continue to next proxy
    }
  }
  return null;
};

// Fallback specifically for RSS feeds using rss2json service
const fetchWithRss2Json = async (url: string, sourceName: string): Promise<Article[]> => {
  try {
    // rss2json is very reliable for blocked feeds like Slovak news
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 'ok' && Array.isArray(data.items)) {
      return data.items.map((item: any) => ({
        title: item.title,
        summary: item.description || item.content || "",
        link: item.link,
        published: item.pubDate || new Date().toISOString(),
        source: sourceName,
        rawDate: item.pubDate ? new Date(item.pubDate) : new Date(), // Safe date parsing
        imageUrl: item.thumbnail || item.enclosure?.link
      }));
    }
  } catch (e) {
    console.warn(`[RSS] RSS2JSON failed for ${url}`, e);
  }
  return [];
};

const parseXML = (xmlText: string, sourceName: string): Article[] => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Check for parser errors
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
        console.warn(`[RSS] XML Parsing error for ${sourceName}`);
        return [];
    }

    const articles: Article[] = [];
    const now = new Date();
    // Extended to 72 hours window
    const timeLimit = new Date(now.getTime() - 72 * 60 * 60 * 1000);

    const getText = (parent: Element, selector: string) => {
        const el = parent.querySelector(selector);
        return el ? el.textContent || "" : "";
    };

    const getDate = (parent: Element) => {
        const dateStr = getText(parent, "pubDate") || getText(parent, "published") || getText(parent, "updated") || getText(parent, "date");
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    };

    // Helper to process a node (item or entry)
    const processNode = (node: Element) => {
        const title = getText(node, "title");
        
        let summary = "";
        const contentEncoded = node.getElementsByTagNameNS("*", "encoded")[0];
        if (contentEncoded) {
            summary = contentEncoded.textContent || "";
        } else {
            summary = getText(node, "description") || getText(node, "summary") || getText(node, "content");
        }

        let link = getText(node, "link");
        if (!link) {
            const linkNode = node.querySelector("link");
            if (linkNode) link = linkNode.getAttribute("href") || "";
        }

        // Image Extraction Logic
        let imageUrl: string | undefined;
        
        // 1. Check <enclosure>
        const enclosure = node.querySelector("enclosure");
        if (enclosure && enclosure.getAttribute("type")?.startsWith("image")) {
          imageUrl = enclosure.getAttribute("url") || undefined;
        }

        // 2. Check <media:content>
        if (!imageUrl) {
          const mediaContent = node.getElementsByTagNameNS("*", "content")[0] || node.getElementsByTagNameNS("*", "thumbnail")[0];
          if (mediaContent) {
            imageUrl = mediaContent.getAttribute("url") || undefined;
          }
        }

        // 3. Check HTML content
        if (!imageUrl) {
           const imgMatch = summary.match(/<img[^>]+src=["']([^"']+)["']/i);
           if (imgMatch) {
             imageUrl = imgMatch[1];
           }
        }

        const pubDate = getDate(node);
        const effectiveDate = pubDate || new Date(); // Default to now if missing

        if (!title) return null;

        const cleanSummary = summary
            .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
            .replace(/<[^>]*>?/gm, '')
            .replace(/\s+/g, ' ')
            .substring(0, 500)
            .trim();

        return {
            title: title.trim(),
            summary: cleanSummary || title,
            link: link,
            published: effectiveDate.toISOString(), 
            source: sourceName,
            rawDate: effectiveDate,
            imageUrl
        };
    };

    const nodes = [
        ...Array.from(xmlDoc.querySelectorAll("item")), 
        ...Array.from(xmlDoc.querySelectorAll("entry"))
    ];

    const parsedItems = nodes.map(processNode).filter(item => item !== null) as any[];

    // Filter Logic
    parsedItems.forEach(item => {
        if (item.rawDate > timeLimit) {
            articles.push(item);
        }
    });

    // Fallback: If filtering removed everything (e.g. bad dates), take top 5
    if (articles.length === 0 && parsedItems.length > 0) {
        parsedItems.slice(0, 5).forEach(item => articles.push(item));
    }

    return articles;
  } catch (e) {
    console.error(`[RSS] Error parsing XML for ${sourceName}`, e);
    return [];
  }
};

const fetchRssFeed = async (url: string, sourceName: string): Promise<Article[]> => {
  // Strategy: 
  // 1. Try text proxies (good for standard feeds)
  // 2. If text proxies fail, try rss2json (good for stubborn/blocked feeds)
  
  let articles: Article[] = [];

  // Try parsing via proxies first
  const xmlContent = await fetchTextWithFallback(url);
  if (xmlContent) {
    articles = parseXML(xmlContent, sourceName);
  }

  // If proxies yielded nothing, or failed, try rss2json
  if (articles.length === 0) {
    console.log(`[RSS] Proxies empty/failed for ${sourceName}, trying RSS2JSON...`);
    const fallbackArticles = await fetchWithRss2Json(url, sourceName);
    if (fallbackArticles.length > 0) {
      return fallbackArticles;
    }
  }

  return articles;
};

export const fetchArticlesForTopics = async (topicIds: string[]): Promise<Article[]> => {
  const selectedTopics = AVAILABLE_TOPICS.filter(t => topicIds.includes(t.id));
  
  // Fetch all feeds in parallel
  const results = await Promise.all(
    selectedTopics.flatMap(topic => 
      topic.rssUrls.map(async (url) => {
        return fetchRssFeed(url, topic.name);
      })
    )
  );

  const allArticles = results.flat();

  // Deduplication
  const seen = new Set();
  return allArticles.filter(a => {
    const normalizedTitle = a.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(normalizedTitle)) return false;
    seen.add(normalizedTitle);
    return true;
  });
};
