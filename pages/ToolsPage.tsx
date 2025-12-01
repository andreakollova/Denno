import React, { useState } from 'react';
import { summarizeUrl } from '../services/geminiService';
import { getUserProfile } from '../services/storageService';
import { LinkIcon, SendIcon, BotIcon } from '../components/Icons';
import ReactMarkdown from 'react-markdown';

const ToolsPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="px-6 py-8 animate-in fade-in">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Nástroje</h1>
      <p className="text-slate-500 mb-8">Rýchle AI funkcie pre tvoju zvedavosť.</p>

      {/* Explain Link Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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
      
      {/* Placeholder for future tools */}
      <div className="mt-6 opacity-50 pointer-events-none grayscale">
         <div className="bg-white rounded-2xl p-6 border border-slate-100 border-dashed flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
               <span className="text-xl">🔍</span>
            </div>
            <h3 className="font-bold text-slate-800">AI Deep Search</h3>
            <p className="text-xs text-slate-400 mt-1">Už čoskoro...</p>
         </div>
      </div>
    </div>
  );
};

export default ToolsPage;