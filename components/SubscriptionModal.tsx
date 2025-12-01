
import React, { useState } from 'react';
import { activateSubscription } from '../services/storageService';
import { SubscriptionPlan, SubscriptionStatus } from '../types';
import { CheckIcon, SparklesIcon } from './Icons';

interface SubscriptionModalProps {
  onSuccess: () => void;
  status: SubscriptionStatus;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onSuccess, status }) => {
  const [loading, setLoading] = useState<SubscriptionPlan | null>(null);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setLoading(plan);
    // Simulate API call
    setTimeout(() => {
        activateSubscription(plan);
        setLoading(null);
        onSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10 animate-in slide-in-from-bottom-10 duration-700">
        
        {/* Header */}
        <div className="text-center mb-8">
            <div className="inline-block p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4 shadow-inner">
                <SparklesIcon className="w-8 h-8 text-[#6466f1]" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                {status === SubscriptionStatus.EXPIRED ? 'Skúšobná doba skončila' : 'Odomknite plný potenciál'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
                Pokračujte v generovaní denných prehľadov.
            </p>
        </div>

        {/* Plan: Monthly */}
        <button 
            onClick={() => handleSubscribe(SubscriptionPlan.MONTHLY)}
            disabled={loading !== null}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm mb-4 hover:border-[#6466f1] dark:hover:border-[#6466f1] transition-all group text-left relative overflow-hidden"
        >
            <div className="flex justify-between items-center relative z-10">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Mesačne</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Flexibilná platba</p>
                </div>
                <div className="text-right">
                    <span className="block text-xl font-bold text-[#6466f1]">1,99 €</span>
                    <span className="text-xs text-slate-400">/ mesiac</span>
                </div>
            </div>
            {loading === SubscriptionPlan.MONTHLY && (
                <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-20">
                    <div className="w-5 h-5 border-2 border-[#6466f1] border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </button>

        {/* Plan: Yearly */}
        <button 
            onClick={() => handleSubscribe(SubscriptionPlan.YEARLY)}
            disabled={loading !== null}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-1 rounded-2xl shadow-xl shadow-indigo-500/20 mb-6 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
            <div className="bg-gradient-to-r from-[#6466f1] to-purple-600 dark:from-indigo-100 dark:to-white p-5 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-white/20 dark:bg-slate-900/10 text-white dark:text-slate-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                    NAJVÝHODNEJŠIE
                </div>
                
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-white dark:text-slate-900">Ročne</h3>
                        <p className="text-sm text-indigo-100 dark:text-slate-600">Ušetríte 12%</p>
                    </div>
                    <div className="text-right">
                        <span className="block text-xl font-bold text-white dark:text-slate-900">20,99 €</span>
                        <span className="text-xs text-indigo-100 dark:text-slate-600">/ rok</span>
                    </div>
                </div>
                
                {loading === SubscriptionPlan.YEARLY && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-20">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
        </button>

        {/* Features List */}
        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-5 mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Čo získate</h4>
            <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckIcon className="w-5 h-5 text-emerald-500" />
                    Neobmedzené denné prehľady
                </li>
                <li className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckIcon className="w-5 h-5 text-emerald-500" />
                    AI Chat Asistent ku každej správe
                </li>
                <li className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckIcon className="w-5 h-5 text-emerald-500" />
                    Pokročilé nástroje (Encyclopedia, Rýchlokurzy)
                </li>
            </ul>
        </div>
        
        <p className="text-center text-xs text-slate-400">
             7 dní zadarmo pri prvej registrácii. Zrušiť môžete kedykoľvek.
        </p>

      </div>
    </div>
  );
};

export default SubscriptionModal;
