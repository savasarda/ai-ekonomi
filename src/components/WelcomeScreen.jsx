import React, { useState } from 'react';
import { Wallet, ShoppingCart, ArrowRight, Lightbulb, RefreshCw, Sun, Moon, Sparkles } from 'lucide-react';

const triviaList = [
    { text: "Dünyadaki tüm altınlar eritilse, sadece 21 metrelik bir küp oluşturur. (Olimpik bir havuzdan bile küçük!)", source: "Altın Gerçeği" },
    { text: "İlk kredi kartı 1950'de, Frank McNamara cüzdanını unuttuğu bir akşam yemeği sonrası 'Diners Club' olarak icat edildi.", source: "Finans Tarihi" },
    { text: "Bal, bakteri barındırmadığı için asla bozulmayan tek besindir. Mısır piramitlerinde 3000 yıllık yenebilir bal bulunmuştur.", source: "Genel Kültür" },
    { text: "Monopoly oyununda basılan para miktarı, her yıl ABD Darphanesi'nin bastığı gerçek paradan daha fazladır.", source: "Oyun Dünyası" },
    { text: "Google'ın orijinal adı 'Backrub' (Sırt Masajı) idi. Neyse ki değiştirdiler!", source: "Teknoloji" },
    { text: "Bir karınca kendi ağırlığının 50 katını kaldırabilir. Bu, bir insanın bir kamyonu kaldırmasına eşdeğerdir.", source: "Doğa" },
    { text: "Ketçap 1830'larda ilaç olarak satılıyordu. (İshal tedavisinde kullanılırdı!)", source: "Tarih" },
    { text: "Zürafaların ses telleri yoktur. İletişim kurmak için titreşimleri kullanırlar.", source: "Hayvanlar Alemi" },
    { text: "Amazon'un logosundaki ok A'dan Z'ye gider, bu da 'her şeyi satıyoruz' mesajını verir.", source: "Markalar" },
    { text: "Kredi kartı numaranızdaki rakamlar rastgele değildir. İlk rakam kartın türünü (Visa 4, Mastercard 5) belirler.", source: "Finans" }
];

const financialTips = [
    "Harcamadan önce kendine şu soruyu sor: 'Buna gerçekten ihtiyacım var mı yoksa sadece istiyor muyum?'",
    "Maaş yatar yatmaz önce birikim için ayırdığın tutarı kenara koy, kalanı harca.",
    "Bozuk paraları küçümseme! Bir kumbara edin ve dolunca altına çevir.",
    "Aç karnına market alışverişine çıkma, gereksiz şeyler alma ihtimalin %60 artar.",
    "Aboneliklerini gözden geçir. Kullanmadığın dijital platformlara para ödeme.",
    "İndirim tuzağına düşme. %50 indirimli bir kazağa ihtiyacın yoksa, kazancın %50 değil, kaybın %50'dir.",
    "Acil durum fonu oluştur. Kenarda en az 3 aylık giderin kadar nakit bulundur."
];

const WelcomeScreen = ({ onNavigate, darkMode, toggleTheme }) => {
    const [currentTrivia, setCurrentTrivia] = useState(triviaList[Math.floor(Math.random() * triviaList.length)]);
    const [currentTip] = useState(financialTips[Math.floor(Math.random() * financialTips.length)]);
    const [isAnimating, setIsAnimating] = useState(false);

    const changeTrivia = () => {
        setIsAnimating(true);
        setTimeout(() => {
            let newTrivia;
            do {
                newTrivia = triviaList[Math.floor(Math.random() * triviaList.length)];
            } while (newTrivia.text === currentTrivia.text);

            setCurrentTrivia(newTrivia);
            setIsAnimating(false);
        }, 300);
    };

    return (
        <div className="h-screen fixed inset-0 bg-[#F2F4F8] dark:bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-300">

            {/* Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-300/30 dark:bg-yellow-900/20 rounded-full blur-[100px] animate-fade-in"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-300/30 dark:bg-teal-900/20 rounded-full blur-[100px] animate-fade-in delay-100"></div>

            <div className="w-full max-w-md relative z-10 flex flex-col gap-3">

                {/* 1. Trivia Card (Full Width) */}
                <div
                    onClick={changeTrivia}
                    className="bg-white dark:bg-slate-900 rounded-[28px] p-5 shadow-xl shadow-yellow-100 dark:shadow-yellow-900/10 border border-white/50 dark:border-slate-800 relative overflow-hidden cursor-pointer group active:scale-[0.98] transition-all duration-300 min-h-[140px] flex flex-col justify-center"
                >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-150 duration-500"></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 text-xs font-bold uppercase tracking-wider">
                                <Lightbulb size={16} className="fill-current" />
                                <span>Biliyor muydunuz?</span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                {currentTrivia.source}
                            </div>
                        </div>

                        <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                            <p className="text-base font-medium text-slate-800 dark:text-white leading-relaxed">
                                "{currentTrivia.text}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Row: Tip + Theme Toggle */}
                <div className="flex gap-3">

                    {/* Financial Tip (Left - Flexible) */}
                    <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/10 rounded-[24px] p-4 border border-emerald-100 dark:border-emerald-900/20 relative overflow-hidden flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                            <Sparkles size={12} className="fill-current" />
                            <span>Günün İpucu</span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-100 leading-tight">
                            {currentTip}
                        </p>
                    </div>

                    {/* Theme Toggle (Right - Fixed Square) */}
                    <button
                        onClick={toggleTheme}
                        className="w-[88px] shrink-0 bg-white dark:bg-slate-900 rounded-[24px] border border-white/50 dark:border-slate-800 shadow-lg flex flex-col items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all text-slate-600 dark:text-slate-300"
                    >
                        {darkMode ? <Sun size={24} className="text-yellow-400 fill-current animate-spin-slow" /> : <Moon size={24} className="text-indigo-500 fill-current" />}
                        <span className="text-[10px] font-bold uppercase">{darkMode ? 'Aydınlık' : 'Karanlık'}</span>
                    </button>

                </div>

                <div className="text-center mt-1 mb-1">
                    <p className="text-gray-400 dark:text-gray-600 text-xs font-bold uppercase tracking-widest">Menü</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => onNavigate('economy')}
                        className="group bg-white dark:bg-slate-900 p-4 rounded-[28px] shadow-xl shadow-indigo-100 dark:shadow-slate-900/30 border border-white/50 dark:border-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex flex-col items-center text-center py-6"
                    >
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-3 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                            <Wallet size={24} strokeWidth={2} />
                        </div>
                        <h2 className="text-base font-bold text-gray-800 dark:text-white leading-tight">Ekonomi</h2>
                    </button>

                    <button
                        onClick={() => onNavigate('needs')}
                        className="group bg-white dark:bg-slate-900 p-4 rounded-[28px] shadow-xl shadow-pink-100 dark:shadow-slate-900/30 border border-white/50 dark:border-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex flex-col items-center text-center py-6"
                    >
                        <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center mb-3 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform duration-300">
                            <ShoppingCart size={24} strokeWidth={2} />
                        </div>
                        <h2 className="text-base font-bold text-gray-800 dark:text-white leading-tight">İhtiyaçlar</h2>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default WelcomeScreen;
