import React, { useState } from 'react';
import { Wallet, ShoppingCart, ArrowRight, Sparkles } from 'lucide-react';

const moods = [
    { emoji: "😎", text: "Patron Sensin!", subtext: "Yönetim sende.", color: "from-yellow-400 to-orange-500", shadow: "shadow-orange-200 dark:shadow-orange-900/20" },
    { emoji: "🚀", text: "Aya Çıkıyoruz!", subtext: "Hedefler yüksek.", color: "from-blue-400 to-indigo-500", shadow: "shadow-indigo-200 dark:shadow-indigo-900/20" },
    { emoji: "🤑", text: "Para Bizde!", subtext: "Bereketli bir gün.", color: "from-green-400 to-emerald-500", shadow: "shadow-emerald-200 dark:shadow-emerald-900/20" },
    { emoji: "🦄", text: "Sihirli Dokunuş", subtext: "Harikalar yarat.", color: "from-pink-400 to-rose-500", shadow: "shadow-pink-200 dark:shadow-pink-900/20" },
    { emoji: "🧘", text: "Zen Modu", subtext: "Sakin ve planlı.", color: "from-teal-400 to-cyan-500", shadow: "shadow-cyan-200 dark:shadow-cyan-900/20" },
    { emoji: "🔥", text: "Alev Alev", subtext: "Hız kesmek yok.", color: "from-red-400 to-orange-600", shadow: "shadow-red-200 dark:shadow-red-900/20" },
];

const WelcomeScreen = ({ onNavigate }) => {
    const [currentMood, setCurrentMood] = useState(moods[0]);

    const changeMood = () => {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * moods.length);
        } while (moods[newIndex].text === currentMood.text);
        setCurrentMood(moods[newIndex]);
    };

    return (
        <div className="h-screen fixed inset-0 bg-[#F2F4F8] dark:bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-300">

            {/* Background Blobs - Reused for consistency */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-[100px] animate-fade-in"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300/30 dark:bg-indigo-900/20 rounded-full blur-[100px] animate-fade-in delay-100"></div>

            <div className="w-full max-w-md relative z-10 flex flex-col gap-4">

                {/* Fun & Interactive Hero Card */}
                <div
                    onClick={changeMood}
                    className={`bg-gradient-to-br ${currentMood.color} rounded-[32px] p-6 text-white ${currentMood.shadow} shadow-2xl relative overflow-hidden cursor-pointer group active:scale-[0.98] transition-all duration-300 mb-2 select-none`}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-8 -mb-8"></div>

                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-wider mb-1">
                                <Sparkles size={14} className="animate-pulse" />
                                <span>Günün Modu</span>
                            </div>
                            <h1 className="text-3xl font-black tracking-tight mb-0.5">{currentMood.text}</h1>
                            <p className="text-white/80 font-medium text-sm">{currentMood.subtext}</p>
                        </div>
                        <div className="text-5xl filter drop-shadow-md transform group-hover:rotate-12 group-hover:scale-125 transition-transform duration-300">
                            {currentMood.emoji}
                        </div>
                    </div>
                </div>

                <div className="text-center mb-1">
                    <p className="text-gray-400 dark:text-gray-600 text-xs font-bold uppercase tracking-widest">Bir Seçim Yap</p>
                </div>

                <button
                    onClick={() => onNavigate('economy')}
                    className="group relative bg-white dark:bg-slate-900 p-5 rounded-[32px] shadow-2xl shadow-indigo-100 dark:shadow-slate-900/50 border border-white/50 dark:border-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-left overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-[100px] -mr-8 -mt-8 transition-colors"></div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-3 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                            <Wallet size={24} strokeWidth={2} />
                        </div>

                        <h2 className="text-xl font-black text-gray-800 dark:text-white mb-1 tracking-tight transition-colors">Ekonomi Yönetimi</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-3">Harcamalar, bütçeler ve altın portföyü.</p>

                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider group-hover:gap-3 transition-all">
                            <span>Giriş Yap</span>
                            <ArrowRight size={14} />
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => onNavigate('needs')}
                    className="group relative bg-white dark:bg-slate-900 p-5 rounded-[32px] shadow-2xl shadow-pink-100 dark:shadow-slate-900/50 border border-white/50 dark:border-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-left overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 dark:bg-pink-900/20 rounded-bl-[100px] -mr-8 -mt-8 transition-colors"></div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mb-3 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform duration-300">
                            <ShoppingCart size={24} strokeWidth={2} />
                        </div>

                        <h2 className="text-xl font-black text-gray-800 dark:text-white mb-1 tracking-tight transition-colors">İhtiyaç Listesi</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-3">Alışveriş ve eksikler listesi.</p>

                        <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-bold text-xs uppercase tracking-wider group-hover:gap-3 transition-all">
                            <span>Listeye Git</span>
                            <ArrowRight size={14} />
                        </div>
                    </div>
                </button>

            </div>
        </div>
    );
};

export default WelcomeScreen;
