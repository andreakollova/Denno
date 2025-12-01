import React, { useEffect, useState } from 'react';
import { DailyDigest, AppTab, DigestSection } from '../types';
import { getDigests } from '../services/storageService';
import DigestCard from '../components/DigestCard';
import ChatModal from '../components/ChatModal';

interface HistoryPageProps {
  onBack: () => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onBack }) => {
  const [digests, setDigests] = useState<DailyDigest[]>([]);
  const [selectedDigest, setSelectedDigest] = useState<DailyDigest | null>(null);
  const [activeChatSection, setActiveChatSection] = useState<DigestSection | null>(null);

  useEffect(() => {
    const data = getDigests();
    setDigests(data);
  }, []);

  if (selectedDigest) {
    return (
      <>
        <div className="animate-in slide-in-from-right duration-300">
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center shadow-sm">
            <button 
              onClick={() => setSelectedDigest(null)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="ml-2">
                <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {new Date(selectedDigest.date).toLocaleDateString('sk-SK')}
                </h2>
                <p className="text-sm font-bold text-slate-900 line-clamp-1">{selectedDigest.mainTitle}</p>
            </div>
          </div>
          
          <div className="px-6 py-6">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-6">
              {selectedDigest.mainTitle}
            </h1>
            
            {/* Busy Read Summary for History */}
             <div className="mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Rýchly súhrn
                </h3>
                <ul className="space-y-2">
                    {selectedDigest.busyRead.map((item, i) => (
                        <li key={i} className="text-sm text-slate-700 flex gap-2">
                             <span className="text-indigo-400">•</span>
                             {item.title}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="">
                {selectedDigest.sections.map((section, index) => (
                <DigestCard 
                    key={index} 
                    section={section} 
                    index={index} 
                    onAskMore={setActiveChatSection}
                />
                ))}
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
  }

  return (
    <div className="px-6 py-8 animate-in fade-in">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 sticky top-0 bg-white/95 backdrop-blur-md py-4 -mt-4 z-10">História</h1>

      {digests.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
          <p className="text-slate-400 font-medium">Zatiaľ žiadna história.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {digests.map((digest) => (
            <button
              key={digest.id}
              onClick={() => setSelectedDigest(digest)}
              className="w-full text-left bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 group-hover:bg-indigo-100"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                     {new Date(digest.date).toLocaleDateString('sk-SK')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-tight mb-2 group-hover:text-indigo-900 transition-colors">
                  {digest.mainTitle}
                </h3>
                <p className="text-slate-400 text-xs line-clamp-1 flex items-center">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-2"></span>
                  {digest.sections.length} tém
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;