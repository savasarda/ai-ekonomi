
import React, { useState } from 'react';
import { 
    Wallet, ShoppingCart, Lightbulb, Sun, Moon, 
    Sparkles, Calendar as CalendarIcon, ChevronRight, 
    Bell, ArrowRight, User
} from 'lucide-react';

const financialTips = [
    "Harcamadan önce kendine şu soruyu sor: 'Buna gerçekten ihtiyacım var mı yoksa sadece istiyor muyum?'",
    "Maaş yatar yatmaz önce birikim için ayırdığın tutarı kenara koy, kalanı harca.",
    "Bozuk paraları küçümseme! Bir kumbara edin ve dolunca altına çevir.",
    "Aç karnına market alışverişine çıkma, gereksiz şeyler alma ihtimalin %60 artar.",
    "Aboneliklerini gözden geçir. Kullanmadığın dijital platformlara para ödeme.",
    "İndirim tuzağına düşme. %50 indirimli bir kazağa ihtiyacın yoksa, kazancın %50 değil, kaybın %50'dir.",
    "Acil durum fonu oluştur. Kenarda en az 3 aylık giderin kadar nakit bulundur."
];

const WelcomeScreen = ({ onNavigate, darkMode, toggleTheme, onCheckReminders }) => {
    const [currentTip] = useState(financialTips[Math.floor(Math.random() * financialTips.length)]);
    const today = new Date();
    const formattedDate = today.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="h-screen fixed inset-0 bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-300">

            {/* Background Blobs for Premium Feel */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300/20 dark:bg-indigo-900/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-300/20 dark:bg-amber-900/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <div className="w-full max-w-md md:max-w-[760px] relative z-10 flex flex-col h-full justify-center pt-8 pb-4 md:pt-16 md:pb-8 overflow-y-auto custom-scrollbar">
                
                {/* 1. Top Header Area: Tip + Theme Toggle */}
                <div className="flex gap-3 mb-4 md:mb-10 items-start">
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-[24px] md:rounded-[28px] p-4 md:p-5 shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 relative overflow-hidden">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">
                            <Sparkles size={14} className="fill-current" />
                            <span>Günün İpucu</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug italic">
                            "{currentTip}"
                        </p>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="w-14 h-14 md:w-16 md:h-16 shrink-0 bg-white dark:bg-slate-900 rounded-[20px] md:rounded-[24px] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                    >
                        {darkMode ? <Sun size={28} className="text-yellow-400 fill-current" /> : <Moon size={28} className="text-indigo-600 fill-current" />}
                    </button>
                </div>

                {/* 2. Welcome Greeting & Date */}
                <div className="text-center mb-6 md:mb-12 animate-slide-up">
                    <div className="inline-flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 text-sm md:text-xl font-black tracking-tight mb-2 md:mb-4 border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                        <CalendarIcon size={12} />
                        {formattedDate}
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-1 md:mb-2">
                        Merhaba, <span className="text-indigo-600 dark:text-indigo-400">Hoş Geldin!</span>
                    </h1>
                    <p className="text-xs md:text-base text-gray-400 dark:text-gray-500 font-medium">Finansal asistanın bugün senin için hazır.</p>
                </div>

                {/* 3. Main Action Menu (Horizontal Wide Buttons) */}
                <div className="flex flex-col gap-3 md:gap-4">
                    <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest px-4 mb-0 md:mb-1">Hızlı Menü</p>
                    
                    {/* Ekonomi */}
                    <button
                        onClick={() => onNavigate('economy')}
                        className="group bg-white dark:bg-slate-900 p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-xl shadow-indigo-100/50 dark:shadow-none border border-white dark:border-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-4 md:gap-5"
                    >
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                            <Wallet size={24} className="md:w-7 md:h-7" />
                        </div>
                        <div className="text-left flex-1">
                            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white leading-tight">Ekonomi</h2>
                            <p className="text-[10px] md:text-xs text-slate-400 font-medium italic mt-0.5">Gelir, gider ve birikim takibi</p>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            <ArrowRight size={20} className="md:w-6 md:h-6" />
                        </div>
                    </button>

                    {/* İhtiyaçlar */}
                    <button
                        onClick={() => onNavigate('needs')}
                        className="group bg-white dark:bg-slate-900 p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-xl shadow-pink-100/50 dark:shadow-none border border-white dark:border-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-4 md:gap-5"
                    >
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-pink-100 dark:bg-pink-900/40 rounded-xl md:rounded-2xl flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-inner group-hover:bg-pink-600 group-hover:text-white transition-all duration-500">
                            <ShoppingCart size={24} className="md:w-7 md:h-7" />
                        </div>
                        <div className="text-left flex-1">
                            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white leading-tight">İhtiyaçlar</h2>
                            <p className="text-[10px] md:text-xs text-slate-400 font-medium italic mt-0.5">Alışveriş ve gereksinim listesi</p>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-slate-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                            <ArrowRight size={20} className="md:w-6 md:h-6" />
                        </div>
                    </button>

                    {/* Etkinlikler */}
                    <div className="relative group">
                        <button
                            onClick={() => onNavigate('events')}
                            className="w-full bg-white dark:bg-slate-900 p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-xl shadow-orange-100/50 dark:shadow-none border border-white dark:border-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-4 md:gap-5"
                        >
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-100 dark:bg-orange-900/40 rounded-xl md:rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-inner group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
                                <CalendarIcon size={24} className="md:w-7 md:h-7" />
                            </div>
                            <div className="text-left flex-1">
                                <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white leading-tight">Etkinlikler</h2>
                                <p className="text-[10px] md:text-xs text-slate-400 font-medium italic mt-0.5">Takvim, planlar ve hatırlatıcılar</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {/* Separated Bell Button for Quick Access */}
                                <div 
                                    onClick={(e) => { e.stopPropagation(); onCheckReminders(); }}
                                    className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl md:rounded-2xl flex items-center justify-center text-orange-500 hover:bg-orange-600 hover:text-white transition-all duration-300 border border-orange-100/50 dark:border-orange-800/30"
                                >
                                    <Bell size={18} className="animate-pulse md:w-5 md:h-5" />
                                </div>
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-slate-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                    <ArrowRight size={20} className="md:w-6 md:h-6" />
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Footer simple version */}
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
