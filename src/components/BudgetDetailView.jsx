import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, CreditCard, ChevronDown, Trash2, Filter, Receipt, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

const BudgetDetailView = ({ 
    onBack, 
    selectedMonthDetail, 
    setSelectedMonthDetail, 
    monthlyBreakdown, 
    activeUsers, 
    activeAccounts, 
    activeTransactions, 
    userLimits,
    currentMonth,
    onDeleteTransaction,
    onUpdateTransaction
}) => {
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Swipe back logic
    const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
    const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchEnd - touchStart;
        const isSwipeRight = distance > 100;
        if (isSwipeRight) onBack();
        setTouchStart(null);
        setTouchEnd(null);
    };

    return (
        <div 
            className="fixed inset-0 bg-[#F2F4F8] dark:bg-slate-950 z-[100] flex flex-col animate-in slide-in-from-right duration-300"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Header */}
            <header className="px-6 pt-[calc(1rem+var(--safe-area-inset-top))] pb-4 flex items-center justify-between bg-white dark:bg-slate-950/50 border-b border-gray-100 dark:border-slate-800 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-center text-gray-500 active:scale-90 transition-transform"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                            {selectedMonthDetail ? 'Detaylar' : 'Bütçe Dönemleri'}
                        </h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {selectedMonthDetail ? 'Personel Harcamaları' : 'Aylık Özetler'}
                        </p>
                    </div>
                </div>
                {selectedMonthDetail && (
                    <button 
                        onClick={() => setSelectedMonthDetail(null)}
                        className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs border border-indigo-100 dark:border-indigo-900/30"
                    >
                        Tüm Dönemler
                    </button>
                )}
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                {!selectedMonthDetail ? (
                    // Month List View
                    <div className="space-y-4">
                        {monthlyBreakdown
                            .sort((a, b) => b.date.localeCompare(a.date))
                            .map(item => {
                                const dateObj = new Date(item.date + '-01');
                                const monthName = dateObj.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
                                const totalLimit = Object.values(userLimits).reduce((a, b) => a + b, 0);
                                const isOverLimit = item.total > totalLimit;
                                const isCurrent = item.date === currentMonth;

                                return (
                                    <div
                                        key={item.date}
                                        onClick={() => setSelectedMonthDetail({ monthKey: item.date, selectedUserId: activeUsers[0]?.id })}
                                        className={`p-6 rounded-[32px] border relative overflow-hidden group transition-all duration-300 cursor-pointer ${isCurrent
                                            ? 'bg-indigo-600 text-white border-transparent shadow-xl'
                                            : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-sm'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div>
                                                <h3 className={`font-black text-lg ${isCurrent ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{monthName}</h3>
                                                {isCurrent && <span className="text-[10px] font-black px-2 py-0.5 bg-white/20 text-white rounded-full">GÜNCEL DÖNEM</span>}
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-2xl font-black ${isOverLimit ? 'text-red-400' : (isCurrent ? 'text-white' : 'text-indigo-600 dark:text-indigo-400')}`}>
                                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(item.total)}
                                                </p>
                                                <p className={`text-[10px] font-bold ${isCurrent ? 'text-white/60' : 'text-gray-400'}`}>TOPLAM HARCAMA</p>
                                            </div>
                                        </div>

                                        <div className={`h-2 rounded-full overflow-hidden mb-5 relative z-10 ${isCurrent ? 'bg-white/10' : 'bg-gray-100 dark:bg-slate-800'}`}>
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${isOverLimit ? 'bg-red-400' : (isCurrent ? 'bg-white' : 'bg-indigo-500')}`}
                                                style={{ width: `${Math.min((item.total / totalLimit) * 100, 100)}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 relative z-10">
                                            {activeUsers.map(u => {
                                                const userAccs = activeAccounts.filter(a => a.userId === u.id).map(a => a.id);
                                                const userMonthTotal = activeTransactions
                                                    .filter(t => t.status === 1 && t.date.startsWith(item.date) && userAccs.includes(t.accountId))
                                                    .reduce((acc, curr) => acc + curr.amount, 0);

                                                if (userMonthTotal === 0) return null;

                                                return (
                                                    <div key={u.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isCurrent ? 'bg-white/10 border-white/10' : 'bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800 shadow-sm'}`}>
                                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white ${u.id === 'u1' ? (isCurrent ? 'bg-white/20' : 'bg-indigo-500') : (isCurrent ? 'bg-white/20' : 'bg-pink-500')}`}>
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <span className={`text-[10px] font-bold ${isCurrent ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                            {new Intl.NumberFormat('tr-TR', { notation: "compact", style: 'currency', currency: 'TRY' }).format(userMonthTotal)}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                ) : (
                    // Detail Person View
                    <div className="space-y-6">
                        {/* Filter Tabs */}
                        <div className="flex gap-2 sticky top-0 bg-[#F2F4F8] dark:bg-slate-950 z-10 pb-4 pt-1">
                            {activeUsers.map(u => {
                                const userAccs = activeAccounts.filter(a => a.userId === u.id).map(a => a.id);
                                const userMonthTotal = activeTransactions
                                    .filter(t => t.status === 1 && t.date.startsWith(selectedMonthDetail.monthKey) && userAccs.includes(t.accountId))
                                    .reduce((acc, curr) => acc + curr.amount, 0);
                                const isSelected = selectedMonthDetail.selectedUserId === u.id;

                                return (
                                    <button
                                        key={u.id}
                                        onClick={() => setSelectedMonthDetail({ ...selectedMonthDetail, selectedUserId: u.id })}
                                        className={`flex-1 p-3 rounded-2xl border transition-all duration-300 ${isSelected
                                            ? 'bg-indigo-600 text-white border-transparent shadow-lg scale-105'
                                            : 'bg-white dark:bg-slate-900 text-gray-400 border-gray-100 dark:border-slate-800'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{u.name}</span>
                                            <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(userMonthTotal)}
                                            </span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Transactions List */}
                        <div className="space-y-3">
                            {(() => {
                                const userAccs = activeAccounts.filter(a => a.userId === selectedMonthDetail.selectedUserId).map(a => a.id);
                                const filteredTransactions = activeTransactions
                                    .filter(t => t.status === 1 && t.date.startsWith(selectedMonthDetail.monthKey) && userAccs.includes(t.accountId))
                                    .sort((a, b) => b.date.localeCompare(a.date));

                                if (filteredTransactions.length === 0) {
                                    return (
                                        <div className="text-center py-20 text-gray-400">
                                            <Receipt size={40} className="mx-auto mb-3 opacity-20" />
                                            <p className="font-bold">Harcama bulunamadı</p>
                                        </div>
                                    )
                                }

                                return filteredTransactions.map(t => {
                                    const account = activeAccounts.find(a => a.id === t.accountId);
                                    return (
                                        <div key={t.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 flex items-center justify-between shadow-sm group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                    <CreditCard size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 dark:text-white leading-none mb-1.5">{t.description}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(t.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}</span>
                                                        <span className="w-1 h-1 bg-gray-200 dark:bg-slate-700 rounded-full"></span>
                                                        <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase">{account?.name || 'Bilinmeyen Kart'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="font-black text-slate-800 dark:text-white text-lg">
                                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(t.amount)}
                                                </p>
                                                <button 
                                                    onClick={() => {
                                                        if (window.confirm('Bu harcamayı silmek üzeresiniz. Onaylıyor musunuz?')) {
                                                            onDeleteTransaction(t.id);
                                                        }
                                                    }}
                                                    className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })
                            })()}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BudgetDetailView;
