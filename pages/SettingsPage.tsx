
import React, { useState, useEffect } from 'react';
import { AVAILABLE_TOPICS, PERSONA_UI_DATA } from '../constants';
import { getSelectedTopicIds, saveSelectedTopicIds, getUserProfile, setPersona, saveUserProfile } from '../services/storageService';
import { CheckIcon, UserIcon, SparklesIcon, MapPinIcon, ChevronDownIcon, ChevronUpIcon, SettingsIcon, XIcon } from '../components/Icons';
import { PersonaType } from '../types';

interface SettingsPageProps {
  onFinish?: () => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'Slovensko': '🇸🇰',
  'Veda a budúcnosť': '🧬',
  'Šport a zábava': '⚽',
  'AI a tech core': '🤖',
  'Biznis a práca': '💼',
  'Spoločnosť': '🌍',
  'Lifestyle': '🧘'
};

const SettingsPage: React.FC<SettingsPageProps> = ({ onFinish }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPersona, setCurrentPersona] = useState<PersonaType>(PersonaType.DEFAULT);
  const [city, setCity] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isTopExpanded, setIsTopExpanded] = useState(true);

  useEffect(() => {
    const profile = getUserProfile();
    setSelectedIds(getSelectedTopicIds());
    setCurrentPersona(profile.selectedPersona);
    setCity(profile.city || '');
    
    // Set default expanded category (NOT Slovensko)
    // 'AI a tech core' seems like a good default for an AI app
    setExpandedCategories(['AI a tech core']); 
  }, []);

  const toggleTopic = (id: string) => {
    let newIds;
    if (selectedIds.includes(id)) {
      newIds = selectedIds.filter(tid => tid !== id);
    } else {
      newIds = [...selectedIds, id];
    }
    setSelectedIds(newIds);
    saveSelectedTopicIds(newIds);
  };

  const handlePersonaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPersona = e.target.value as PersonaType;
    setCurrentPersona(newPersona);
    setPersona(newPersona);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCity = e.target.value;
    setCity(newCity);
    const profile = getUserProfile();
    saveUserProfile({ ...profile, city: newCity });
  };

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  // Group topics by category
  const groupedTopics = AVAILABLE_TOPICS.reduce((acc, topic) => {
    if (!acc[topic.category]) {
      acc[topic.category] = [];
    }
    acc[topic.category].push(topic);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_TOPICS>);

  // Defines IDs for the "TOP" selection
  // Added 'science' and 'slovakia_domestic' as requested
  const topTopicIds = ['slovakia_domestic', 'ai_tech', 'science', 'economy', 'politics', 'health_longevity', 'sport_football'];
  const topTopics = AVAILABLE_TOPICS.filter(t => topTopicIds.includes(t.id));

  return (
    <div className="px-6 py-8 pb-32 animate-in fade-in">
      
      <header className="mb-6 flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 mb-1">Nastavenia</h1>
           <p className="text-slate-500 text-sm">Prispôsob si svoj denný prehľad.</p>
        </div>
        <button 
          onClick={() => setShowProfileModal(true)}
          className="p-3 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
          title="Profil a preferencie"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </header>

      {/* Topics Section (Immediately Visible) */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Sledované témy
          </h2>
          <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">
            {selectedIds.length} vybraných
          </span>
        </div>

        <div className="space-y-4">
          
          {/* TOP Selection Card (Collapsible) */}
          <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden mb-6 transition-all duration-300">
            <button 
              onClick={() => setIsTopExpanded(!isTopExpanded)}
              className="w-full px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-50 flex items-center justify-between"
            >
               <div className="flex items-center gap-2">
                 <span className="text-lg">🔥</span>
                 <h3 className="text-sm font-bold text-indigo-900">TOP Výber</h3>
               </div>
               <div className="text-indigo-300">
                  {isTopExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
               </div>
            </button>
            
            {isTopExpanded && (
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-2">
                 {topTopics.map((topic) => {
                    const isSelected = selectedIds.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        onClick={() => toggleTopic(topic.id)}
                        className={`
                          flex items-center justify-between p-3 rounded-lg border text-left transition-all
                          ${isSelected 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                            : 'bg-white border-slate-100 hover:border-indigo-200 text-slate-700'}
                        `}
                      >
                        <span className="text-xs font-bold">
                          {topic.name}
                        </span>
                        {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                      </button>
                    );
                 })}
              </div>
            )}
          </div>

          {/* Categories Accordions */}
          {Object.entries(groupedTopics).map(([category, topics]) => {
            const isExpanded = expandedCategories.includes(category);
            const selectedCount = topics.filter(t => selectedIds.includes(t.id)).length;
            const emoji = CATEGORY_EMOJIS[category] || '📂';
            
            return (
              <div key={category} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm transition-all duration-300">
                
                {/* Accordion Header */}
                <button 
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                     <span className="text-lg">{emoji}</span>
                     <span className={`text-sm font-bold ${selectedCount > 0 ? 'text-indigo-900' : 'text-slate-700'}`}>
                       {category}
                     </span>
                     {selectedCount > 0 && (
                        <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {selectedCount}
                        </span>
                     )}
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                  </div>
                </button>
                
                {/* Accordion Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-200">
                    <div className="h-px bg-slate-50 mb-4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {topics.map((topic) => {
                        const isSelected = selectedIds.includes(topic.id);
                        return (
                          <button
                            key={topic.id}
                            onClick={() => toggleTopic(topic.id)}
                            className={`
                              flex items-center justify-between p-3 rounded-lg border text-left transition-all
                              ${isSelected 
                                ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                                : 'bg-white border-slate-100 hover:border-slate-300'}
                            `}
                          >
                            <span className={`text-xs font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`}>
                              {topic.name}
                            </span>
                            
                            <div className={`
                              w-5 h-5 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ml-2
                              ${isSelected ? 'bg-indigo-600' : 'bg-slate-100 text-slate-300'}
                            `}>
                              {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-slate-400 mb-6">
        Všetky zmeny sa ukladajú automaticky.
      </div>

      {/* Sticky Bottom Action Button */}
      {selectedIds.length > 0 && onFinish && (
        <div className="fixed bottom-24 left-0 right-0 px-6 z-40 animate-in slide-in-from-bottom-4 duration-500 pointer-events-none flex justify-center">
            <div className="w-full max-w-md pointer-events-auto">
              <button 
                onClick={onFinish}
                className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 transform active:scale-95 transition-all hover:bg-indigo-700"
              >
                <SparklesIcon className="w-5 h-5 text-indigo-300" />
                <span>Generovať prehľad</span>
              </button>
            </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {showProfileModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowProfileModal(false)}></div>
            <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
               
               <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">Profil a preferencie</h3>
                  <button onClick={() => setShowProfileModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50">
                     <XIcon className="w-5 h-5" />
                  </button>
               </div>

               <div className="p-6">
                  {/* Location */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-indigo-500" />
                      Moja lokalita
                    </label>
                    <input 
                      type="text" 
                      value={city}
                      onChange={handleCityChange}
                      placeholder="napr. Bratislava"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  {/* Persona */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-indigo-500" />
                      Osobnosť AI (Mood)
                    </label>
                    <div className="relative">
                      <select 
                        value={currentPersona} 
                        onChange={handlePersonaChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 font-medium appearance-none outline-none focus:ring-2 focus:ring-indigo-500 relative z-10 pr-10"
                      >
                        {Object.entries(PERSONA_UI_DATA).map(([key, data]) => (
                          <option key={key} value={key}>
                            {data.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                        <ChevronDownIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex gap-3 items-start">
                      <span className="text-lg">💡</span>
                      <p className="text-xs text-indigo-800 leading-relaxed font-medium pt-1">
                        {PERSONA_UI_DATA[currentPersona]?.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                     <button 
                       onClick={() => setShowProfileModal(false)}
                       className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
                     >
                       Hotovo
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default SettingsPage;
