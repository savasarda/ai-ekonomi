import { X, Users, CreditCard, Trash2, ChevronRight, Settings, Gauge, LogOut, Share2, MessageCircle, Check } from 'lucide-react'
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'

export default function SettingsModal({
    isOpen,
    onClose,
    onOpenUsers,
    onOpenCards,
    onOpenLimit,
    onResetAll
}) {
    const { signOut, profile } = useAuth();
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
        <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-all" onClick={onClose}></div>
            <div className="bg-[#F8FAFC] dark:bg-slate-900 w-full sm:max-w-[400px] rounded-t-[40px] sm:rounded-[40px] p-8 relative z-10 animate-slide-up sm:animate-scale-up flex flex-col shadow-2xl border-t border-white/50 dark:border-slate-800/50">
                
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400">
                           <Settings size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">Yönetim</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                {profile?.families?.name || 'Sistem ve Veri Yönetimi'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Invite Code Section */}
                    {profile?.families?.invite_code && (
                        <div className="flex gap-2">
                            <button 
                                onClick={copyInviteCode}
                                className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between group hover:shadow-md transition-all active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm relative">
                                        {copied ? <Check size={24} className="text-green-500 animate-bounce" /> : <Share2 size={24} />}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-indigo-900 dark:text-indigo-100 italic tracking-[0.2em]">#{profile.families.invite_code}</p>
                                        <p className="text-[10px] text-indigo-400 font-bold uppercase">{copied ? 'Kopyalandı!' : 'Aile Davet Kodu'}</p>
                                    </div>
                                </div>
                            </button>
                            
                            <button 
                                onClick={shareToWhatsApp}
                                className="w-[72px] bg-green-50 dark:bg-green-900/20 rounded-3xl border border-green-100 dark:border-green-900/30 flex items-center justify-center text-green-600 hover:bg-green-100 transition-all active:scale-90 shadow-sm"
                                title="WhatsApp ile Paylaş"
                            >
                                <MessageCircle size={32} />
                            </button>
                        </div>
                    )}

                    <button 
                        onClick={() => { onOpenLimit(); onClose(); }}
                        className="w-full bg-white dark:bg-slate-800 p-5 rounded-3xl border border-gray-100 dark:border-slate-700 flex items-center justify-between group hover:border-orange-500 transition-all hover:shadow-lg active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <Gauge size={24} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-800 dark:text-white">Limitler</p>
                                <p className="text-[10px] text-gray-400 font-bold">Aylık harcama limitlerini ayarla</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
                    </button>

                    <button 
                        onClick={() => { onOpenUsers(); onClose(); }}
                        className="w-full bg-white dark:bg-slate-800 p-5 rounded-3xl border border-gray-100 dark:border-slate-700 flex items-center justify-between group hover:border-indigo-500 transition-all hover:shadow-lg active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Users size={24} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-800 dark:text-white">Kişiler</p>
                                <p className="text-[10px] text-gray-400 font-bold">Bütçe sahiplerini yönet</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                    </button>

                    <button 
                        onClick={() => { onOpenCards(); onClose(); }}
                        className="w-full bg-white dark:bg-slate-800 p-5 rounded-3xl border border-gray-100 dark:border-slate-700 flex items-center justify-between group hover:border-pink-500 transition-all hover:shadow-lg active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-pink-50 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center text-pink-600 dark:text-pink-400">
                                <CreditCard size={24} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-800 dark:text-white">Kartlar</p>
                                <p className="text-[10px] text-gray-400 font-bold">Ödeme yöntemlerini yönet</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-pink-500 transition-colors" />
                    </button>

                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800 space-y-3">
                        <button 
                            onClick={async () => { 
                                // Save to localStorage first
                                if (profile?.family_id) {
                                    const saved = JSON.parse(localStorage.getItem('saved_families') || '[]');
                                    if (!saved.find(f => f.family_id === profile.family_id)) {
                                        saved.push({
                                            family_id: profile.family_id,
                                            name: profile.families?.name || 'Kayıtlı Aile',
                                            invite_code: profile.families?.invite_code
                                        });
                                        localStorage.setItem('saved_families', JSON.stringify(saved));
                                    }
                                    // Update profile to detach from family
                                    await supabase.from('profiles').update({ family_id: null }).eq('id', profile.id);
                                    window.location.reload(); 
                                }
                            }}
                            className="w-full bg-white dark:bg-slate-800 p-5 rounded-3xl border border-gray-100 dark:border-slate-700 flex items-center justify-between group hover:border-blue-500 transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                                    <Users size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-800 dark:text-slate-200">Aileyi Değiştir</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Başka bir aile grubuna geç</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </button>

                        <button 
                            onClick={signOut}
                            className="w-full bg-white dark:bg-slate-800 p-5 rounded-3xl border border-gray-100 dark:border-slate-700 flex items-center justify-between group hover:border-slate-400 transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-750 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm">
                                    <LogOut size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-800 dark:text-slate-200">Çıkış Yap</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Oturumu sonlandır</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-slate-300" />
                        </button>

                        <button 
                            onClick={() => { onResetAll(); onClose(); }}
                            className="w-full bg-red-50 dark:bg-red-900/20 p-5 rounded-3xl border border-red-100 dark:border-red-900/30 flex items-center justify-between group hover:bg-red-100 transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
                                    <Trash2 size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-red-600">Sıfırla</p>
                                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Tüm verileri temizle</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-red-300 group-hover:text-red-500 transition-colors" />
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-50">AIEKONOMI PREMIUM v3.1</p>
                </div>
            </div>
        </div>
    )
}
