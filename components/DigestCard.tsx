import React from 'react';
import { DigestSection } from '../types';
import { ChatIcon } from './Icons';

interface DigestCardProps {
  section: DigestSection;
  index: number;
  onAskMore?: (section: DigestSection) => void;
  onTagClick?: (tag: string) => void;
}

const DigestCard: React.FC<DigestCardProps> = ({ section, index, onAskMore, onTagClick }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl group">
      
      {/* Header with Badge */}
      <div className="relative h-14 border-b border-slate-50 bg-slate-50/30">
          {/* Index Badge */}
          <div className="absolute top-3 right-4 bg-slate-100 text-slate-500 text-xs font-bold w-8 h-8 flex items-center justify-center rounded-full shadow-sm">
            #{index + 1}
          </div>
          
          {/* Tags (Now Interactive) */}
          <div className="absolute top-4 left-6 flex flex-wrap gap-2 pr-12">
            {section.tags.map((tag, i) => (
              <button 
                key={i} 
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick && onTagClick(tag);
                }}
                className="px-2 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wide rounded-md hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 pt-6 space-y-5">
        
        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 leading-tight">
          {section.title}
        </h3>
        
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
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
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

        {onAskMore && (
          <button 
            onClick={() => onAskMore(section)}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-2xl border border-indigo-100 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100 font-bold text-sm transition-colors"
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