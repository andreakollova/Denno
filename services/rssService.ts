
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
    name: 'AllOrigins',
    getUrl: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&t=${Date.now()}`,
    extract: async (res) => {
      const json = await res.json();
      if (!json.contents) throw new Error('AllOrigins: No content returned');
      return json.contents;
    },
  },
  {
    name: 'CorsProxy',
    getUrl: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    extract: (res) => res.text(),
  },
  {
    name: 'CodeTabs',
    getUrl: (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    extract: (res) => res.text(),
  }
];

// Helper to pause execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to fetch text content using fallback proxies
export const fetchTextWithFallback = async (url: string): Promise<string | null> => {
  for (const proxy of PROXIES) {
    try {
      const proxyUrl = proxy.getUrl(url);
      const controller = new AbortController();
      // Increased timeout to 15s for slow connections/proxies
      const id = setTimeout(() => controller.abort(), 15000); 

      const response = await fetch(proxyUrl, {
        signal: controller.signal,
      });
      clearTimeout(id);

      if (response.ok) {
        const text = await proxy.extract(response);
        // Basic validation - ensure we got something resembling HTML/XML
        if (text && (text.includes('<rss') || text.includes('<feed') || text.includes('<xml') || text.includes('<?xml'))) {
          return text;
        }
      }
    } catch (e) {
      // Proxy failed, try next
      // console.warn(`Proxy ${proxy.name} failed for ${url}`);
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
        rawDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        imageUrl: undefined,
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
      return [];
    }

    const articles: Article[] = [];
    const now = new Date();
    // Extended to 120 hours (5 days)
    const timeLimit = new Date(now.getTime() - 120 * 60 * 60 * 1000);

    const getText = (parent: Element, selector: string) => {
      let el = parent.querySelector(selector);
      if (!el) {
          const els = parent.getElementsByTagNameNS("*", selector);
          if (els.length > 0) el = els[0];
      }
      return el ? el.textContent || "" : "";
    };

    const getDate = (parent: Element) => {
      const dateStr = getText(parent, "pubDate") || getText(parent, "published") || getText(parent, "updated") || getText(parent, "date");
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    };

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
      if (!link) {
         const links = Array.from(node.getElementsByTagName("link"));
         const altLink = links.find(l => l.getAttribute("rel") === "alternate") || links[0];
         if (altLink) link = altLink.getAttribute("href") || altLink.textContent || "";
      }

      const pubDate = getDate(node);
      const effectiveDate = pubDate || new Date(); 

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
        imageUrl: undefined,
      };
    };

    // Robust node selection (handles namespaces)
    const itemNodes = Array.from(xmlDoc.getElementsByTagName("item"));
    const entryNodes = Array.from(xmlDoc.getElementsByTagName("entry"));
    const nsItemNodes = itemNodes.length === 0 ? Array.from(xmlDoc.getElementsByTagNameNS("*", "item")) : [];
    const nsEntryNodes = entryNodes.length === 0 ? Array.from(xmlDoc.getElementsByTagNameNS("*", "entry")) : [];

    const nodes = [
      ...itemNodes,
      ...entryNodes,
      ...nsItemNodes,
      ...nsEntryNodes
    ];

    const parsedItems = nodes.map(processNode).filter((item) => item !== null) as any[];

    parsedItems.forEach((item) => {
      if (item.rawDate > timeLimit) {
        articles.push(item);
      }
    });

    // Fallback: If filtering removed everything, force take top 5
    if (articles.length === 0 && parsedItems.length > 0) {
      parsedItems.slice(0, 5).forEach((item) => articles.push(item));
    }

    return articles;
  } catch (e) {
    return [];
  }
};

const fetchRssFeed = async (url: string, sourceName: string): Promise<Article[]> => {
  let articles: Article[] = [];

  // 1. Try parsing via proxies first
  const xmlContent = await fetchTextWithFallback(url);
  if (xmlContent) {
    articles = parseXML(xmlContent, sourceName);
  }

  // 2. If proxies yielded nothing or parsing failed completely, try rss2json
  // This is a crucial fallback for sites that block standard proxies
  if (articles.length === 0) {
    const fallbackArticles = await fetchWithRss2Json(url, sourceName);
    if (fallbackArticles.length > 0) {
      return fallbackArticles;
    }
  }

  return articles;
};

// Helper function to process promises in batches with throttling
async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  processFn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchResults = await Promise.all(batch.map(processFn));
    results.push(...batchResults);

    // Add delay between batches to avoid rate limiting (429 Too Many Requests)
    if (i + batchSize < items.length) {
        await delay(1000); // 1 second delay
    }
  }
  return results;
}

export const fetchArticlesForTopics = async (topicIds: string[]): Promise<Article[]> => {
  const selectedTopics = AVAILABLE_TOPICS.filter((t) => topicIds.includes(t.id));

  // Flatten all URLs to be fetched
  const tasks = selectedTopics.flatMap(topic => 
    topic.rssUrls.map(url => ({ url, name: topic.name }))
  );

  // Use smaller batch size (3) and throttling to be gentle on proxies
  const results = await processInBatches(tasks, 3, async (task) => {
    try {
        return await fetchRssFeed(task.url, task.name);
    } catch (e) {
        return [];
    }
  });

  const allArticles = results.flat();

  // Deduplication based on normalized title
  const seen = new Set();
  return allArticles.filter((a) => {
    const normalizedTitle = a.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedTitle.length < 5) return false; 
    if (seen.has(normalizedTitle)) return false;
    seen.add(normalizedTitle);
    return true;
  });
};
