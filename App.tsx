import React, { useState } from 'react';
import { AppTab } from './types';
import DigestPage from './pages/DigestPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import ToolsPage from './pages/ToolsPage';
import { NewspaperIcon, HistoryIcon, SettingsIcon, SearchIcon } from './components/Icons';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DIGEST);
  const [autoStartDigest, setAutoStartDigest] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DIGEST:
        return <DigestPage 
                  changeTab={setActiveTab} 
                  autoStart={autoStartDigest}
                  onAutoStartConsumed={() => setAutoStartDigest(false)}
               />;
      case AppTab.HISTORY:
        return <HistoryPage onBack={() => setActiveTab(AppTab.DIGEST)} />;
      case AppTab.TOOLS:
        return <ToolsPage />;
      case AppTab.SETTINGS:
        return <SettingsPage onFinish={() => {
            setAutoStartDigest(true);
            setActiveTab(AppTab.DIGEST);
        }} />;
      default:
        return <DigestPage changeTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 flex justify-center">
      
      {/* Mobile App Container */}
      <div className="w-full max-w-md h-[100dvh] bg-white shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden relative">
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth bg-white relative">
          {renderContent()}
        </main>

        {/* Bottom Navigation (Always Visible, Non-Overlapping) */}
        <nav className="flex-shrink-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 px-6 py-4 flex justify-between items-center z-50">
          
          <button 
            onClick={() => setActiveTab(AppTab.DIGEST)}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === AppTab.DIGEST ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <NewspaperIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-wide">Prehľad</span>
          </button>

          <button 
            onClick={() => setActiveTab(AppTab.HISTORY)}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === AppTab.HISTORY ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <HistoryIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-wide">História</span>
          </button>
          
          <button 
            onClick={() => setActiveTab(AppTab.TOOLS)}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === AppTab.TOOLS ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <SearchIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-wide">Nástroje</span>
          </button>

          <button 
            onClick={() => setActiveTab(AppTab.SETTINGS)}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === AppTab.SETTINGS ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <SettingsIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-wide">Nastavenia</span>
          </button>

        </nav>
      </div>

    </div>
  );
};

export default App;