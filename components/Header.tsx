
import React from 'react';
import { WeatherData } from '../services/weatherService';
import { UserProfile } from '../types';
import { WeatherSunIcon, WeatherCloudIcon, WeatherRainIcon } from './Icons';

interface HeaderProps {
  weather: WeatherData | null;
  profile: UserProfile;
}

const Header: React.FC<HeaderProps> = ({ weather, profile }) => {
  
  const getWeatherIcon = (w: WeatherData) => {
      if (w.weatherCode >= 51) return <WeatherRainIcon className="w-4 h-4 text-indigo-400 mb-0.5" />;
      if (w.weatherCode > 2) return <WeatherCloudIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 mb-0.5" />;
      return <WeatherSunIcon className="w-4 h-4 text-amber-500" />;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center justify-between relative min-h-[60px] flex-shrink-0 transition-colors duration-300">
        
        {/* Logo Centered Absolutely */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <img src="https://cdn.shopify.com/s/files/1/0804/4226/1839/files/54325342.png?v=1764569599" alt="Logo" className="h-10 w-auto object-contain dark:brightness-0 dark:invert" />
        </div>
         
         {/* Left side spacer */}
         <div></div>

         {/* Right: Status Icons */}
         <div className="flex items-center justify-end gap-2 z-10">
            {weather && (
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-full h-7">
                    {getWeatherIcon(weather)}
                    <span className="text-xs font-bold leading-none mt-0.5">{Math.round(weather.temperature)}°</span>
                </div>
            )}
            {profile.streak > 0 && (
               <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-500 border border-amber-100 dark:border-amber-900/30 px-2.5 py-1 rounded-full h-7">
                 <span className="leading-none text-sm">🔥</span>
                 <span className="leading-none mt-0.5">{profile.streak}</span>
               </span>
             )}
        </div>
    </header>
  );
};

export default Header;
