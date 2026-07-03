import React, { useMemo, useState } from 'react';
import {
    Wallet, ShoppingCart, Sun, Moon, Sparkles,
    Calendar as CalendarIcon, Bell, ArrowRight,
    MessageSquare, Users
} from 'lucide-react';
import { translations } from '../i18n';

const menuItems = [
    { key: 'economy', icon: Wallet, color: 'indigo' },
    { key: 'needs', icon: ShoppingCart, color: 'pink' },
    { key: 'events', icon: CalendarIcon, color: 'orange', hasReminder: true },
    { key: 'family', icon: Users, color: 'emerald' }
];

const colorClasses = {
    indigo: {
        shadow: 'shadow-indigo-100/50',
        bg: 'bg-indigo-100 dark:bg-indigo-900/40',
        text: 'text-indigo-600 dark:text-indigo-400',
        hover: 'group-hover:bg-indigo-600 group-hover:text-white',
        arrow: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
    },
    pink: {
        shadow: 'shadow-pink-100/50',
        bg: 'bg-pink-100 dark:bg-pink-900/40',
        text: 'text-pink-600 dark:text-pink-400',
        hover: 'group-hover:bg-pink-600 group-hover:text-white',
        arrow: 'group-hover:text-pink-600 dark:group-hover:text-pink-400'
    },
    orange: {
        shadow: 'shadow-orange-100/50',
        bg: 'bg-orange-100 dark:bg-orange-900/40',
        text: 'text-orange-600 dark:text-orange-400',
        hover: 'group-hover:bg-orange-600 group-hover:text-white',
        arrow: 'group-hover:text-orange-600 dark:group-hover:text-orange-400'
    },
    emerald: {
        shadow: 'shadow-emerald-100/50',
        bg: 'bg-emerald-100 dark:bg-emerald-900/40',
        text: 'text-emerald-600 dark:text-emerald-400',
        hover: 'group-hover:bg-emerald-600 group-hover:text-white',
        arrow: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
    }
};

const WelcomeScreen = ({
    onNavigate,
    darkMode,
    toggleTheme,
    onCheckReminders,
    onShowFeedback,
    onOpenFamily,
    isFamilyAdmin,
    language = 'tr',
    setLanguage,
    showLanguagePrompt = false
}) => {
    const tips = translations.welcome.tips;
    const copy = translations.welcome.copy;
    const [tipIndex] = useState(() => Math.floor(Math.random() * tips.tr.length));
    const t = copy[language] || copy.tr;
    const currentTip = (tips[language] || tips.tr)[tipIndex % (tips[language] || tips.tr).length];
    const formattedDate = useMemo(() => {
        return new Date().toLocaleDateString(t.locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, [t.locale]);

    const handleMenuClick = (item) => {
        if (item.key === 'family') {
            onOpenFamily();
            return;
        }
        onNavigate(item.key);
    };

    if (showLanguagePrompt) {
        return (
            <div className="h-screen fixed inset-0 bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300/20 dark:bg-indigo-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-300/20 dark:bg-amber-900/10 rounded-full blur-[120px]"></div>
                <div className="w-full max-w-sm relative z-10 bg-white dark:bg-slate-900 rounded-[32px] border border-white dark:border-slate-800 shadow-2xl shadow-slate-200/60 dark:shadow-none p-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                        <Sparkles size={26} className="fill-current" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t.languagePromptTitle}</h1>
                    <p className="text-sm text-slate-400 dark:text-slate-500 font-semibold mt-2 mb-6">{t.languagePromptSub}</p>
                    <div className="grid grid-cols-1 gap-3">
                        <button
                            type="button"
                            onClick={() => setLanguage?.('tr')}
                            className="h-16 rounded-2xl bg-indigo-600 text-white font-black text-base shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98] transition-all"
                        >
                            Türkçe
                        </button>
                        <button
                            type="button"
                            onClick={() => setLanguage?.('en')}
                            className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-base active:scale-[0.98] transition-all"
                        >
                            English
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen fixed inset-0 bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300/20 dark:bg-indigo-900/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-300/20 dark:bg-amber-900/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <div className="w-full max-w-md md:max-w-[760px] relative z-10 flex flex-col h-full justify-center pt-8 pb-4 md:pt-16 md:pb-8 overflow-y-auto custom-scrollbar">
                <div className="flex gap-3 mb-4 md:mb-10 items-stretch">
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-[24px] md:rounded-[28px] p-4 md:p-5 shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 relative overflow-hidden flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">
                            <Sparkles size={14} className="fill-current" />
                            <span>{t.tipTitle}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug italic">"{currentTip}"</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-1 w-14 md:w-16 bg-white dark:bg-slate-900 rounded-[18px] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-1">
                            {['tr', 'en'].map(item => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setLanguage?.(item)}
                                    className={`h-6 rounded-xl text-[10px] font-black transition-all ${language === item ? 'bg-indigo-600 text-white' : 'text-slate-400 dark:text-slate-500'}`}
                                >
                                    {item.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="w-14 h-14 md:w-16 md:h-16 shrink-0 bg-white dark:bg-slate-900 rounded-[20px] md:rounded-[24px] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                        >
                            {darkMode ? <Sun size={28} className="text-yellow-400 fill-current" /> : <Moon size={28} className="text-indigo-600 fill-current" />}
                        </button>

                        <button
                            onClick={onShowFeedback}
                            className="w-14 h-14 md:w-16 md:h-16 shrink-0 bg-white dark:bg-slate-900 rounded-[20px] md:rounded-[24px] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-indigo-600 dark:text-indigo-400"
                        >
                            <MessageSquare size={28} />
                        </button>
                    </div>
                </div>

                <div className="text-center mb-6 md:mb-12 animate-slide-up">
                    <div className="inline-flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 text-sm md:text-xl font-black tracking-tight mb-2 md:mb-4 border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                        <CalendarIcon size={12} />
                        {formattedDate}
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-1 md:mb-2">
                        {t.hello} <span className="text-indigo-600 dark:text-indigo-400">{t.welcome}</span>
                        {isFamilyAdmin && (
                            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 tracking-wider uppercase">
                                {t.admin}
                            </span>
                        )}
                    </h1>
                    <p className="text-xs md:text-base text-gray-400 dark:text-gray-500 font-medium">{t.subtitle}</p>
                </div>

                <div className="flex flex-col gap-3 md:gap-4">
                    <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest px-4 mb-0 md:mb-1">{t.quickMenu}</p>

                    {menuItems.map(item => {
                        const Icon = item.icon;
                        const colors = colorClasses[item.color];
                        return (
                            <button
                                key={item.key}
                                onClick={() => handleMenuClick(item)}
                                className={`group bg-white dark:bg-slate-900 p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-xl ${colors.shadow} dark:shadow-none border border-white dark:border-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-4 md:gap-5`}
                            >
                                <div className={`w-12 h-12 md:w-14 md:h-14 ${colors.bg} rounded-xl md:rounded-2xl flex items-center justify-center ${colors.text} shadow-inner ${colors.hover} transition-all duration-500`}>
                                    <Icon size={24} className="md:w-7 md:h-7" />
                                </div>
                                <div className="text-left flex-1">
                                    <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white leading-tight">{t[item.key]}</h2>
                                    <p className="text-[10px] md:text-xs text-slate-400 font-medium italic mt-0.5">{t[`${item.key}Sub`]}</p>
                                </div>
                                {item.hasReminder && (
                                    <span
                                        onClick={(e) => { e.stopPropagation(); onCheckReminders(); }}
                                        className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl md:rounded-2xl flex items-center justify-center text-orange-500 hover:bg-orange-600 hover:text-white transition-all duration-300 border border-orange-100/50 dark:border-orange-800/30"
                                    >
                                        <Bell size={18} className="animate-pulse md:w-5 md:h-5" />
                                    </span>
                                )}
                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-slate-300 ${colors.arrow} transition-colors`}>
                                    <ArrowRight size={20} className="md:w-6 md:h-6" />
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 md:mt-auto pt-4 md:pt-8 flex items-center justify-center opacity-30 gap-6">
                    <div className="h-px bg-slate-300 dark:bg-slate-700 flex-1"></div>
                    <Sparkles size={16} className="text-indigo-400" />
                    <div className="h-px bg-slate-300 dark:bg-slate-700 flex-1"></div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
