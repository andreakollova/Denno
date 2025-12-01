import { Article } from '../types';
import { AVAILABLE_TOPICS } from '../constants';

// Definition of proxy strategies
interface ProxyConfig {
  name: string;
  getUrl: (target: string) => string;
  extract: (response: Response) => Promise<string>;
}

// Ordered list of proxies to try
const PROXIES: ProxyConfig[] = [
  {
    name: 'CodeTabs',
    getUrl: (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    extract: (res) => res.text()
  },
  {
    name: 'AllOrigins',
    getUrl: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    extract: async (res) => {
      const json = await res.json();
      if (json.status?.http_code && json.status.http_code !== 200) {
          throw new Error(`AllOrigins error: ${json.status.http_code}`);
      }
      return json.contents;
    }
  },
  {
    name: 'CorsProxy',
    getUrl: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    extract: (res) => res.text()
  },
  {
    name: 'ThingProxy',
    getUrl: (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
    extract: (res) => res.text()
  }
];

// Helper to fetch text content using fallback proxies
// Used for both RSS XML (first attempt) and generic URL summarization
export const fetchTextWithFallback = async (url: string): Promise<string | null> => {
  for (const proxy of PROXIES) {
    try {
      const proxyUrl = proxy.getUrl(url);
      // Set a timeout for the fetch
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(proxyUrl, { 
        signal: controller.signal,
        headers: { 
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/xml, text/xml, */*'
        }
      });
      clearTimeout(id);
      
      if (response.ok) {
        const text = await proxy.extract(response);
        // Basic validation
        if (text && text.length > 50) { 
          return text;
        }
      }
    } catch (e) {
      console.warn(`[RSS] Proxy ${proxy.name} failed for ${url}:`, e);
      // Continue to next proxy
    }
  }
  console.warn(`[RSS] All text proxies failed for ${url}`);
  return null;
};

// Fallback specifically for RSS feeds using rss2json service
// This bypasses CORS and parsing issues by letting a 3rd party server handle it
const fetchWithRss2Json = async (url: string, sourceName: string): Promise<Article[]> => {
  try {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 'ok' && Array.isArray(data.items)) {
      return data.items.map((item: any) => ({
        title: item.title,
        summary: item.description || item.content || "",
        link: item.link,
        published: item.pubDate,
        source: sourceName,
        rawDate: new Date(item.pubDate) // rss2json returns standard format
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
    // Extended to 72 hours to be safe
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
        
        // Try to find the best description
        let summary = "";
        const contentEncoded = node.getElementsByTagNameNS("*", "encoded")[0]; // content:encoded
        if (contentEncoded) {
            summary = contentEncoded.textContent || "";
        } else {
            summary = getText(node, "description") || getText(node, "summary") || getText(node, "content");
        }

        // Try to find the best link
        let link = getText(node, "link");
        if (!link) {
            // Atom link is an attribute
            const linkNode = node.querySelector("link");
            if (linkNode) link = linkNode.getAttribute("href") || "";
        }

        const pubDate = getDate(node);

        if (!title) return null;

        // Clean HTML from summary
        const cleanSummary = summary
            .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') // Extract CDATA
            .replace(/<[^>]*>?/gm, '') // Strip tags
            .replace(/\s+/g, ' ') // Normalize whitespace
            .substring(0, 500)
            .trim();

        return {
            title: title.trim(),
            summary: cleanSummary || title, // Fallback summary
            link: link,
            published: pubDate ? pubDate.toISOString() : new Date().toISOString(), 
            source: sourceName,
            rawDate: pubDate
        };
    };

    // Collect all potential articles
    const nodes = [
        ...Array.from(xmlDoc.querySelectorAll("item")), 
        ...Array.from(xmlDoc.querySelectorAll("entry"))
    ];

    const parsedItems = nodes.map(processNode).filter(item => item !== null) as any[];

    // Filter Logic
    parsedItems.forEach(item => {
        // If we have a valid date and it's recent
        if (item.rawDate && item.rawDate > timeLimit) {
            articles.push(item);
        }
    });

    // Fallback: If no recent articles found, take top 3 regardless of date
    // This helps if the feed date format is weird or feed is slightly stale
    if (articles.length === 0 && parsedItems.length > 0) {
        parsedItems.slice(0, 3).forEach(item => articles.push(item));
    }

    return articles;
  } catch (e) {
    console.error(`[RSS] Error parsing XML for ${sourceName}`, e);
    return [];
  }
};

const fetchRssFeed = async (url: string, sourceName: string): Promise<Article[]> => {
  // Strategy 1: Try fetching raw XML via multiple proxies
  const xmlContent = await fetchTextWithFallback(url);
  if (xmlContent) {
    const articles = parseXML(xmlContent, sourceName);
    if (articles.length > 0) {
      return articles;
    }
  }

  // Strategy 2: If XML fetch or parse failed, try RSS2JSON service
  // This is often more reliable for difficult feeds (like Slovak news sites behind Cloudflare)
  console.log(`[RSS] Falling back to RSS2JSON for ${sourceName}`);
  return await fetchWithRss2Json(url, sourceName);
};

export const fetchArticlesForTopics = async (topicIds: string[]): Promise<Article[]> => {
  const selectedTopics = AVAILABLE_TOPICS.filter(t => topicIds.includes(t.id));
  
  const results = await Promise.all(
    selectedTopics.flatMap(topic => 
      topic.rssUrls.map(async (url) => {
        return fetchRssFeed(url, topic.name);
      })
    )
  );

  const allArticles = results.flat();

  // Deduplication by Title + Link
  const seen = new Set();
  return allArticles.filter(a => {
    // Basic normalization for dedupe
    const normalizedTitle = a.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = normalizedTitle; 
    
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};