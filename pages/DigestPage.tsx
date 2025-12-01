
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { DailyDigest, AppTab, DigestSection, PersonaType } from '../types';
import { getDigestById, saveDigest, getSelectedTopicIds, getUserProfile, deleteDigest, isInsightSaved, saveInsight, removeInsight } from '../services/storageService';
import { fetchArticlesForTopics } from '../services/rssService';
import { generateDailyDigest, generateAdditionalSections, explainTerm } from '../services/geminiService';
import DigestCard from '../components/DigestCard';
import ChatModal from '../components/ChatModal';
import { SparklesIcon, RefreshIcon, PlusCircleIcon, BookIcon, XIcon } from '../components/Icons';
import { PERSONA_UI_DATA } from '../constants';

interface DigestPageProps {
  changeTab: (tab: AppTab) => void;
  autoStart?: boolean;
  onAutoStartConsumed?: () => void;
  onProfileUpdate?: () => void;
}

const DigestPage: React.FC<DigestPageProps> = ({ changeTab, autoStart, onAutoStartConsumed, onProfileUpdate }) => {
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChatSection, setActiveChatSection] = useState<DigestSection | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [profile, setProfile] = useState(getUserProfile());
  
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
      
      const newProfile = getUserProfile();
      setProfile(newProfile); 
      onProfileUpdate && onProfileUpdate(); // Update Global Header Streak

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


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-150px)] px-6 text-center animate-in fade-in duration-700">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full animate-ping opacity-25"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">Pripravujem váš prehľad</h3>
        <p className={`text-sm text-slate-500 font-medium transition-all duration-700 ease-in-out h-6 transform ${fadeProp}`}>
            {loadingStep}
        </p>
      </div>
    );
  }

  if (!digest) {
    return (
      // Added min-h-[calc(100dvh-150px)] to center content vertically in the available area
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-150px)] px-6">
        <div className="relative z-10 text-center w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
             <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest opacity-80">
              {formattedDate}
            </span>
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight leading-tight">
            {getGreeting()}.
          </h1>

          <p className="text-lg text-slate-500 mb-8 font-light">
            Tvoj osobný AI editor je pripravený.<br/>
            <span className="text-xs mt-2 block opacity-70">Mód: <span className="uppercase font-bold">{PERSONA_UI_DATA[profile.selectedPersona]?.label || profile.selectedPersona}</span></span>
          </p>
          
          {error && (
            <div className="mb-8 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 shadow-sm">
              {error}
            </div>
          )}

          <button 
            onClick={handleGenerate}
            className="group relative w-full bg-slate-900 text-white font-bold py-5 px-8 rounded-xl shadow-xl shadow-indigo-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-3">
              <SparklesIcon className="w-5 h-5 text-indigo-300 group-hover:text-white transition-colors" />
              <span>Vygenerovať denný prehľad</span>
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
      <style>
        {`
          @keyframes subtleFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-subtle-flow {
            background-size: 200% 200%;
            animation: subtleFlow 15s ease infinite;
          }
        `}
      </style>
      <div className="animate-in fade-in duration-500">
        
        {/* Scrollable Content */}
        <div className="px-6 py-6 pb-32 space-y-10">
            
            {/* Header: Date & Title */}
            <div>
               <div className="flex items-center gap-2 mb-1">
                 <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                 <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{formattedDate}</p>
               </div>
               <h1 className="text-3xl font-black text-slate-900 leading-none tracking-tight">
                  {digest.mainTitle}
               </h1>
            </div>

            {/* Feature 7: One Sentence Overview (Hero Card) */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 animate-subtle-flow text-white shadow-xl shadow-indigo-900/10">
                {/* Subtle light effects */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] -mt-10 -mr-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] -mb-10 -ml-10"></div>
                
                <div className="relative z-10 p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-4 opacity-70">
                        <SparklesIcon className="w-4 h-4 text-indigo-200" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Myšlienka dňa</span>
                    </div>
                    {/* Removed italic class here */}
                    <p className="text-lg sm:text-xl font-medium leading-relaxed font-serif">
                        "{digest.oneSentenceOverview}"
                    </p>
                </div>
            </div>

            {/* Feature 8: Busy Read (Briefing Card) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                        V skratke
                    </h3>
                </div>
                
                <div className="divide-y divide-slate-100">
                    {digest.busyRead.map((item, i) => (
                        <div key={i} className="p-5 hover:bg-slate-50 transition-colors">
                            <div className="flex gap-3">
                                <span className="font-bold text-indigo-600 text-sm mt-0.5">{i+1}.</span>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        {item.summary}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detailed Sections Divider */}
            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-slate-50 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Hlboký ponor
                    </span>
                </div>
            </div>

            {/* Detailed Cards */}
            <div className="space-y-6">
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

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col gap-4">
                
                {/* Generate More Button */}
                {digest.sourceArticles && (
                <button 
                    onClick={handleGenerateMore}
                    disabled={loadingMore}
                    className="w-full bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                    {loadingMore ? (
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                    <PlusCircleIcon className="w-5 h-5" />
                    )}
                    <span>{loadingMore ? 'Hľadám ďalšie témy...' : 'Načítať ďalšie správy'}</span>
                </button>
                )}

                <button 
                    onClick={handleReset}
                    className="w-full py-4 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshIcon className="w-3 h-3" />
                    Vymazať a začať odznova
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeEncyclopedia}></div>
           <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="bg-indigo-600 p-4 flex justify-between items-start">
                 <div className="flex items-center gap-2 text-white">
                    <BookIcon className="w-5 h-5 text-indigo-200" />
                    <h3 className="font-bold text-lg">AI encyklopédia</h3>
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
