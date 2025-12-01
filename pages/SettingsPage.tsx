import React, { useState, useEffect } from 'react';
import { AVAILABLE_TOPICS, PERSONA_UI_DATA } from '../constants';
import { getSelectedTopicIds, saveSelectedTopicIds, getUserProfile, setPersona, saveUserProfile } from '../services/storageService';
import { CheckIcon, UserIcon, SparklesIcon } from '../components/Icons';
import { PersonaType } from '../types';

interface SettingsPageProps {
  onFinish?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onFinish }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPersona, setCurrentPersona] = useState<PersonaType>(PersonaType.DEFAULT);
  const [city, setCity] = useState<string>('');

  useEffect(() => {
    const profile = getUserProfile();
    setSelectedIds(getSelectedTopicIds());
    setCurrentPersona(profile.selectedPersona);
    setCity(profile.city || '');
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
      
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Nastavenia</h1>
      <p className="text-slate-500 mb-8">Prispôsob si svoj zážitok.</p>

      {/* Location Section */}
      <section className="mb-8">
         <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
           Moja Lokalita
         </h2>
         <input 
           type="text" 
           value={city}
           onChange={handleCityChange}
           placeholder="napr. Bratislava"
           className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
         />
         <p className="text-xs text-slate-400 mt-2 ml-1">Používa sa pre zobrazenie počasia.</p>
      </section>

      {/* Persona Section - Dropdown */}
      <section className="mb-10">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center">
          <UserIcon className="w-4 h-4 mr-2" />
          Osobnosť AI (Mood)
        </h2>
        
        <div className="bg-white rounded-xl border border-slate-200 p-1 relative">
           <select 
            value={currentPersona} 
            onChange={handlePersonaChange}
            className="w-full bg-transparent p-3 text-slate-900 font-bold outline-none appearance-none relative z-10"
           >
             {Object.entries(PERSONA_UI_DATA).map(([key, data]) => (
               <option key={key} value={key}>
                 {data.label}
               </option>
             ))}
           </select>
           {/* Custom arrow for styling */}
           <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none z-0">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
           </div>
        </div>
        
        {/* Description Below */}
        <div className="mt-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex gap-3 items-start animate-in fade-in duration-300">
           <div className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
             <span className="text-xs font-bold">i</span>
           </div>
           <p className="text-sm text-slate-600 leading-relaxed">
             {PERSONA_UI_DATA[currentPersona]?.description}
           </p>
        </div>
      </section>

      {/* Topics Section */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Sledované Témy
          </h2>
          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">
            {selectedIds.length} vybraných
          </span>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedTopics).map(([category, topics]) => (
            <div key={category} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">{category}</h3>
              </div>
              
              <div className="divide-y divide-slate-50">
                {topics.map((topic) => {
                  const isSelected = selectedIds.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      onClick={() => toggleTopic(topic.id)}
                      className={`
                        w-full flex items-center justify-between p-4 transition-colors hover:bg-slate-50
                        ${isSelected ? 'bg-indigo-50/30' : ''}
                      `}
                    >
                      <span className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                        {topic.name}
                      </span>
                      
                      <div className={`
                        w-5 h-5 rounded border flex items-center justify-center transition-colors
                        ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}
                      `}>
                        {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
      
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