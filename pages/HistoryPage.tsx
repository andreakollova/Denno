
import React, { useEffect, useState } from 'react';
import { DailyDigest, DigestSection, SavedInsight } from '../types';
import { getDigests, getSavedInsights, removeInsight } from '../services/storageService';
import DigestCard from '../components/DigestCard';
import ChatModal from '../components/ChatModal';
import { CollectionIcon, BookmarkSolidIcon, NewspaperIcon, ChevronDownIcon, ChevronUpIcon } from '../components/Icons';

interface HistoryPageProps {
  onBack: () => void;
}

type ViewMode = 'digests' | 'saved';

const HistoryPage: React.FC<HistoryPageProps> = ({ onBack }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('digests');
  
  // Digests State
  const [digests, setDigests] = useState<DailyDigest[]>([]);
  const [selectedDigest, setSelectedDigest] = useState<DailyDigest | null>(null);
  
  // Saved Insights State
  const [savedInsights, setSavedInsights] = useState<SavedInsight[]>([]);
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);

  // Common State
  const [activeChatSection, setActiveChatSection] = useState<DigestSection | null>(null);

  useEffect(() => {
    setDigests(getDigests());
    setSavedInsights(getSavedInsights());
  }, [viewMode]); // Reload when switching tabs

  const handleRemoveSaved = (id: string) => {
    removeInsight(id);
    setSavedInsights(prev => prev.filter(i => i.id !== id));
  };

  // --- DETAIL VIEW FOR DIGEST ---
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

  // --- MAIN LIST VIEW (TABS) ---
  return (
    <div className="px-6 py-8 animate-in fade-in pb-24">
      <div className="sticky top-0 bg-white/95 backdrop-blur-md py-4 -mt-4 z-10 flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Uložené</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
        <button 
           onClick={() => setViewMode('digests')}
           className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'digests' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
           <NewspaperIcon className="w-4 h-4" />
           Prehľady
        </button>
        <button 
           onClick={() => setViewMode('saved')}
           className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'saved' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
           <BookmarkSolidIcon className="w-4 h-4" />
           Knižnica
        </button>
      </div>

      {/* View: Digests List */}
      {viewMode === 'digests' && (
        <>
          {digests.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-medium">Zatiaľ žiadne denné prehľady.</p>
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
        </>
      )}

      {/* View: Saved Insights Library */}
      {viewMode === 'saved' && (
         <>
           {savedInsights.length === 0 ? (
             <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
               <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookmarkSolidIcon className="w-6 h-6 text-slate-400" />
               </div>
               <p className="text-slate-500 font-medium">Knižnica je prázdna.</p>
               <p className="text-xs text-slate-400 mt-2">Ukladaj si zaujímavé karty z denného prehľadu.</p>
             </div>
           ) : (
             <div className="space-y-4">
                {savedInsights.map((item, index) => {
                  const isExpanded = expandedInsightId === item.id;
                  return (
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                       <button
                         onClick={() => setExpandedInsightId(isExpanded ? null : item.id)}
                         className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-slate-50/50 transition-colors"
                       >
                          <div className="flex-1 pr-4">
                             <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  {new Date(item.sourceDigestDate).toLocaleDateString('sk-SK')}
                                </span>
                             </div>
                             <h3 className={`font-bold text-slate-800 text-sm leading-snug ${isExpanded ? 'text-indigo-600' : ''}`}>
                               {item.section.title}
                             </h3>
                          </div>
                          <div className="text-slate-400 flex-shrink-0 ml-2">
                             {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                          </div>
                       </button>

                       {isExpanded && (
                          <div className="p-2 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top-2">
                              {/* Embed the DigestCard without default margins */}
                              <DigestCard 
                                 section={item.section} 
                                 index={index} 
                                 onAskMore={setActiveChatSection}
                                 onToggleSave={() => handleRemoveSaved(item.id)}
                                 isSaved={true}
                                 className="mb-0 border-none shadow-none"
                              />
                          </div>
                       )}
                    </div>
                  );
                })}
             </div>
           )}
         </>
      )}

      {activeChatSection && (
          <ChatModal 
            section={activeChatSection} 
            onClose={() => setActiveChatSection(null)} 
          />
      )}

    </div>
  );
};

export default HistoryPage;
