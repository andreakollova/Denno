import React, { useState, useEffect } from 'react';
import { summarizeUrl, generateLearningPack } from '../services/geminiService';
import { getUserProfile, getDigests } from '../services/storageService';
import { LinkIcon, SendIcon, BotIcon, CloudIcon, AcademicIcon } from '../components/Icons';
import { LearningPack } from '../types';
import ReactMarkdown from 'react-markdown';

const ToolsPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Learning Pack State
  const [learnTopic, setLearnTopic] = useState('');
  const [learningPack, setLearningPack] = useState<LearningPack | null>(null);
  const [learningLoading, setLearningLoading] = useState(false);

  // Word Cloud State
  const [wordCloud, setWordCloud] = useState<{word: string, count: number}[]>([]);

  useEffect(() => {
    // Generate Word Cloud from latest digest
    const digests = getDigests();
    if (digests.length > 0) {
      const today = digests[0];
      // Collect text from today's digest
      let text = today.mainTitle + " " + today.oneSentenceOverview + " ";
      today.sections.forEach(s => {
        text += s.title + " " + s.whatIsNew + " " + s.whatChanged + " " + s.tags.join(" ") + " ";
      });

      // Simple frequency counter
      const words = text.toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
        .split(/\s+/);
      
      const stopWords = new Set(['a', 'v', 'sa', 'na', 'je', 'o', 'do', 'pre', 'z', 'k', 's', 'ako', 'že', 'to', 'alebo', 'článku', 'ktorý', 'sú', 'ale', 'aj', 'po', 'za', 'bude', 'si', 'čo', 'už', 'len', 'pri', 'od', 'cez', 'tento', 'táto', 'toto', 'kde', 'keď', 'kto', 'tak']);
      
      const counts: Record<string, number> = {};
      words.forEach(w => {
        if (w.length > 3 && !stopWords.has(w)) {
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

  const handleCreateLearningPack = async () => {
    if (!learnTopic || learningLoading) return;
    setLearningLoading(true);
    setLearningPack(null);
    try {
      const profile = getUserProfile();
      const pack = await generateLearningPack(learnTopic, profile.selectedPersona);
      setLearningPack(pack);
    } catch (e) {
      alert("Nepodarilo sa vytvoriť rýchlokurz.");
    } finally {
      setLearningLoading(false);
    }
  }

  return (
    <div className="px-6 py-8 animate-in fade-in pb-32">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Nástroje</h1>
      <p className="text-slate-500 mb-8">Rýchle AI funkcie pre tvoju zvedavosť.</p>

      {/* Feature 42: Word Cloud */}
      {wordCloud.length > 0 && (
         <div className="mb-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CloudIcon className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-lg text-slate-900">Trendy týždňa (Word Cloud)</h2>
            </div>
            <div className="flex flex-wrap gap-2 justify-center items-center py-4">
               {wordCloud.map((item, idx) => {
                  // Dynamic sizing based on rank
                  const sizeClasses = idx < 3 ? 'text-2xl font-black text-indigo-600' : 
                                      idx < 7 ? 'text-lg font-bold text-indigo-500/80' : 
                                      'text-sm font-medium text-slate-400';
                  return (
                    <span key={item.word} className={`${sizeClasses} px-2`}>
                       {item.word}
                    </span>
                  )
               })}
            </div>
         </div>
      )}

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

      {/* Feature 44: Fast Learning Packs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <AcademicIcon className="w-5 h-5 text-indigo-300" />
            <h2 className="font-bold text-lg">Fast Learning Packs</h2>
          </div>
          <p className="text-slate-400 text-sm">
            Zadaj tému a získaj "10-minútový rýchlokurz" s kvízom.
          </p>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6">
             <input 
              type="text" 
              placeholder="napr. Kvantová fyzika, NFT..."
              value={learnTopic}
              onChange={(e) => setLearnTopic(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
             <button 
              onClick={handleCreateLearningPack}
              disabled={learningLoading || !learnTopic}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-colors font-bold text-sm"
            >
              {learningLoading ? '...' : 'Vytvoriť'}
            </button>
          </div>

          {learningPack && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2">
               
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
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default ToolsPage;