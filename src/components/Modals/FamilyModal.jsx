import { X, Users, Share2, MessageCircle, Check, Gauge, UserPlus, Trash2, Edit2, ChevronRight, Hash, ShieldCheck, Settings } from 'lucide-react'
import { useState } from 'react';

export default function FamilyModal({
    isOpen,
    onClose,
    profile,
    activeUsers,
    userLimits,
    onUpdateLimit,
    onAddUser,
    onDeleteUser,
    onUpdateUserSymbol,
    onSwitchFamily
}) {
    const [copied, setCopied] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [activeTab, setActiveTab] = useState('members'); // 'members', 'limits', 'settings'

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
            <div className="bg-[#F8FAFC] dark:bg-slate-900 w-full sm:w-[500px] h-[92vh] md:h-[85vh] md:max-h-[850px] rounded-t-[40px] sm:rounded-[40px] p-0 relative z-10 animate-slide-up shadow-3xl flex flex-col pointer-events-auto border border-white/50 dark:border-slate-800/50 transition-colors overflow-hidden">
                
                {/* Header Section */}
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

                    {/* Invite Code Quick Card */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 flex items-center justify-between shadow-sm mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Hash size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Davet Kodu</p>
                                <p className="font-black text-gray-800 dark:text-white italic tracking-widest">#{profile?.families?.invite_code || '---'}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={copyInviteCode}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${copied ? 'bg-green-500 text-white' : 'bg-gray-50 dark:bg-slate-700 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
                            >
                                {copied ? <Check size={18} /> : <Share2 size={18} />}
                            </button>
                            <button 
                                onClick={shareToWhatsApp}
                                className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 hover:bg-green-100 transition-all"
                            >
                                <MessageCircle size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-gray-100 dark:bg-slate-850 p-1 rounded-2xl mb-2">
                        <button 
                            onClick={() => setActiveTab('members')}
                            className={`flex-1 py-3 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'members' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400'}`}
                        >
                            <Users size={14} /> Kişiler
                        </button>
                        <button 
                            onClick={() => setActiveTab('limits')}
                            className={`flex-1 py-3 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'limits' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400'}`}
                        >
                            <Gauge size={14} /> Limitler
                        </button>
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`flex-1 py-3 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'settings' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400'}`}
                        >
                            <Settings size={14} /> Ayarlar
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8">
                    {activeTab === 'members' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="space-y-3 mb-8">
                                {activeUsers.map(user => (
                                    <div key={user.id} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 flex justify-between items-center group transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${user.id === 'u1' ? 'bg-indigo-50 text-indigo-500' : 'bg-pink-50 text-pink-500'}`}>
                                                {user.symbol || user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-white text-base">{user.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Grup Üyesi</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => onDeleteUser(user.id)}
                                            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 opacity-60 hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-[32px] border border-indigo-100/50 dark:border-indigo-900/30">
                                <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-4 flex items-center gap-2">
                                    <UserPlus size={16} /> Yeni Üye Ekle
                                </h4>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="İsim girin..."
                                        className="flex-1 p-4 bg-white dark:bg-slate-800 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={newUserName}
                                        onChange={e => setNewUserName(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && (onAddUser(newUserName), setNewUserName(''))}
                                    />
                                    <button 
                                        onClick={() => { if(newUserName) { onAddUser(newUserName); setNewUserName(''); } }}
                                        className="bg-indigo-600 text-white w-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-90 transition-all"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'limits' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
                            {activeUsers.map(user => (
                                <div key={user.id} className="bg-white dark:bg-slate-800 p-5 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-xl">
                                                {user.symbol || user.name.charAt(0)}
                                            </div>
                                            <p className="font-bold text-gray-800 dark:text-white">{user.name}</p>
                                        </div>
                                        <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase">Limit Tanımla</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {[25000, 50000, 75000, 100000].map(amt => (
                                            <button 
                                                key={amt}
                                                onClick={() => onUpdateLimit(user.id, amt)}
                                                className={`py-3 rounded-2xl text-xs font-black border-2 transition-all ${userLimits[user.id] === amt ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-slate-750 border-transparent text-gray-500 hover:border-gray-200 dark:hover:border-slate-600'}`}
                                            >
                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amt)}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            placeholder="Özel tutar girin..."
                                            className="w-full p-4 pl-10 bg-gray-50 dark:bg-slate-900 rounded-2xl text-sm font-black border-none outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            value={userLimits[user.id] || ''}
                                            onChange={e => onUpdateLimit(user.id, parseInt(e.target.value) || 0)}
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-lg">₺</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
                            <button 
                                onClick={onSwitchFamily}
                                className="w-full bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-gray-100 dark:border-slate-700 flex items-center justify-between group hover:border-blue-500 transition-all active:scale-[0.98] shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Users size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-800 dark:text-white text-base">Aileyi Değiştir</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Başka bir gruba katıl veya yeni kur</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                            </button>

                            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-[32px] border border-yellow-100 dark:border-yellow-900/30">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <h4 className="font-bold text-yellow-900 dark:text-yellow-300 text-sm">Grup Güvenliği</h4>
                                </div>
                                <p className="text-xs text-yellow-700 dark:text-yellow-500 leading-relaxed font-medium">
                                    Davet kodunu paylaştığınız kişiler tüm harcama geçmişini görebilir ve yeni işlemler ekleyebilir. Kodu yalnızca güvendiğiniz aile üyeleriyle paylaşın.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-8 pt-0 text-center">
                    <p className="text-[10px] text-gray-300 dark:text-slate-600 font-black uppercase tracking-[0.3em]">Aile Yönetim Paneli v2.0</p>
                </div>
            </div>
        </div>
    );
}
