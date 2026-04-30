import { X, Users, CreditCard, Trash2, ChevronRight, Settings, Gauge, LogOut, Share2, MessageCircle, Check, Bell, Loader2 } from 'lucide-react'
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'

export default function SettingsModal({
    isOpen,
    onClose,
    onOpenUsers,
    onOpenCards,
    onOpenLimit,
    onResetAll,
    isFamilyAdmin
}) {
    const { signOut, profile } = useAuth();
    const [copied, setCopied] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const [announcementText, setAnnouncementText] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSendAnnouncement = async () => {
        if (!announcementText.trim() || isSending) return;

        setIsSending(true);
        try {
            const { error } = await supabase
                .from('notification_queue')
                .insert({
                    family_id: profile.family_id,
                    sender_id: profile.id,
                    title: 'Aile Duyurusu',
                    message: announcementText.trim()
                });

            if (error) throw error;
            
            setSuccess(true);
            setAnnouncementText('');
            setTimeout(() => {
                setSuccess(false);
                setShowAnnouncement(false);
            }, 3000);
        } catch (err) {
            console.error('Duyuru gönderme hatası:', err);
            alert('Duyuru gönderilemedi. Lütfen tekrar deneyin.');
        } finally {
            setIsSending(false);
        }
    };
    
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

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${profile?.fcm_token ? 'bg-green-50 dark:bg-green-900/30 text-green-600' : 'bg-gray-50 dark:bg-slate-800 text-gray-400'}`}>
                                <Bell size={24} />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="font-bold text-gray-800 dark:text-white">Bildirim Durumu</p>
                                {profile?.fcm_token ? (
                                    <p className="text-[10px] text-gray-400 font-bold truncate">
                                        Aktif: {profile.fcm_token.substring(0, 15)}...
                                    </p>
                                ) : (
                                    <button 
                                        onClick={async () => {
                                            const { requestNotificationPermission } = await import('../../lib/firebase');
                                            const token = await requestNotificationPermission();
                                            if (token) {
                                                await supabase.from('profiles').update({ fcm_token: token }).eq('id', profile.id);
                                                window.location.reload();
                                            } else {
                                                alert("Bildirim izni alınamadı. Telefon ayarlarından uygulamanın bildirimlerine izin verdiğinizden emin olun.");
                                            }
                                        }}
                                        className="mt-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                                    >
                                        Bildirimleri Aç
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {isFamilyAdmin && (
                        <div className="pt-2">
                            {!showAnnouncement ? (
                                <button 
                                    onClick={() => setShowAnnouncement(true)}
                                    className="w-full bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between group hover:bg-indigo-100 transition-all active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                                            <MessageCircle size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-indigo-700 dark:text-indigo-400">Duyuru Gönder</p>
                                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Tüm aileye bildirim gider</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-indigo-300 group-hover:text-indigo-500 transition-colors" />
                                </button>
                            ) : (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-[32px] border border-indigo-100 dark:border-indigo-900/30 animate-in zoom-in-95 duration-200">
                                    <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                                        <MessageCircle size={16} />
                                        Aile Duyurusu
                                    </h4>
                                    <textarea
                                        value={announcementText}
                                        onChange={(e) => setAnnouncementText(e.target.value)}
                                        placeholder="Mesajınızı buraya yazın..."
                                        className="w-full bg-white dark:bg-slate-800 border-none rounded-2xl p-4 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 min-h-[100px] mb-3 resize-none shadow-inner"
                                    />
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setShowAnnouncement(false)}
                                            className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-700"
                                        >
                                            Vazgeç
                                        </button>
                                        <button 
                                            onClick={handleSendAnnouncement}
                                            disabled={!announcementText.trim() || isSending}
                                            className={`flex-[2] py-3 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${success ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'}`}
                                        >
                                            {isSending ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : success ? (
                                                <>
                                                    <Check size={18} />
                                                    Gönderildi!
                                                </>
                                            ) : (
                                                'Hemen Gönder'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800 space-y-3">

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
