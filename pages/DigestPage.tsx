
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { DailyDigest, AppTab, DigestSection, PersonaType } from '../types';
import { getDigestById, saveDigest, getSelectedTopicIds, getUserProfile, deleteDigest, isInsightSaved, saveInsight, removeInsight } from '../services/storageService';
import { fetchArticlesForTopics } from '../services/rssService';
import { generateDailyDigest, generateAdditionalSections, explainTerm } from '../services/geminiService';
import { fetchCoordinates, fetchWeather, WeatherData } from '../services/weatherService';
import DigestCard from '../components/DigestCard';
import ChatModal from '../components/ChatModal';
import { SparklesIcon, WeatherSunIcon, WeatherCloudIcon, WeatherRainIcon, RefreshIcon, PlusCircleIcon, BookIcon, XIcon, BotIcon } from '../components/Icons';
import { PERSONA_UI_DATA } from '../constants';

interface DigestPageProps {
  changeTab: (tab: AppTab) => void;
  autoStart?: boolean;
  onAutoStartConsumed?: () => void;
}

const DigestPage: React.FC<DigestPageProps> = ({ changeTab, autoStart, onAutoStartConsumed }) => {
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChatSection, setActiveChatSection] = useState<DigestSection | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [profile, setProfile] = useState(getUserProfile());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  
  // Loading Animation State
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [articleCount, setArticleCount] = useState(0);
  const [fadeProp, setFadeProp] = useState('opacity-100 translate-y-0');
  
  // Encyclopedia State
  const [encyclopediaTerm, setEncyclopediaTerm] = useState<string | null>(null);
  const [encyclopediaContent, setEncyclopediaContent] = useState<string | null>(null);
  const [encyclopediaLoading, setEncyclopediaLoading] = useState(false);

  // Trigger re-render when saving
  const [lastSave, setLastSave] = useState(0);

  useEffect(() => {
    // Check for today's digest
    const todayId = new Date().toISOString().split('T')[0];
    const existing = getDigestById(todayId);
    // Only load existing if we are NOT about to auto-generate
    if (existing && !autoStart) {
      setDigest(existing);
    }
    setProfile(getUserProfile());

    // Fetch Weather
    loadWeather(getUserProfile().city || 'Bratislava');
  }, [lastSave]); // Reload when saves happen

  // Effect for rotating loading messages
  useEffect(() => {
    if (!isAiProcessing) return;

    const personaLabel = PERSONA_UI_DATA[profile.selectedPersona]?.label || profile.selectedPersona;
    
    const messages = [
      `Analyzujem ${articleCount} stiahnutých článkov...`,
      `Aplikujem mód: ${personaLabel}...`,
      `Hľadám kľúčové súvislosti a trendy...`,
      `Môže to chvíľu trvať, spracovávam dáta...`,
      `Píšem zhrnutia a formátujem text...`,
      `Ešte chvíľočku, už to bude...`
    ];

    let i = 0;
    
    // Initial transition: Fade out the previous "Searching..." message first
    setFadeProp('opacity-0 translate-y-2');

    // Wait for fade out, then show first AI message
    const startTimeout = setTimeout(() => {
        setLoadingStep(messages[0]);
        setFadeProp('opacity-100 translate-y-0');
    }, 600);

    const interval = setInterval(() => {
      // Start fade out
      setFadeProp('opacity-0 translate-y-2');

      setTimeout(() => {
        i = (i + 1) % messages.length;
        setLoadingStep(messages[i]);
        // Start fade in
        setFadeProp('opacity-100 translate-y-0');
      }, 600); // Wait for fade out to finish

    }, 5000); // Change message every 5 seconds

    return () => {
        clearInterval(interval);
        clearTimeout(startTimeout);
    };
  }, [isAiProcessing, articleCount, profile.selectedPersona]);

  const loadWeather = async (city: string) => {
    try {
      const coords = await fetchCoordinates(city);
      if (coords) {
        const wData = await fetchWeather(coords.lat, coords.lon);
        setWeather(wData);
      }
    } catch (e) {
      console.warn("Weather error", e);
    }
  };

  const handleGenerate = async () => {
    const topics = getSelectedTopicIds();
    if (topics.length === 0) {
      changeTab(AppTab.SETTINGS);
      return;
    }

    setLoading(true);
    setIsAiProcessing(false); // Reset AI processing state initially
    setError(null);

    try {
      setLoadingStep('Hľadám najnovšie správy...');
      setFadeProp('opacity-100 translate-y-0'); // Ensure visible start
      
      const articles = await fetchArticlesForTopics(topics);
      
      if (articles.length === 0) {
        throw new Error('Nepodarilo sa stiahnuť žiadne články. Skontrolujte internetové pripojenie alebo skúste iné témy.');
      }

      // Start the rotating messages
      setArticleCount(articles.length);
      setIsAiProcessing(true);

      const newDigest = await generateDailyDigest(articles, profile.selectedPersona);
      
      saveDigest(newDigest);
      setDigest(newDigest);
      setProfile(getUserProfile()); // Update streak display
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Nastala chyba pri generovaní prehľadu.');
    } finally {
      setIsAiProcessing(false);
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleGenerateMore = async () => {
    if (!digest || !digest.sourceArticles || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const newSections = await generateAdditionalSections(
        digest.sourceArticles,
        digest.sections,
        profile.selectedPersona
      );
      
      if (newSections.length === 0) {
        alert("Nepodarilo sa nájsť ďalšie unikátne témy v dnešných článkoch.");
      } else {
        const updatedDigest = {
          ...digest,
          sections: [...digest.sections, ...newSections]
        };
        saveDigest(updatedDigest);
        setDigest(updatedDigest);
      }
    } catch (e) {
      console.error("Generate more error", e);
      alert("Chyba pri generovaní ďalšieho obsahu.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleReset = () => {
    if (digest) {
        deleteDigest(digest.id);
        setDigest(null);
    }
  };

  const handleToggleSave = (section: DigestSection) => {
    if (!digest) return;

    // Use a unique ID combination logic matching the storage service
    const id = `${digest.id}-${section.title.substring(0, 10).replace(/\s+/g, '')}`;
    const saved = isInsightSaved(section.title, digest.id);

    if (saved) {
      removeInsight(id);
    } else {
      saveInsight(section, digest.id, digest.date);
    }
    setLastSave(Date.now()); // Trigger re-render
  };

  // Feature 43: Encyclopedia Handler
  const handleTagClick = async (tag: string) => {
    setEncyclopediaTerm(tag);
    setEncyclopediaContent(null);
    setEncyclopediaLoading(true);
    try {
      const text = await explainTerm(tag, profile.selectedPersona);
      setEncyclopediaContent(text);
    } catch (e) {
      setEncyclopediaContent("Nepodarilo sa načítať vysvetlenie.");
    } finally {
      setEncyclopediaLoading(false);
    }
  };

  const closeEncyclopedia = () => {
    setEncyclopediaTerm(null);
    setEncyclopediaContent(null);
  };

  // Handle auto-start from Settings "Generate" button
  useEffect(() => {
    if (autoStart) {
        handleGenerate();
        if (onAutoStartConsumed) {
            onAutoStartConsumed();
        }
    }
  }, [autoStart]);

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 10) return 'Dobré ráno';
    if (hour < 18) return 'Dobrý deň';
    return 'Dobrý večer';
  };

  const formattedDate = currentDate.toLocaleDateString('sk-SK', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  const getWeatherIcon = (w: WeatherData) => {
      if (w.weatherCode >= 51) return <WeatherRainIcon className="w-4 h-4 text-indigo-400 mb-0.5" />;
      if (w.weatherCode > 2) return <WeatherCloudIcon className="w-4 h-4 text-slate-400 mb-0.5" />;
      return <WeatherSunIcon className="w-4 h-4 text-amber-500" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 text-center pt-32 animate-in fade-in duration-700">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full animate-ping opacity-25"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <SparklesIcon className="w-8 h-8 text-indigo-600 animate-pulse" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Pripravujem váš prehľad</h3>
        <p className={`text-sm text-slate-500 font-medium transition-all duration-700 ease-in-out h-6 transform ${fadeProp}`}>
            {loadingStep}
        </p>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="relative min-h-full flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 -left-20 w-72 h-72 bg-indigo-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 -right-20 w-72 h-72 bg-purple-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 text-center w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
             <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest opacity-80">
              {formattedDate}
            </span>
             {profile.streak > 0 && (
               <span className="text-xs font-bold text-amber-500 bg-amber-100 px-2 py-0.5 rounded-full flex items-center">
                 🔥 {profile.streak} dní
               </span>
             )}
          </div>
          
          <div className="mb-6 flex justify-center items-center">
             <img src="https://cdn.shopify.com/s/files/1/0804/4226/1839/files/54325342.png?v=1764569599" alt="Logo" className="h-16 w-auto object-contain" />
          </div>

          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight leading-tight">
            {getGreeting()}.
          </h1>

          {/* Weather Widget */}
          {weather && (
            <div className="flex items-center justify-center gap-2 mb-8 text-slate-500 bg-white/60 backdrop-blur-sm py-1 px-3 rounded-full inline-flex border border-white">
                {getWeatherIcon(weather)}
                <span className="text-sm font-medium">{weather.temperature}°C</span>
                <span className="text-xs border-l border-slate-300 pl-2 ml-1">{profile.city}</span>
            </div>
          )}
          
          <p className="text-lg text-slate-500 mb-8 font-light">
            Tvoj osobný AI editor je pripravený.<br/>
            <span className="text-xs mt-2 block opacity-70">Mód: <span className="uppercase font-bold">{PERSONA_UI_DATA[profile.selectedPersona]?.label || profile.selectedPersona}</span></span>
          </p>
          
          {error && (
            <div className="mb-8 bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 shadow-sm">
              {error}
            </div>
          )}

          <button 
            onClick={handleGenerate}
            className="group relative w-full bg-slate-900 text-white font-bold py-5 px-8 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              <SparklesIcon className="w-5 h-5 text-indigo-300 group-hover:text-white transition-colors" />
              <span>Vygenerovať Denný Prehľad</span>
            </div>
          </button>
          
          <p className="mt-6 text-xs text-slate-400 font-medium">
            Poháňané Google Gemini 2.0 Flash
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="animate-in fade-in duration-500">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 py-3 flex items-center justify-between relative min-h-[60px]">
            
            {/* Logo Centered Absolutely */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <img src="https://cdn.shopify.com/s/files/1/0804/4226/1839/files/54325342.png?v=1764569599" alt="Logo" className="h-10 w-auto object-contain" />
            </div>
             
             {/* Left side spacer */}
             <div></div>

             {/* Right: Status Icons */}
             <div className="flex items-center justify-end gap-2 z-10">
                {weather && (
                    <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100/50 border border-slate-200 px-2.5 py-1 rounded-full h-7">
                        {getWeatherIcon(weather)}
                        <span className="text-xs font-bold leading-none mt-0.5">{Math.round(weather.temperature)}°</span>
                    </div>
                )}
                {profile.streak > 0 && (
                   <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full h-7">
                     <span className="leading-none text-sm">🔥</span>
                     <span className="leading-none mt-0.5">{profile.streak}</span>
                   </span>
                 )}
            </div>
        </header>

        {/* Scrollable Content */}
        <div className="p-6 space-y-8">
            
            {/* Main Title - Moved here from header */}
            <h1 className="text-2xl font-black text-slate-900 leading-tight">
                {digest.mainTitle}
            </h1>

            {/* Feature 7: One Sentence */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-xl shadow-indigo-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10">
                    <div className="flex items-start gap-3">
                        <SparklesIcon className="w-5 h-5 text-indigo-300 flex-shrink-0 mt-1" />
                        <p className="text-base font-medium leading-relaxed italic">
                        "{digest.oneSentenceOverview}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Feature 8: Busy Read (Top 3) */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1 flex items-center gap-2">
                    <span className="w-8 h-px bg-slate-200"></span>
                    V skratke (Busy Mode)
                </h3>
                <div className="grid gap-3">
                {digest.busyRead.map((item, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:border-indigo-100 transition-colors">
                        <div className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 shadow-inner">
                            {i+1}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1.5">{item.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">{item.summary}</p>
                        </div>
                    </div>
                ))}
                </div>
            </div>

            {/* Detailed Sections */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1 flex items-center gap-2">
                    <span className="w-8 h-px bg-slate-200"></span>
                    Detailný prehľad
                </h3>
                {digest.sections.map((section, index) => (
                    <DigestCard 
                      key={index} 
                      section={section} 
                      index={index} 
                      onAskMore={setActiveChatSection}
                      onTagClick={handleTagClick}
                      onToggleSave={handleToggleSave}
                      isSaved={isInsightSaved(section.title, digest.id)}
                    />
                ))}
            </div>

            {/* Buttons Action Area */}
            <div className="pt-4 pb-8 flex flex-col items-center gap-4">
                
                {/* Generate More Button - Only shows if we have source articles */}
                {digest.sourceArticles && (
                <button 
                    onClick={handleGenerateMore}
                    disabled={loadingMore}
                    className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                >
                    {loadingMore ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                    <PlusCircleIcon className="w-5 h-5" />
                    )}
                    <span>{loadingMore ? 'Generujem...' : 'Generovať viac'}</span>
                </button>
                )}

                <button 
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors text-xs font-bold uppercase tracking-wide"
                >
                    <RefreshIcon className="w-4 h-4" />
                    Začať odznova (Reset)
                </button>
            </div>
        </div>
      </div>

      {activeChatSection && (
        <ChatModal 
          section={activeChatSection} 
          onClose={() => setActiveChatSection(null)} 
        />
      )}

      {/* Encyclopedia Modal */}
      {encyclopediaTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeEncyclopedia}></div>
           <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="bg-indigo-600 p-4 flex justify-between items-start">
                 <div className="flex items-center gap-2 text-white">
                    <BookIcon className="w-5 h-5 text-indigo-200" />
                    <h3 className="font-bold text-lg">AI Encyklopédia</h3>
                 </div>
                 <button onClick={closeEncyclopedia} className="text-white/70 hover:text-white">
                    <XIcon className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-6">
                 <h2 className="text-2xl font-black text-slate-900 mb-4">{encyclopediaTerm}</h2>
                 
                 {encyclopediaLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                       <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                       <p className="text-sm text-slate-500">Hľadám definíciu...</p>
                    </div>
                 ) : (
                    <div className="prose prose-sm text-slate-700 leading-relaxed max-h-60 overflow-y-auto pr-2">
                       <ReactMarkdown>{encyclopediaContent || ""}</ReactMarkdown>
                    </div>
                 )}
                 
                 <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center">
                    <button onClick={closeEncyclopedia} className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors">
                       Zavrieť
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default DigestPage;
