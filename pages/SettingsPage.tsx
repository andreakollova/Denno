
import React, { useState, useEffect } from 'react';
import { AVAILABLE_TOPICS, PERSONA_UI_DATA } from '../constants';
import { getSelectedTopicIds, saveSelectedTopicIds, getUserProfile, setPersona, saveUserProfile } from '../services/storageService';
import { CheckIcon, UserIcon, SparklesIcon, MapPinIcon, ChevronDownIcon, ChevronUpIcon } from '../components/Icons';
import { PersonaType } from '../types';

interface SettingsPageProps {
  onFinish?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onFinish }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPersona, setCurrentPersona] = useState<PersonaType>(PersonaType.DEFAULT);
  const [city, setCity] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    const profile = getUserProfile();
    setSelectedIds(getSelectedTopicIds());
    setCurrentPersona(profile.selectedPersona);
    setCity(profile.city || '');
    // Open the first category by default
    const firstCat = AVAILABLE_TOPICS[0].category;
    setExpandedCategories([firstCat]);
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

  return (
    <div className="px-6 py-8 pb-32">
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Nastavenia</h1>
        <p className="text-slate-500">Prispôsob si svoj denný prehľad.</p>
      </header>

      {/* Profile & Location Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          Profil & Preferencie
        </h2>

        {/* Location */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-indigo-500" />
            Moja Lokalita
          </label>
          <input 
            type="text" 
            value={city}
            onChange={handleCityChange}
            placeholder="napr. Bratislava"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium appearance-none outline-none focus:ring-2 focus:ring-indigo-500 relative z-10 pr-10"
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
          <div className="mt-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex gap-3 items-start">
             <span className="text-lg">💡</span>
             <p className="text-xs text-indigo-800 leading-relaxed font-medium pt-1">
               {PERSONA_UI_DATA[currentPersona]?.description}
             </p>
          </div>
        </div>
      </div>

      {/* Topics Section */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Sledované Témy
          </h2>
          <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">
            {selectedIds.length} vybraných
          </span>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedTopics).map(([category, topics]) => {
            const isExpanded = expandedCategories.includes(category);
            const selectedCount = topics.filter(t => selectedIds.includes(t.id)).length;
            
            return (
              <div key={category} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm transition-all duration-300">
                
                {/* Accordion Header */}
                <button 
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
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
                              flex items-center justify-between p-3 rounded-xl border text-left transition-all
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
                className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 transform active:scale-95 transition-all hover:bg-indigo-700"
              >
                <SparklesIcon className="w-5 h-5 text-indigo-300" />
                <span>Generovať Prehľad</span>
              </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
