
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
    X, Clock, TrendingUp, TrendingDown, ChevronDown, 
    Plus, Minus, AlertTriangle, RefreshCw, Sparkles, 
    RotateCcw, Trash2, ArrowLeft, Wallet, Coins, 
    BarChart3, Calendar, List, Edit3, Package, PlusCircle, Star
} from 'lucide-react';

export default function PortfolioView({
    onBack,
    portfolio,
    setPortfolio,
    goldPrices,
    goldFetchError,
    fetchGoldPrices,
    lastUpdateTime,
    isSupabaseConfigured
}) {
    const [showHistory, setShowHistory] = useState(false);
    const [portfolioHistory, setPortfolioHistory] = useState([]);
    const [expandedLogId, setExpandedLogId] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, logId: null });
    const [priceOverrideModal, setPriceOverrideModal] = useState({ isOpen: false, itemId: null, label: '', currentPrice: 0 });
    const [deleteCustomModal, setDeleteCustomModal] = useState({ isOpen: false, item: null });
    const [addCustomModal, setAddCustomModal] = useState(false);
    const [newCustomName, setNewCustomName] = useState('');
    const [newCustomValue, setNewCustomValue] = useState('');
    const [newManualPrice, setNewManualPrice] = useState('');

    useEffect(() => {
        if (showHistory) {
            handleFetchHistory();
        }
    }, [showHistory]);

    const handleFetchHistory = async () => {
        if (!isSupabaseConfigured) return;
        try {
            const { data: logs, error } = await supabase
                .from('portfolio_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(30);

            if (error) throw error;
            if (logs) setPortfolioHistory(logs);
        } catch (e) {
            console.error("Error fetching history:", e);
        }
    };

    const confirmDeleteLog = async () => {
        if (!deleteConfirmation.logId) return;

        try {
            const { error } = await supabase
                .from('portfolio_logs')
                .delete()
                .eq('id', deleteConfirmation.logId);

            if (error) throw error;

            setPortfolioHistory(prev => prev.filter(log => log.id !== deleteConfirmation.logId));
            setDeleteConfirmation({ isOpen: false, logId: null });
        } catch (error) {
            console.error('Error deleting log:', error);
            alert('Kayıt silinirken bir hata oluştu.');
        }
    };

    const getPrice = (key, rawPrices) => {
        // First check manual override
        if (portfolio.customPrices && portfolio.customPrices[key]) {
            return portfolio.customPrices[key];
        }

        if (key === 'gram22') {
            const hasAltinRaw = rawPrices?.['gram-has-altin']?.['Alış'] || "0";
            const hasAltinVal = parseFloat(String(hasAltinRaw).replace(/\./g, '').replace(',', '.')) || 0;
            return hasAltinVal * 0.916;
        }

        let priceKey = '';
        switch (key) {
            case 'gram': priceKey = 'gram-altin'; break;
            case 'ceyrek': priceKey = 'ceyrek-altin'; break;
            case 'yarim': priceKey = 'yarim-altin'; break;
            case 'tam': priceKey = 'tam-altin'; break;
            case 'cumhuriyet': priceKey = 'cumhuriyet-altini'; break;
            case 'ethereum': priceKey = 'ethereum'; break;
            case 'usd': priceKey = 'USD'; break;
            case 'eur': priceKey = 'EUR'; break;
        }
        let rawPrice = rawPrices?.[priceKey]?.Alış || "0";
        rawPrice = String(rawPrice).replace(/\./g, '').replace(',', '.');
        return parseFloat(rawPrice) || 0;
    };

    const calculateTotal = (items, prices) => {
        if (!items || !prices) return 0;
        const baseTotal = Object.keys(items || {}).reduce((acc, key) => {
            if (key === 'custom' || key === 'customPrices') return acc;
            const qty = items?.[key] || 0;
            return acc + (qty * getPrice(key, prices));
        }, 0);
        
        const customTotal = (items.custom || []).reduce((acc, i) => acc + (parseFloat(i.value) || 0), 0);
        
        return baseTotal + customTotal;
    };

    const currentTotal = calculateTotal(portfolio.items, goldPrices);
    const dayDiff = portfolio.lastTotal > 0 ? currentTotal - portfolio.lastTotal : 0;
    const isProfit = dayDiff >= 0;

    return (
        <div className="min-h-screen bg-[#F2F4F8] dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center p-0 md:p-8 font-sans relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-[100px] animate-fade-in"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300/30 dark:bg-indigo-900/20 rounded-full blur-[100px] animate-fade-in delay-100"></div>

            <div className="w-full max-w-[480px] md:max-w-[760px] bg-[#F8FAFC] dark:bg-slate-950 h-screen md:h-[92vh] md:max-h-[1000px] md:rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col md:border-[8px] md:border-white dark:md:border-slate-800 ring-1 ring-black/5 z-10 transition-colors duration-300">
            
            {/* Background Decor */}
            <div className="absolute top-[-5%] left-[-10%] w-[400px] h-[400px] bg-yellow-400/10 dark:bg-yellow-900/10 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[10%] right-[-5%] w-[350px] h-[350px] bg-indigo-400/10 dark:bg-indigo-900/10 rounded-full blur-[80px]"></div>

            {/* Header */}
            <header className="px-6 pt-12 pb-6 sticky top-0 z-30 bg-[#F2F4F8]/80 dark:bg-slate-950/80 backdrop-blur-md">
                {(() => {
                    return (
                        <>
                            <div className="flex items-center justify-between mb-2">
                                <button 
                                    onClick={onBack}
                                    className="w-10 h-10 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-center text-gray-500 active:scale-90 transition-transform"
                                >
                                    <ArrowLeft size={20} strokeWidth={2.5} />
                                </button>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setShowHistory(!showHistory)}
                                        className={`px-4 h-10 rounded-xl shadow-sm border flex items-center gap-2 font-bold text-xs transition-all ${showHistory ? 'bg-indigo-600 text-white border-transparent' : 'bg-white dark:bg-slate-950 text-gray-500 border-gray-100 dark:border-slate-800'}`}
                                    >
                                        {showHistory ? <List size={16} /> : <BarChart3 size={16} />}
                                        {showHistory ? 'Düzenle' : 'Geçmiş'}
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-start justify-between mt-2">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Portföyüm</h1>
                                    <p className="text-sm text-gray-400 font-medium">Varlıklarını yönet ve kazancını takip et</p>
                                </div>
                            </div>
                        </>
                    );
                })()}
            </header>

            <main className="flex-1 overflow-y-auto px-6 pb-24 relative z-10 custom-scrollbar">
                
                {showHistory ? (
                    <div className="animate-fade-in space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">GÜNLÜK TAKİP</h3>
                            <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-slate-950 px-2 py-0.5 rounded-full">{portfolioHistory.length} Kayıt</span>
                        </div>
                        
                        <div className="space-y-3">
                            {portfolioHistory.map((log, idx) => {
                                const prevLog = portfolioHistory[idx + 1];
                                const change = prevLog ? log.total_value - prevLog.total_value : 0;
                                const isPos = change >= 0;

                                return (
                                    <div key={log.id} 
                                        className="bg-white dark:bg-slate-950 rounded-3xl p-5 border border-white/50 dark:border-slate-800 shadow-sm group cursor-pointer active:scale-[0.98] transition-all"
                                        onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white text-sm">
                                                        {new Date(log.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                                                        {new Date(log.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-black text-slate-800 dark:text-white">
                                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(log.total_value)}
                                                    </p>
                                                    {prevLog && (
                                                        <p className={`text-[10px] font-bold ${isPos ? 'text-green-500' : 'text-red-500'} flex items-center justify-end gap-0.5`}>
                                                            {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                            {isPos ? '+' : ''}{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(change)}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className={`transition-transform duration-300 ${expandedLogId === log.id ? 'rotate-180' : ''} text-gray-300`}>
                                                    <ChevronDown size={18} />
                                                </div>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirmation({ isOpen: true, logId: log.id });
                                                    }}
                                                    className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 opacity-40 hover:opacity-100 hover:scale-110 active:scale-95 transition-all outline-none"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {expandedLogId === log.id && (
                                            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-800 animate-slide-down">
                                                <div className="grid grid-cols-2 gap-2">
                                                    {(() => {
                                                        const logItems = typeof log.items === 'string' ? JSON.parse(log.items) : (log.items || {});
                                                        return Object.entries(logItems).map(([key, qty]) => {
                                                            if (key === 'custom' || key === 'customPrices') return null;
                                                        
                                                        const labels = {
                                                            gram: 'Has Altın',
                                                            gram22: '22A Gram',
                                                            ceyrek: 'Çeyrek',
                                                            yarim: 'Yarım',
                                                            tam: 'Tam',
                                                            cumhuriyet: 'Ata Altın',
                                                            ethereum: 'Ethereum',
                                                            usd: 'Dolar (USD)',
                                                            eur: 'Euro (EUR)'
                                                        };
                                                        
                                                        const prevQty = prevLog?.items?.[key] || 0;
                                                        const diff = qty - prevQty;
                                                        const hasDiff = diff !== 0;

                                                        return (
                                                            <div key={key} className="bg-gray-50 dark:bg-slate-950/50 p-3 rounded-2xl flex flex-col gap-1">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{labels[key] || key}</span>
                                                                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">{qty % 1 === 0 ? qty : qty.toFixed(2)}</span>
                                                                </div>
                                                                {prevLog && hasDiff && (
                                                                    <div className={`flex items-center gap-1 text-[10px] font-black ${diff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                        {diff > 0 ? <Plus size={10} /> : <Minus size={10} />}
                                                                        {Math.abs(diff) % 1 === 0 ? Math.abs(diff) : Math.abs(diff).toFixed(2)}
                                                                        <span className="ml-1 opacity-70">{diff > 0 ? 'Alış' : 'Satış'}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                                );
                                                            });
                                                        })()}
                                                    </div>

                                                {/* Custom Assets with Comparison */}
                                                {(log.items?.custom || []).map((c, i) => {
                                                    const prevCustom = (prevLog?.items?.custom || []).find(pc => pc.name === c.name);
                                                    const diff = c.value - (prevCustom?.value || 0);
                                                    const hasDiff = diff !== 0;

                                                    return (
                                                        <div key={i} className="bg-gray-50 dark:bg-slate-950/50 p-3 rounded-2xl flex justify-between items-center group/item">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{c.name}</span>
                                                                {prevLog && hasDiff && (
                                                                    <div className={`flex items-center gap-1 text-[10px] font-black ${diff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                        {diff > 0 ? <Plus size={10} /> : <Minus size={10} />}
                                                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(Math.abs(diff))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(c.value)}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                            {portfolioHistory.length === 0 && (
                                <div className="text-center py-20 bg-white dark:bg-slate-950 rounded-[40px] border border-dashed border-gray-200 dark:border-slate-800">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <Clock size={32} />
                                    </div>
                                    <p className="text-gray-400 font-bold">Henüz geçmiş kayıt yok</p>
                                    <p className="text-xs text-gray-300 mt-1">Durumu kaydettikçe burada listelenir</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in space-y-6">
                        
                        {/* Summary Card */}
                        <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-amber-600 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                            
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-yellow-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1">TOPLAM PORTFÖY DEĞERİ</p>
                                    <h2 className="text-5xl font-black tracking-tighter">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(currentTotal)}
                                    </h2>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
                                    <Wallet size={24} />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-sm border border-white/20 ${isProfit ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                    {isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase opacity-60">DEĞİŞİM</span>
                                        <span className="text-xs font-black">{isProfit ? '+' : ''}{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(dayDiff)}</span>
                                    </div>
                                </div>
                                
                                <div 
                                    onClick={() => {
                                        setPortfolio(prev => ({
                                            ...prev,
                                            items: { gram: 0, gram22: 0, ceyrek: 0, yarim: 0, tam: 0, cumhuriyet: 0, ethereum: 0, usd: 0, eur: 0, custom: [] }
                                        }));
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-sm border border-white/20 bg-white/10 cursor-pointer active:scale-95 transition-transform"
                                >
                                    <Trash2 size={16} />
                                    <div className="flex flex-col text-left">
                                        <span className="text-[8px] font-black uppercase opacity-60">VARLIKLARI</span>
                                        <span className="text-xs font-black">Sıfırla</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gold Price Ticker (Optional mini) */}
                        {lastUpdateTime && (
                            <div className="bg-white dark:bg-slate-950 rounded-2xl p-3 border border-gray-100 dark:border-slate-800 flex items-center justify-between px-5">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-gray-400">CANLI KURLAR AKTİF</span>
                                </div>
                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 tracking-wider">
                                    SON: {new Date(lastUpdateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )}

                        {/* Core Inputs Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">DÖVİZ & ALTIN VARLIKLARIM</h3>
                                <Coins size={14} className="text-gray-400" />
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'gram', label: '24 Ayar Gram', icon: '✨' },
                                    { id: 'gram22', label: '22 Ayar Gram', icon: <Star size={24} className="text-amber-400 fill-amber-400" /> },
                                    { id: 'ceyrek', label: 'Çeyrek Altın', icon: '🟡' },
                                    { id: 'yarim', label: 'Yarım Altın', icon: '🌕' },
                                    { id: 'tam', label: 'Tam Altın', icon: '🌞' },
                                    { id: 'cumhuriyet', label: 'Ata Altın', icon: '🏛️' },
                                    { id: 'usd', label: 'Amerikan Doları', icon: '💵' },
                                    { id: 'eur', label: 'Euro', icon: '💶' },
                                    { id: 'ethereum', label: 'Ethereum', icon: '🔹' },
                                ].map(item => {
                                    const price = getPrice(item.id, goldPrices);
                                    const qty = portfolio.items[item.id] || 0;
                                    
                                    const isManual = portfolio.customPrices && portfolio.customPrices[item.id];
                                    
                                    return (
                                        <div key={item.id} className="bg-white dark:bg-slate-950 p-4 rounded-3xl border border-white/50 dark:border-slate-800 flex items-center justify-between shadow-sm hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors group/row">
                                            <div className="flex items-center gap-4">
                                                <div 
                                                    onClick={() => {
                                                        setPriceOverrideModal({ 
                                                            isOpen: true, 
                                                            itemId: item.id, 
                                                            label: item.label, 
                                                            currentPrice: price 
                                                        });
                                                        setNewManualPrice(price.toString());
                                                    }}
                                                    className={`text-2xl w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 relative ${isManual ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500/20' : 'bg-gray-50 dark:bg-slate-950'}`}
                                                    title="Manuel Fiyat Gir"
                                                >
                                                    {item.icon}
                                                    <div className="absolute -top-1 -right-1 opacity-0 group-hover/row:opacity-100 transition-opacity bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                                                        <Edit3 size={8} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{item.label}</p>
                                                        {isManual && (
                                                            <span className="text-[8px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-md font-black uppercase">MANUEL</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                        {isManual ? 'Sabit Kur:' : 'Canlı Kur:'} {price ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price) : '-'}
                                                        {isManual && (
                                                            <button 
                                                                onClick={() => {
                                                                    const newCustom = { ...portfolio.customPrices };
                                                                    delete newCustom[item.id];
                                                                    setPortfolio(prev => ({ ...prev, customPrices: newCustom }));
                                                                }}
                                                                className="text-indigo-500 hover:text-indigo-700 ml-1 underline underline-offset-2"
                                                            >Sıfırla</button>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-700">
                                                <button 
                                                    onClick={() => setPortfolio(prev => ({ ...prev, items: { ...prev.items, [item.id]: Math.max(0, qty - 1) } }))}
                                                    className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-950 rounded-xl shadow-sm text-gray-400 hover:text-red-500 transition-colors"
                                                ><Minus size={16} /></button>
                                                
                                                {editingItem === item.id ? (
                                                    <input 
                                                        type="number" step="0.01" value={tempValue} autoFocus
                                                        inputMode="decimal"
                                                        onChange={(e) => setTempValue(e.target.value)}
                                                        onBlur={() => {
                                                            setPortfolio(prev => ({ ...prev, items: { ...prev.items, [item.id]: Math.max(0, parseFloat(tempValue) || 0) } }));
                                                            setEditingItem(null); setTempValue('');
                                                        }}
                                                        onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                                        className="w-14 text-center font-black text-slate-800 dark:text-white bg-transparent outline-none"
                                                    />
                                                ) : (
                                                    <span 
                                                        onClick={() => { setEditingItem(item.id); setTempValue(qty.toString()); }}
                                                        className="w-14 text-center font-black text-lg text-slate-800 dark:text-white cursor-pointer"
                                                    >
                                                        {qty % 1 === 0 ? qty : qty.toFixed(2)}
                                                    </span>
                                                )}

                                                <button 
                                                    onClick={() => setPortfolio(prev => ({ ...prev, items: { ...prev.items, [item.id]: qty + 1 } }))}
                                                    className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-950 rounded-xl shadow-sm text-gray-400 hover:text-green-500 transition-colors"
                                                ><Plus size={16} /></button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Custom Assets */}
                        <div className="pt-2">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">DİĞER VARLIKLAR</h3>
                                <button 
                                    onClick={() => setAddCustomModal(true)}
                                    className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-1.5 rounded-lg active:scale-90 transition-transform hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                                >
                                    <PlusCircle size={20} />
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {(portfolio.items?.custom || []).map(item => (
                                    <div key={item.id} className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-white/50 dark:border-slate-800 flex items-center justify-between shadow-sm group">
                                        <span className="font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="number" value={item.value} 
                                                inputMode="decimal"
                                                onChange={(e) => {
                                                    setPortfolio(prev => ({
                                                        ...prev, items: { ...prev.items, custom: prev.items.custom.map(c => c.id === item.id ? { ...c, value: e.target.value } : c) }
                                                    }))
                                                }}
                                                className="w-24 text-right font-black text-slate-800 dark:text-white bg-transparent outline-none focus:text-indigo-600"
                                            />
                                            <span className="text-gray-300 font-bold">₺</span>
                                            <button 
                                                onClick={() => setDeleteCustomModal({ isOpen: true, item })}
                                                className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 opacity-40 hover:opacity-100 hover:scale-110 active:scale-95 transition-all outline-none"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Save Action - Integrated at the bottom of the list */}
                {!showHistory && (
                    <div className="mt-12 flex justify-center pb-12 animate-fade-in">
                        <button 
                            onClick={() => {
                                if (isSupabaseConfigured) {
                                    const itemsWithPrices = { ...portfolio.items, customPrices: portfolio.customPrices };
                                    
                                    supabase.from('portfolio_logs').insert([
                                        { items: itemsWithPrices, total_value: currentTotal }
                                    ]).then(({ error }) => {
                                        if (error) console.error("Log error", error);
                                    });

                                    // Also update the main portfolio state in DB
                                    supabase.from('portfolios').update({
                                        items: itemsWithPrices,
                                        last_total: currentTotal,
                                        last_updated: new Date().toISOString()
                                    }).eq('id', 'p1').then(({ error }) => {
                                        if (error) console.error("Update error", error);
                                    });
                                }
                                setPortfolio(prev => ({ ...prev, lastTotal: currentTotal, lastUpdated: new Date().toISOString() }));
                                setShowSuccessPopup(true);
                                setTimeout(() => setShowSuccessPopup(false), 2500);
                            }}
                            className="w-full max-w-[240px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-14 rounded-full font-black text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-white/10 dark:border-slate-800"
                        >
                            <Sparkles size={16} className="text-yellow-400 fill-current" />
                            DURUMU KAYDET
                        </button>
                    </div>
                )}
            </main>
            

            {/* Modals & Popups */}

            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirmation({ isOpen: false, logId: null })}></div>
                    <div className="bg-white dark:bg-slate-950 w-full max-w-[320px] rounded-[40px] p-8 relative z-10 animate-scale-up border border-white/50 dark:border-slate-800">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                            <Trash2 size={32} />
                        </div>
                        <h4 className="text-xl font-black text-center text-slate-800 dark:text-white mb-2">Kaydı Sil?</h4>
                        <p className="text-xs text-center text-gray-400 mb-8">Bu tarihli portföy verisi kalıcı olarak silinecek.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirmation({ isOpen: false, logId: null })} className="flex-1 h-14 rounded-2xl bg-gray-50 dark:bg-slate-950 text-gray-500 font-bold">Vazgeç</button>
                            <button onClick={confirmDeleteLog} className="flex-1 h-14 rounded-2xl bg-red-500 text-white font-bold shadow-lg shadow-red-200 dark:shadow-none">Sil</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Price Override Modal */}
            {priceOverrideModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm shadow-2xl" onClick={() => setPriceOverrideModal({ isOpen: false })}></div>
                    <div className="bg-white dark:bg-slate-950 w-full max-w-[340px] rounded-[40px] p-8 relative z-10 animate-scale-up border border-white/50 dark:border-slate-800 shadow-2xl">
                        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-[24px] flex items-center justify-center mx-auto mb-6 text-indigo-600">
                            <Edit3 size={32} />
                        </div>
                        <h4 className="text-xl font-black text-center text-slate-800 dark:text-white mb-1">{priceOverrideModal.label}</h4>
                        <p className="text-xs text-center text-gray-400 font-bold uppercase tracking-wider mb-8">Sabit Kur Belirle</p>

                        <div className="space-y-6 mb-8">
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-black">₺</span>
                                <input 
                                    type="number"
                                    step="0.01"
                                    inputMode="decimal"
                                    value={newManualPrice}
                                    onChange={(e) => setNewManualPrice(e.target.value)}
                                    className="w-full pl-10 pr-6 py-5 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-700 font-black text-2xl text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 text-center font-medium px-4">
                                Girdiğiniz fiyat bu varlığın toplam değerini hesaplamak için kullanılacaktır. Canlı kurları geçersiz kılar.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setPriceOverrideModal({ isOpen: false })} 
                                className="flex-1 h-14 rounded-2xl bg-gray-50 dark:bg-slate-950 text-gray-500 font-bold"
                            >Vazgeç</button>
                            <button 
                                onClick={() => {
                                    const val = parseFloat(newManualPrice);
                                    if (!isNaN(val)) {
                                        setPortfolio(prev => ({
                                            ...prev,
                                            customPrices: { ...prev.customPrices, [priceOverrideModal.itemId]: val }
                                        }));
                                    }
                                    setPriceOverrideModal({ isOpen: false });
                                }}
                                className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none"
                            >Uygula</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Custom Asset Modal */}
            {addCustomModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setAddCustomModal(false)}></div>
                    <div className="bg-white dark:bg-slate-950 w-full max-w-[340px] rounded-[40px] p-8 relative z-10 animate-scale-up border border-white/50 dark:border-slate-800 shadow-2xl">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-[24px] flex items-center justify-center mx-auto mb-6 text-blue-500">
                            <Package size={32} />
                        </div>
                        <h4 className="text-xl font-black text-center text-slate-800 dark:text-white mb-1">Yeni Varlık Ekle</h4>
                        <p className="text-xs text-center text-gray-400 font-bold uppercase tracking-wider mb-8">Diğer Yatırımlar</p>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">VARLIK ADI</label>
                                <input 
                                    type="text"
                                    value={newCustomName}
                                    onChange={(e) => setNewCustomName(e.target.value)}
                                    placeholder="Örn: Gümüş, Arsa, Döviz..."
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-700 font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">TL DEĞERİ</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₺</span>
                                    <input 
                                        type="number"
                                        inputMode="decimal"
                                        value={newCustomValue}
                                        onChange={(e) => setNewCustomValue(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-10 pr-5 py-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-700 font-black text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => { setAddCustomModal(false); setNewCustomName(''); setNewCustomValue(''); }} 
                                className="flex-1 h-14 rounded-2xl bg-gray-50 dark:bg-slate-950 text-gray-500 font-bold"
                            >Vazgeç</button>
                            <button 
                                onClick={() => {
                                    if (!newCustomName || !newCustomValue) return;
                                    setPortfolio(prev => ({
                                        ...prev, 
                                        items: { 
                                            ...prev.items, 
                                            custom: [...(prev.items.custom || []), { id: Date.now(), name: newCustomName, value: parseFloat(newCustomValue) }] 
                                        }
                                    }));
                                    setAddCustomModal(false);
                                    setNewCustomName('');
                                    setNewCustomValue('');
                                }}
                                className="flex-1 h-14 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 dark:shadow-none"
                            >Ekle</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Custom Asset Confirmation Modal */}
            {deleteCustomModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteCustomModal({ isOpen: false, item: null })}></div>
                    <div className="bg-white dark:bg-slate-950 w-full max-w-[340px] rounded-[40px] p-8 relative z-10 animate-scale-up border border-white/50 dark:border-slate-800 shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-[24px] flex items-center justify-center mx-auto mb-6 text-red-500">
                            <Trash2 size={32} />
                        </div>
                        <h4 className="text-xl font-black text-slate-800 dark:text-white mb-2">Varlığı Sil</h4>
                        <p className="text-gray-400 font-medium mb-8">
                            <span className="font-bold text-slate-700 dark:text-slate-300">"{deleteCustomModal.item?.name}"</span> 
                            varlığını silmek istediğinize emin misiniz?
                        </p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setDeleteCustomModal({ isOpen: false, item: null })} 
                                className="flex-1 h-14 rounded-2xl bg-gray-50 dark:bg-slate-950 text-gray-500 font-bold"
                            >Vazgeç</button>
                            <button 
                                onClick={() => {
                                    setPortfolio(prev => ({ 
                                        ...prev, 
                                        items: { 
                                            ...prev.items, 
                                            custom: prev.items.custom.filter(c => c.id !== deleteCustomModal.item?.id) 
                                        } 
                                    }));
                                    setDeleteCustomModal({ isOpen: false, item: null });
                                }}
                                className="flex-1 h-14 rounded-2xl bg-red-600 text-white font-bold shadow-lg shadow-red-200 dark:shadow-none"
                            >Sil</button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessPopup && (
                <div className="fixed inset-x-6 top-10 z-[100] animate-bounce-slow">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-[24px] shadow-2xl flex items-center gap-3 border border-white/20">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <Sparkles size={20} className="fill-current text-white" />
                        </div>
                        <div>
                            <p className="font-black text-sm tracking-tight text-white">BAŞARIYLA KAYDEDİLDİ!</p>
                            <p className="text-[10px] font-bold opacity-80 uppercase">Varlıkların güvenle saklandı.</p>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}

