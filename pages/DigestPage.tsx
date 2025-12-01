import React, { useState, useEffect } from 'react';
import { DailyDigest, AppTab, DigestSection, PersonaType } from '../types';
import { getDigestById, saveDigest, getSelectedTopicIds, getUserProfile, deleteDigest } from '../services/storageService';
import { fetchArticlesForTopics } from '../services/rssService';
import { generateDailyDigest, generateAdditionalSections } from '../services/geminiService';
import { fetchCoordinates, fetchWeather, WeatherData } from '../services/weatherService';
import DigestCard from '../components/DigestCard';
import ChatModal from '../components/ChatModal';
import { SparklesIcon, WeatherSunIcon, WeatherCloudIcon, WeatherRainIcon, RefreshIcon, PlusCircleIcon } from '../components/Icons';

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
  }, []);

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
    setError(null);

    try {
      setLoadingStep('Načítavam RSS zdroje...');
      const articles = await fetchArticlesForTopics(topics);
      
      if (articles.length === 0) {
        throw new Error('Nepodarilo sa stiahnuť žiadne články. Skontrolujte internetové pripojenie alebo skúste iné témy.');
      }

      setLoadingStep(`Analyzujem ${articles.length} článkov (Mód: ${profile.selectedPersona})...`);
      const newDigest = await generateDailyDigest(articles, profile.selectedPersona);
      
      saveDigest(newDigest);
      setDigest(newDigest);
      setProfile(getUserProfile()); // Update streak display
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Nastala chyba pri generovaní prehľadu.');
    } finally {
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
      // Very basic mapping based on WMO code from OpenMeteo
      if (w.weatherCode >= 51) return <WeatherRainIcon className="w-5 h-5 text-indigo-400" />;
      if (w.weatherCode > 2) return <WeatherCloudIcon className="w-5 h-5 text-slate-400" />;
      return <WeatherSunIcon className="w-5 h-5 text-amber-500" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 text-center pt-32">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full animate-ping opacity-25"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <SparklesIcon className="w-8 h-8 text-indigo-600 animate-pulse" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Pripravujem váš prehľad</h3>
        <p className="text-slate-500 animate-pulse font-medium">{loadingStep}</p>
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
          
          <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tight leading-tight">
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
            <span className="text-xs mt-2 block opacity-70">Mód: <span className="uppercase font-bold">{profile.selectedPersona}</span></span>
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
        <header className="sticky top-0 z-20 px-6 py-4 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                Dnešný súhrn
              </span>
            </div>
             <div className="flex items-center gap-2">
                {weather && (
                    <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                        {getWeatherIcon(weather)}
                        <span className="text-xs font-bold">{Math.round(weather.temperature)}°</span>
                    </div>
                )}
                {profile.streak > 0 && (
                   <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                     🔥 {profile.streak}
                   </span>
                 )}
            </div>
          </div>
          
          <h1 className="text-xl font-bold text-slate-900 leading-tight line-clamp-1">
            {digest.mainTitle}
          </h1>
        </header>

        {/* Scrollable Content */}
        <div className="p-6 space-y-8">
            
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
    </>
  );
};

export default DigestPage;