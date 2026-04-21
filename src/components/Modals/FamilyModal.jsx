import { X, Users, Share2, MessageCircle, Check, LogOut, RefreshCw, Hash, ShieldCheck, ChevronRight } from 'lucide-react'
import { useState } from 'react';

export default function FamilyModal({
    isOpen,
    onClose,
    profile,
    onSwitchFamily,
    onSignOut
}) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const copyInviteCode = () => {
        if (profile?.families?.invite_code) {
            navigator.clipboard.writeText(profile.families.invite_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareToWhatsApp = () => {
        if (profile?.families?.invite_code) {
            const text = `AIEkonomi aile grubumuza katıl! Davet kodumuz: #${profile.families.invite_code}`;
            const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(url, '_blank');
        }
    };

    return (
        <div className="absolute inset-0 z-[120] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md pointer-events-auto transition-opacity" onClick={onClose}></div>
            <div className="bg-[#F8FAFC] dark:bg-slate-900 w-full sm:w-[480px] rounded-t-[40px] sm:rounded-[40px] p-0 relative z-10 animate-slide-up shadow-3xl flex flex-col pointer-events-auto border border-white/50 dark:border-slate-800/50 transition-colors overflow-hidden">
                
                {/* Header */}
                <div className="p-8 pb-4">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">Aile Merkezi</h3>
                                <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">
                                    {profile?.families?.name || 'Aile Grubu'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 pb-10 space-y-4">
                    {/* Invite Code Card */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Hash size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Davet Kodu</p>
                                    <p className="font-black text-xl text-gray-800 dark:text-white italic tracking-widest">#{profile?.families?.invite_code || '---'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={copyInviteCode}
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${copied ? 'bg-green-500 text-white' : 'bg-gray-50 dark:bg-slate-700 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
                                >
                                    {copied ? <Check size={20} /> : <Share2 size={20} />}
                                </button>
                                <button 
                                    onClick={shareToWhatsApp}
                                    className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 hover:bg-green-100 transition-all"
                                >
                                    <MessageCircle size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex items-start gap-3">
                            <ShieldCheck size={16} className="text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-amber-700 dark:text-amber-500 leading-relaxed font-medium">
                                Bu kod ile üyeler ailenize katılabilir. Kodu yalnızca güvendiğiniz kişilerle paylaşın.
                            </p>
                        </div>
                    </div>

                    {/* Quick Settings Grid */}
                    <div className="grid grid-cols-1 gap-3">
                        <button 
                            onClick={onSwitchFamily}
                            className="w-full bg-white dark:bg-slate-800 p-5 rounded-[28px] border border-gray-100 dark:border-slate-700 flex items-center justify-between group hover:border-indigo-500 transition-all active:scale-[0.98] shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <RefreshCw size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-800 dark:text-white text-sm">Aileyi Değiştir</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">BAŞKA GRUBA GEÇ</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                        </button>

                        <button 
                            onClick={onSignOut}
                            className="w-full bg-red-50 dark:bg-red-900/10 p-5 rounded-[28px] border border-red-100 dark:border-red-900/20 flex items-center justify-between group hover:border-red-500 transition-all active:scale-[0.98] shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400">
                                    <LogOut size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-red-800 dark:text-red-200 text-sm">Oturumu Kapat</p>
                                    <p className="text-[10px] text-red-400 font-bold uppercase">GÜVENLİ ÇIKIŞ</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-red-300 group-hover:text-red-500 transition-colors" />
                        </button>
                    </div>
                </div>

                <div className="p-6 text-center border-t border-gray-100 dark:border-slate-800">
                    <p className="text-[9px] text-gray-300 dark:text-slate-600 font-black uppercase tracking-[0.3em] font-mono italic">AİLE YÖNETİM MERKEZİ</p>
                </div>
            </div>
        </div>
    );
}
