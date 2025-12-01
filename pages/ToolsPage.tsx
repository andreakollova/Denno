
import React, { useState, useEffect } from 'react';
import { summarizeUrl, generateLearningPack, explainTerm } from '../services/geminiService';
import { getUserProfile, getDigests } from '../services/storageService';
import { LinkIcon, SendIcon, BotIcon, CloudIcon, AcademicIcon, SparklesIcon, XIcon, BookIcon, RefreshIcon, ChevronDownIcon } from '../components/Icons';
import { LearningPack } from '../types';
import ReactMarkdown from 'react-markdown';

// Categorized topics to ensure variety on every refresh
const TOPIC_CATEGORIES = {
  "Tech & AI": [
    "Umelá inteligencia", "Neurónové siete", "Blockchain", "Web3", "Kyberbezpečnosť", 
    "Metaverse", "Kvantové počítanie", "Smart Contracts", "Internet vecí (IoT)", 
    "Rozšírená realita (AR)", "Deepfakes", "Big Data", "Cloud Computing", "5G siete",
    "Generatívne umenie", "Autonómne vozidlá", "Etika AI"
  ],
  "Veda & Vesmír": [
    "Kvantová fyzika", "CRISPR", "Epigenetika", "Teória relativity", "Čierne diery", 
    "Termodynamika", "Entropia", "Mikrobióm", "Syntetická biológia", "Fúzna energia", 
    "Temná hmota", "Astrobiológia", "Nanotechnológie", "Kmeňové bunky", "Neuroveda"
  ],
  "Filozofia & Myslenie": [
    "Stoicizmus", "Nihilizmus", "Utilitarizmus", "Kritické myslenie", "Teória hier", 
    "Logické klamy", "Efektívny altruizmus", "Epistemológia", "Etika cnosti", 
    "Existenicializmus", "Daoizmus", "Meditácia", "Vedomie (Consciousness)"
  ],
  "Biznis & Ekonomika": [
    "Makroekonómia", "Inflácia", "Finančná gramotnosť", "Paretov princíp (80/20)", 
    "Zložené úročenie", "Pasívny príjem", "Behaviorálna ekonómia", "Startupy", 
    "Marketingová psychológia", "Agile metodika", "Time Management", "Deep Work"
  ],
  "Psychológia & Zdravie": [
    "Dopamínový detox", "Flow state", "Neuroplasticita", "Cirkadiánny rytmus", 
    "Biohacking", "Dlhovekosť (Longevity)", "Emočná inteligencia", "Kognitívne skreslenia", 
    "Ego", "Mindfulness", "Psychológia davu", "Reč tela", "Placebo efekt"
  ],
  "História & Kultúra": [
    "História umenia", "Renesancia", "Hodvábna cesta", "Antický Rím", 
    "Priemyselná revolúcia", "Architektúra", "Minimalizmus", "Postmodernizmus", 
    "Mytológia", "Lingvistika", "Geopolitika"
  ]
};

const SLOVAK_STOP_WORDS = new Set([
  'a', 'aby', 'aj', 'ako', 'ak', 'ani', 'asi', 'ale', 'alebo', 'bude', 'budú', 'bol', 'bola', 'bolo', 'boli', 
  'by', 'cez', 'čo', 'či', 'ďalšie', 'do', 'dnes', 'ešte', 'ho', 'hoci', 'iba', 'ich', 'iné', 'ja', 'je', 'jeho', 
  'jej', 'im', 'kam', 'kde', 'keď', 'kto', 'ktorý', 'ktorá', 'ktoré', 'ku', 'lebo', 'len', 'ma', 'mať', 'má', 
  'medzi', 'mne', 'mnou', 'musí', 'možno', 'môže', 'my', 'na', 'nad', 'nám', 'náš', 'naša', 'nech', 'nie', 
  'nové', 'nový', 'nová', 'nami', 'o', 'od', 'okolo', 'on', 'ona', 'ono', 'oni', 'ony', 'po', 'pod', 'pre', 
  'pred', 'pri', 'proti', 'prvý', 'prvá', 'prvé', 's', 'sa', 'si', 'som', 'svoj', 'svoja', 'svoje', 'sme', 
  'sú', 'tak', 'takže', 'tam', 'ten', 'tá', 'to', 'tí', 'tie', 'tento', 'táto', 'toto', 'teda', 'tebe', 
  'tebou', 'tvoj', 'tvoja', 'tvoje', 'tu', 'ty', 'už', 'v', 'vám', 'váš', 'vaša', 'vaše', 'viac', 'však', 
  'všetko', 'všetci', 'vy', 'z', 'za', 'zo', 'že', 'článku', 'podľa', 'medzi', 'veľmi', 'roku', 'roka'
]);

const ToolsPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Learning Pack State
  const [learnTopic, setLearnTopic] = useState('');
  const [learningPack, setLearningPack] = useState<LearningPack | null>(null);
  const [learningLoading, setLearningLoading] = useState(false);
  const [displayedPacks, setDisplayedPacks] = useState<string[]>([]);

  // Word Cloud State
  const [wordCloud, setWordCloud] = useState<{word: string, count: number}[]>([]);
  
  // Definition Modal State
  const [defTerm, setDefTerm] = useState<string | null>(null);
  const [defContent, setDefContent] = useState<string | null>(null);
  const [defLoading, setDefLoading] = useState(false);

  useEffect(() => {
    refreshPacks();
    
    // Generate Word Cloud from latest digest
    const digests = getDigests();
    if (digests.length > 0) {
      const today = digests[0];
      // Collect text from today's digest
      let text = today.mainTitle + " " + today.oneSentenceOverview + " ";
      today.sections.forEach(s => {
        text += s.title + " " + s.whatIsNew + " " + s.whatChanged + " " + s.tags.join(" ") + " ";
      });

      // Tokenize
      const words = text.toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()"?]/g, "")
        .split(/\s+/);
      
      const counts: Record<string, number> = {};
      
      words.forEach(w => {
        // Filter: Must be longer than 4 chars and NOT in stop words
        // This heuristic usually catches more complex/interesting nouns
        if (w.length > 4 && !SLOVAK_STOP_WORDS.has(w) && !/^\d+$/.test(w)) {
           counts[w] = (counts[w] || 0) + 1;
        }
      });

      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15) // Top 15 words
        .map(([word, count]) => ({ word, count }));
      
      setWordCloud(sorted);
    }
  }, []);

  const refreshPacks = () => {
    // Smart shuffle: Pick 1-2 items from EACH category to ensure variety
    const newSelection: string[] = [];
    
    Object.values(TOPIC_CATEGORIES).forEach(categoryItems => {
        // Shuffle the category items
        const shuffledCategory = [...categoryItems].sort(() => 0.5 - Math.random());
        // Take top 2 from this category
        newSelection.push(...shuffledCategory.slice(0, 2));
    });

    // Shuffle the final mix and take top 10
    const finalMix = newSelection.sort(() => 0.5 - Math.random()).slice(0, 10);
    setDisplayedPacks(finalMix);
  };

  const handleExplain = async () => {
    if (!url || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const profile = getUserProfile();
      const summary = await summarizeUrl(url, profile.selectedPersona);
      setResult(summary);
    } catch (e) {
      setResult("Nepodarilo sa spracovať odkaz.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLearningPack = async (topicOverride?: string) => {
    const topicToUse = topicOverride || learnTopic;
    if (!topicToUse || learningLoading) return;
    
    // Update input if clicked from popular list
    if (topicOverride) setLearnTopic(topicOverride);

    setLearningLoading(true);
    setLearningPack(null);
    try {
      const profile = getUserProfile();
      const pack = await generateLearningPack(topicToUse, profile.selectedPersona);
      setLearningPack(pack);
    } catch (e) {
      alert("Nepodarilo sa vytvoriť rýchlokurz.");
    } finally {
      setLearningLoading(false);
    }
  };

  const resetLearning = () => {
    setLearningPack(null);
    setLearnTopic('');
  };

  const handleWordClick = async (word: string) => {
    setDefTerm(word);
    setDefContent(null);
    setDefLoading(true);
    try {
      const profile = getUserProfile();
      const explanation = await explainTerm(word, profile.selectedPersona);
      setDefContent(explanation);
    } catch (e) {
      setDefContent("Nepodarilo sa načítať definíciu.");
    } finally {
      setDefLoading(false);
    }
  };

  const closeDefModal = () => {
    setDefTerm(null);
    setDefContent(null);
  };

  return (
    <div className="px-6 py-8 animate-in fade-in pb-32">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Nástroje</h1>
      <p className="text-slate-500 mb-8">Rýchle AI funkcie pre tvoju zvedavosť.</p>

      {/* Feature 42: Word Cloud */}
      {wordCloud.length > 0 && (
         <div className="mb-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CloudIcon className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-lg text-slate-900">Trendy týždňa</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
               Klikni na slovo pre rýchle vysvetlenie pojmu.
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center items-center py-2">
               {wordCloud.map((item, idx) => {
                  // Dynamic sizing based on rank
                  const sizeClasses = idx < 3 ? 'text-2xl font-black text-indigo-600' : 
                                      idx < 7 ? 'text-lg font-bold text-indigo-500/80' : 
                                      'text-sm font-medium text-slate-400';
                  return (
                    <button 
                      key={item.word} 
                      onClick={() => handleWordClick(item.word)}
                      className={`${sizeClasses} hover:scale-110 hover:text-indigo-400 transition-all cursor-pointer capitalize`}
                    >
                       {item.word}
                    </button>
                  )
               })}
            </div>
         </div>
      )}

      {/* Feature 44: Fast Learning Packs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="bg-slate-900 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <AcademicIcon className="w-5 h-5 text-indigo-300" />
            <h2 className="font-bold text-lg">AI Rýchlokurzy</h2>
          </div>
          <p className="text-slate-400 text-sm">
            Zadaj tému a získaj štruktúrovaný "10-minútový rýchlokurz".
          </p>
        </div>

        <div className="p-6">
          {!learningPack && (
            <div className="flex gap-2 mb-6">
               <input 
                type="text" 
                placeholder="napr. Kvantová fyzika, NFT..."
                value={learnTopic}
                onChange={(e) => setLearnTopic(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
               <button 
                onClick={() => handleCreateLearningPack()}
                disabled={learningLoading || !learnTopic}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-colors font-bold text-sm"
              >
                {learningLoading ? '...' : 'Vytvoriť'}
              </button>
            </div>
          )}

          {/* Popular Packs Selection */}
          {!learningPack && !learningLoading && (
            <div className="mb-2">
               <div className="flex items-center justify-between mb-3">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Populárne témy</p>
                 <button 
                   onClick={refreshPacks}
                   className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1 text-xs font-bold bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 hover:bg-indigo-50 hover:border-indigo-100"
                   title="Nové témy"
                 >
                   <RefreshIcon className="w-3 h-3" />
                   Obmeniť
                 </button>
               </div>
               <div className="flex flex-wrap gap-2">
                  {displayedPacks.map(topic => (
                    <button 
                      key={topic}
                      onClick={() => handleCreateLearningPack(topic)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-lg text-xs font-bold transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
               </div>
            </div>
          )}

          {/* Loading State */}
          {learningLoading && !learningPack && (
             <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <SparklesIcon className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm font-medium text-slate-500 animate-pulse">
                   AI profesor pripravuje tvoj kurz...
                </p>
             </div>
          )}

          {/* Result View */}
          {learningPack && (
            <div className="animate-in slide-in-from-bottom-4">
               
               <button 
                 onClick={resetLearning}
                 className="mb-6 flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-2 rounded-lg self-start transition-colors"
               >
                 <span className="text-lg leading-none">←</span> Späť na výber
               </button>

               <div className="space-y-6">
                   
                   {/* 1. Definition */}
                   <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                      <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">Definícia</h3>
                      <p className="text-lg font-bold text-slate-900">{learningPack.definition}</p>
                   </div>

                   {/* 2. Key Concepts */}
                   <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Kľúčové koncepty</h3>
                      <div className="space-y-3">
                         {learningPack.keyConcepts.map((concept, i) => (
                            <div key={i} className="flex gap-3 bg-white p-3 rounded-xl border border-slate-100">
                               <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>
                               <span className="text-sm text-slate-700">{concept}</span>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* 3. History */}
                   <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">História v skratke</h3>
                       <p className="text-sm text-slate-600 leading-relaxed">{learningPack.history}</p>
                   </div>

                   {/* 4. Future */}
                   <div className="relative pl-4 border-l-4 border-indigo-500">
                       <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">Budúcnosť</h3>
                       <p className="text-sm text-slate-700 italic">"{learningPack.futureOutlook}"</p>
                   </div>

                   {/* 5. Quiz */}
                   <div className="bg-slate-900 text-white p-5 rounded-2xl">
                       <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wide mb-2">Rýchly Kvíz</h3>
                       <p className="font-medium mb-4">{learningPack.quizQuestion}</p>
                       <div className="text-xs text-white/50 text-center uppercase tracking-widest border-t border-white/10 pt-4">
                          Odpovedz si sám pre seba :)
                       </div>
                   </div>

                   <button 
                     onClick={resetLearning}
                     className="w-full py-4 text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors border border-dashed border-slate-200 hover:border-indigo-200"
                   >
                     Nová téma
                   </button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Explain Link Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="w-5 h-5 text-indigo-100" />
            <h2 className="font-bold text-lg">Vysvetliť odkaz</h2>
          </div>
          <p className="text-indigo-100 text-sm">
            Vlož link na článok a AI ti ho okamžite zhrnie v tvojom obľúbenom štýle.
          </p>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <input 
              type="url" 
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button 
              onClick={handleExplain}
              disabled={loading || !url}
              className="bg-slate-900 text-white p-3 rounded-xl disabled:opacity-50 hover:bg-slate-800 transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <SendIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {result && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 mb-3">
                <BotIcon className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-400 uppercase">AI Zhrnutie</span>
              </div>
              <div className="prose prose-sm text-slate-700 leading-relaxed">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Word Definition Modal */}
      {defTerm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeDefModal}></div>
           <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="bg-indigo-600 p-4 flex justify-between items-start">
                 <div className="flex items-center gap-2 text-white">
                    <BookIcon className="w-5 h-5 text-indigo-200" />
                    <h3 className="font-bold text-lg">AI Slovník</h3>
                 </div>
                 <button onClick={closeDefModal} className="text-white/70 hover:text-white">
                    <XIcon className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-6">
                 <h2 className="text-2xl font-black text-slate-900 mb-4 capitalize">{defTerm}</h2>
                 
                 {defLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                       <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                       <p className="text-sm text-slate-500">Analyzujem pojem...</p>
                    </div>
                 ) : (
                    <div className="prose prose-sm text-slate-700 leading-relaxed max-h-60 overflow-y-auto pr-2">
                       <ReactMarkdown>{defContent || ""}</ReactMarkdown>
                    </div>
                 )}
                 
                 <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center">
                    <button onClick={closeDefModal} className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors">
                       Zavrieť
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
      
    </div>
  );
};

export default ToolsPage;
