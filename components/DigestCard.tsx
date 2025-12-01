import React from 'react';
import { DigestSection } from '../types';
import { ChatIcon } from './Icons';

interface DigestCardProps {
  section: DigestSection;
  index: number;
  onAskMore?: (section: DigestSection) => void;
}

const DigestCard: React.FC<DigestCardProps> = ({ section, index, onAskMore }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6 transition-all duration-300 hover:shadow-md group">
      {/* Header */}
      <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex justify-between items-start">
        <h3 className="text-lg font-bold text-slate-900 leading-tight pr-4">
          <span className="text-indigo-600 mr-2">#{index + 1}</span>
          {section.title}
        </h3>
      </div>
      
      <div className="p-5 space-y-5">
        
        {/* What Is New */}
        <div>
          <h4 className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
            Čo je nové
          </h4>
          <p className="text-slate-800 leading-relaxed text-sm font-medium">
            {section.whatIsNew}
          </p>
        </div>

        {/* What Changed */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <h4 className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
            Čo sa zmenilo
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed">
            {section.whatChanged}
          </p>
        </div>

        {/* What To Watch */}
        <div className="relative pl-4 border-l-2 border-indigo-500">
          <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            Na čo sa zamerať
          </h4>
          <p className="text-sm text-slate-700 italic">
            "{section.whatToWatch}"
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          {section.tags.map((tag, i) => (
             <span key={i} className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wide rounded-md">
               {tag}
             </span>
          ))}
        </div>

        {onAskMore && (
          <button 
            onClick={() => onAskMore(section)}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-indigo-100 text-indigo-600 bg-white hover:bg-indigo-50 font-medium text-sm transition-colors"
          >
            <ChatIcon className="w-4 h-4" />
            Vysvetliť / Opýtať sa AI
          </button>
        )}
      </div>
    </div>
  );
};

export default DigestCard;
