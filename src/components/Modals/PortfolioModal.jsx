import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { X, Clock, TrendingUp, TrendingDown, ChevronDown, Plus, Minus, AlertTriangle, RefreshCw, Sparkles, RotateCcw, Trash2 } from 'lucide-react'

export default function PortfolioModal({
    isOpen,
    onClose,
    portfolio,
    setPortfolio,
    goldPrices,
    goldFetchError,
    fetchGoldPrices,
    lastUpdateTime,
    isSupabaseConfigured
}) {
    const [showHistory, setShowHistory] = useState(false)
    const [portfolioHistory, setPortfolioHistory] = useState([])
    const [expandedLogId, setExpandedLogId] = useState(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [tempValue, setTempValue] = useState('')
    const [showSuccessPopup, setShowSuccessPopup] = useState(false)
    const [showRestoreModal, setShowRestoreModal] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, logId: null })
    const [addCustomModal, setAddCustomModal] = useState(false)
    const [newCustomName, setNewCustomName] = useState('')
    const [newCustomValue, setNewCustomValue] = useState('')

    if (!isOpen) return null;

    const handleFetchHistory = async () => {
        if (!isSupabaseConfigured) return
        try {
            const { data: logs, error } = await supabase
                .from('portfolio_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20)

            if (error) throw error
            if (logs) setPortfolioHistory(logs)
        } catch (e) {
            console.error("Error fetching history:", e)
            alert("Geçmiş kayıtlar alınırken hata oluştu.")
        }
    }

    const requestDeleteLog = (logId, e) => {
        e.stopPropagation(); // Prevent accordion toggle
        setDeleteConfirmation({ isOpen: true, logId });
    }

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
    }

    // Helper for price calculation
    const getPrice = (key, rawPrices) => {
        // Special calculation for 22 Ayar Gram (0.916 * Has Altın)
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
    }

    const calculateTotal = (items, prices) => {
        return Object.keys(items || {}).reduce((acc, key) => {
            if (key === 'custom') return acc;
            const qty = items?.[key] || 0;
            return acc + (qty * getPrice(key, prices));
        }, 0) + (items.custom || []).reduce((acc, i) => acc + (parseFloat(i.value) || 0), 0);
    }

    return (
        <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-all" onClick={onClose}></div>
            <div className="bg-[#F8FAFC] dark:bg-slate-950 w-full sm:max-w-[420px] h-[90vh] sm:h-[800px] rounded-t-[40px] sm:rounded-[40px] p-0 relative z-10 animate-slide-up sm:animate-scale-up flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-white/50 dark:border-slate-900/50">

                {/* HEADER */}
                <div className="px-8 pt-8 pb-4 bg-white dark:bg-slate-950 sticky top-0 z-20 rounded-t-[40px]">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">Portföyüm</h3>
                            <p className="text-sm text-gray-400 font-medium">Anlık değer takibi</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    if (!showHistory) handleFetchHistory();
                                    setShowHistory(!showHistory);
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${showHistory ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'bg-gray-100 dark:bg-slate-950 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                                title={showHistory ? 'Geçmişi Kapat' : 'Geçmişi Görüntüle'}
                            >
                                {showHistory ? <X size={20} /> : <Clock size={20} />}
                            </button>
                            <button onClick={() => { onClose(); setShowHistory(false); }} className="w-10 h-10 bg-gray-100 dark:bg-slate-950 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Gold Price Update Info */}
                    {lastUpdateTime && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-slate-900">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 font-medium">Son güncelleme:</span>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                    {new Date(lastUpdateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
                    {showHistory ? (
                        <div className="animate-fade-in">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Son 20 Kayıt</p>
                            <div className="space-y-3">
                                {portfolioHistory.map((log) => (
                                    <div key={log.id}
                                        onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                        className={`bg-white dark:bg-slate-950 p-4 rounded-2xl border transition-all cursor-pointer ${expandedLogId === log.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-100 dark:border-slate-700 hover:border-indigo-300'}`}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-white text-sm">
                                                    {new Date(log.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tarih</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="font-black text-indigo-600 dark:text-indigo-400 text-lg">
                                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(log.total_value)}
                                                </p>
                                                <button
                                                    onClick={(e) => requestDeleteLog(log.id, e)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                                                    title="Kaydı sil"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <span className={`text-gray-400 transition-transform ${expandedLogId === log.id ? 'rotate-180' : ''}`}>
                                                    <ChevronDown size={16} />
                                                </span>
                                            </div>
                                        </div>

                                        {/* Details Accordion */}
                                        {expandedLogId === log.id && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 animate-fade-in">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Detaylar</p>
                                                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                                    {Object.entries(log.items || {}).map(([key, qty]) => {
                                                        if (qty <= 0 || key === 'custom') return null;
                                                        let label = key;
                                                        switch (key) {
                                                            case 'gram': label = 'Gram Altın (24 Ayar)'; break;
                                                            case 'gram22': label = '22 Ayar Gram'; break;
                                                            case 'ceyrek': label = 'Çeyrek'; break;
                                                            case 'yarim': label = 'Yarım'; break;
                                                            case 'tam': label = 'Tam'; break;
                                                            case 'cumhuriyet': label = 'Cumhuriyet'; break;
                                                            case 'ethereum': label = 'Ethereum'; break;
                                                            case 'usd': label = 'Dolar (USD)'; break;
                                                            case 'eur': label = 'Euro (EUR)'; break;
                                                        }
                                                        return (
                                                            <div key={key} className="flex justify-between bg-gray-50 dark:bg-slate-950 px-3 py-2 rounded-lg">
                                                                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                                                                <span className="font-bold text-gray-800 dark:text-white">{qty} adet</span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                {log.items?.custom && log.items.custom.length > 0 && (
                                                    <div className="mt-2 text-sm">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Diğer Varlıklar</p>
                                                        <div className="space-y-2">
                                                            {log.items.custom.map((c, i) => (
                                                                <div key={i} className="flex justify-between bg-gray-50 dark:bg-slate-950 px-3 py-2 rounded-lg">
                                                                    <span className="text-gray-500 dark:text-gray-400">{c.name}</span>
                                                                    <span className="font-bold text-gray-800 dark:text-white">
                                                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(parseFloat(c.value) || ((parseFloat(c.qty) || 0) * (parseFloat(c.price) || 0)))}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        )}
                                    </div>
                                ))}
                                {portfolioHistory.length === 0 && (
                                    <div className="text-center py-10 text-gray-400 text-sm">Henüz geçmiş kayıt bulunmamaktadır.</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Summary / Comparison Card */}
                            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"></div>

                                <p className="text-yellow-100 text-xs font-bold uppercase tracking-wider mb-1">Toplam Portföy Değeri</p>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <h2 className="text-4xl font-black tracking-tight">
                                        {goldPrices ?
                                            new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(
                                                calculateTotal(portfolio.items, goldPrices)
                                            )
                                            : '...'
                                        }
                                    </h2>
                                </div>

                                {portfolio.lastTotal > 0 && goldPrices && !goldFetchError && (
                                    (() => {
                                        const currentTotal = calculateTotal(portfolio.items, goldPrices);
                                        const diff = currentTotal - portfolio.lastTotal;
                                        const isProfit = diff >= 0;

                                        return (
                                            <div className="flex items-center gap-2 bg-white/20 rounded-xl p-2 backdrop-blur-sm self-start inline-flex cursor-pointer hover:bg-white/30 transition-colors active:scale-95"
                                                title="Bu değerleri yüklemek için tıklayın"
                                                onClick={() => {
                                                    if (portfolio.lastItems) {
                                                        setShowRestoreModal(true);
                                                    }
                                                }}
                                            >
                                                <span className="text-lg">
                                                    {isProfit ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                                </span>
                                                <div>
                                                    <p className="text-[10px] font-bold text-yellow-50 uppercase">Son Kontrolden Beri</p>
                                                    <p className="font-bold text-sm">
                                                        {isProfit ? '+' : ''}{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(diff)}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })()
                                )}
                                {!goldPrices && !goldFetchError && <p className="text-sm font-bold opacity-80 animate-pulse">Güncel kurlar alınıyor...</p>}
                                {goldFetchError && (
                                    <div className="bg-red-500/20 p-2 rounded-xl backdrop-blur-sm self-start inline-flex items-center gap-2 border border-red-500/30">
                                        <span className="text-lg"><AlertTriangle size={20} /></span>
                                        <p className="text-xs font-bold text-white">Bağlantı hatası! Güncel kurlar alınamadı.</p>
                                    </div>
                                )}
                            </div>

                            {/* Input List */}
                            <div className="space-y-4">
                                {[
                                    { id: 'gram', label: 'Gram Altın (24 Ayar)', code: 'gram-altin' },
                                    { id: 'gram22', label: '22 Ayar Gram', code: 'calculated' },
                                    { id: 'ceyrek', label: 'Çeyrek Altın', code: 'ceyrek-altin' },
                                    { id: 'yarim', label: 'Yarım Altın', code: 'yarim-altin' },
                                    { id: 'tam', label: 'Tam Altın', code: 'tam-altin' },
                                    { id: 'cumhuriyet', label: 'Cumhuriyet Altını', code: 'cumhuriyet-altini' },
                                    { id: 'usd', label: 'Amerikan Doları', code: 'USD' },
                                    { id: 'eur', label: 'Euro', code: 'EUR' },
                                    { id: 'ethereum', label: 'Ethereum', code: 'ethereum' },
                                ].map(item => {
                                    const price = getPrice(item.id, goldPrices);
                                    return (
                                        <div key={item.id} className="bg-white dark:bg-slate-950 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 flex items-center justify-between shadow-sm">
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-white">{item.label}</p>
                                                <p className="text-xs text-gray-400 font-bold">
                                                    Birim: {price ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price) : '-'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-950 rounded-xl p-1 border border-gray-200 dark:border-slate-700">
                                                    <button
                                                        onClick={() => setPortfolio(prev => ({ ...prev, items: { ...prev.items, [item.id]: Math.max(0, prev.items[item.id] - 1) } }))}
                                                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-950 rounded-lg shadow-sm text-gray-500 font-bold hover:text-red-500 transition-colors"
                                                    ><Minus size={16} /></button>
                                                    {editingItem === item.id ? (
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            inputMode="decimal"
                                                            value={tempValue}
                                                            onChange={(e) => setTempValue(e.target.value)}
                                                            onBlur={() => {
                                                                const val = parseFloat(tempValue) || 0;
                                                                setPortfolio(prev => ({ ...prev, items: { ...prev.items, [item.id]: Math.max(0, val) } }));
                                                                setEditingItem(null);
                                                                setTempValue('');
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    const val = parseFloat(tempValue) || 0;
                                                                    setPortfolio(prev => ({ ...prev, items: { ...prev.items, [item.id]: Math.max(0, val) } }));
                                                                    setEditingItem(null);
                                                                    setTempValue('');
                                                                }
                                                            }}
                                                            autoFocus
                                                            className="w-16 text-center font-black text-lg text-gray-800 dark:text-white bg-white dark:bg-slate-950 rounded-lg px-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    ) : (
                                                        <span
                                                            onClick={() => {
                                                                setEditingItem(item.id);
                                                                setTempValue(portfolio.items[item.id].toString());
                                                            }}
                                                            className="w-16 text-center font-black text-lg text-gray-800 dark:text-white cursor-pointer hover:bg-white dark:hover:bg-slate-800 rounded-lg px-1 transition-colors"
                                                            title="Düzenlemek için tıklayın"
                                                        >
                                                            {portfolio.items[item.id] % 1 === 0 ? portfolio.items[item.id] : portfolio.items[item.id].toFixed(2)}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => setPortfolio(prev => ({ ...prev, items: { ...prev.items, [item.id]: prev.items[item.id] + 1 } }))}
                                                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-950 rounded-lg shadow-sm text-gray-500 font-bold hover:text-green-500 transition-colors"
                                                    ><Plus size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Custom Assets Section */}
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-800 dark:text-white">Diğer Varlıklar</h4>
                                    <button
                                        onClick={() => setAddCustomModal(true)}
                                        className="text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-lg font-bold hover:bg-indigo-200 transition-colors"
                                    >
                                        + Ekle
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {(portfolio.items?.custom || []).map((item, idx) => (
                                        <div key={item.id} className="bg-white dark:bg-slate-950 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 flex items-center justify-between shadow-sm relative group">
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-white">{item.name}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            inputMode="decimal"
                                                            value={item.value || (item.qty * item.price) || ''}
                                                            onChange={(e) => {
                                                                setPortfolio(prev => ({
                                                                    ...prev,
                                                                    items: {
                                                                        ...prev.items,
                                                                        custom: prev.items.custom.map(c => c.id === item.id ? { ...c, value: e.target.value } : c)
                                                                    }
                                                                }))
                                                            }}
                                                            placeholder="TL Değeri"
                                                            className="w-32 text-center font-black text-lg text-gray-800 dark:text-white bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl py-1 px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                                                        />
                                                        <span className="font-bold text-gray-400">₺</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        if (!confirm('Silinsin mi?')) return;
                                                        setPortfolio(prev => ({
                                                            ...prev,
                                                            items: {
                                                                ...prev.items,
                                                                custom: prev.items.custom.filter(c => c.id !== item.id)
                                                            }
                                                        }))
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-all ml-1"
                                                ><X size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                    {(portfolio.items?.custom || []).length === 0 && (
                                        <p className="text-center text-xs text-gray-400 italic py-2">Henüz eklenmiş varlık yok.</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={() => {
                                        // Save current total as lastTotal
                                        const currentTotal = calculateTotal(portfolio.items, goldPrices);

                                        // Save to DB (Log and Current State)
                                        if (isSupabaseConfigured) {
                                            // 1. Insert Log
                                            supabase.from('portfolio_logs').insert([
                                                {
                                                    items: portfolio.items,
                                                    total_value: currentTotal,
                                                }
                                            ]).then(({ error }) => {
                                                if (error) console.error("Log insert error", error)
                                            })

                                            // 2. Update/Upsert Main State (for main screen)
                                            supabase.from('portfolios').upsert([
                                                {
                                                    id: 1, // Assuming single user/portfolio for now, adjust if multiple users
                                                    items: JSON.stringify(portfolio.items),
                                                    last_total: currentTotal,
                                                    last_updated: new Date().toISOString()
                                                }
                                            ]).then(({ error }) => {
                                                if (error) console.error("Portfolio upsert error", error)
                                            })
                                        }

                                        setPortfolio(prev => ({
                                            ...prev,
                                            lastTotal: currentTotal,
                                            lastUpdated: new Date().toISOString()
                                        }));

                                        setShowSuccessPopup(true)
                                        setTimeout(() => setShowSuccessPopup(false), 3000)
                                    }}
                                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all"
                                >
                                    Durumu Kaydet
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-3">Bu butona basarak o anki toplam değeri sabitlersiniz.</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Fun Success Popup */}
                {showSuccessPopup && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                        <div className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 text-white px-8 py-6 rounded-3xl shadow-2xl animate-bounce pointer-events-auto relative overflow-hidden">
                            {/* Sparkle effects */}
                            <div className="absolute top-2 right-2 animate-ping">
                                <Sparkles size={20} className="text-yellow-300" />
                            </div>
                            <div className="absolute bottom-2 left-2 animate-pulse">
                                <Sparkles size={16} className="text-yellow-200" />
                            </div>

                            <div className="text-center relative z-10">
                                <div className="text-5xl mb-3 animate-bounce">🎉</div>
                                <h4 className="text-2xl font-black mb-2">Harika!</h4>
                                <p className="text-sm font-bold opacity-90">
                                    Portföyün kasaya kilitlendi! 💰
                                </p>
                                <p className="text-xs opacity-75 mt-1">
                                    Artık zenginliğini takip edebilirsin 😎
                                </p>
                            </div>

                            {/* Decorative circles */}
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                )}
                {/* Restore Confirmation Modal */}
                {showRestoreModal && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 p-4">
                        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-all" onClick={() => setShowRestoreModal(false)}></div>
                        <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl w-full max-w-[340px] rounded-[32px] p-6 relative z-10 animate-scale-up shadow-2xl border border-white/50 dark:border-slate-800/50">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <RotateCcw size={32} className="text-blue-500" />
                                </div>
                                <h4 className="text-xl font-black text-gray-800 dark:text-white mb-2">Değerleri Yükle?</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Son kaydedilen portföy değerleri yüklenecek. Mevcut girdiğiniz değerler değişecektir.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRestoreModal(false)}
                                    className="flex-1 bg-gray-100 dark:bg-slate-950 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold transition-all hover:bg-gray-200 dark:hover:bg-slate-700"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={() => {
                                        setPortfolio(prev => ({
                                            ...prev,
                                            items: {
                                                gram: 0, gram22: 0, ceyrek: 0, yarim: 0, tam: 0, cumhuriyet: 0, ethereum: 0, usd: 0, eur: 0, custom: [],
                                                ...portfolio.lastItems
                                            }
                                        }));
                                        setShowRestoreModal(false);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                                >
                                    Yükle
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Delete Confirmation Modal */}
                {deleteConfirmation.isOpen && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 p-4">
                        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-all" onClick={() => setDeleteConfirmation({ isOpen: false, logId: null })}></div>
                        <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl w-full max-w-[340px] rounded-[32px] p-6 relative z-10 animate-scale-up shadow-2xl border border-white/50 dark:border-slate-800/50">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={32} className="text-red-500" />
                                </div>
                                <h4 className="text-xl font-black text-gray-800 dark:text-white mb-2">Kaydı Sil?</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Bu geçmiş kaydı silmek üzeresiniz. Bu işlem geri alınamaz.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirmation({ isOpen: false, logId: null })}
                                    className="flex-1 bg-gray-100 dark:bg-slate-950 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold transition-all hover:bg-gray-200 dark:hover:bg-slate-700"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={confirmDeleteLog}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                                >
                                    Sil
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Custom Asset Modal */}
                {addCustomModal && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6">
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm shadow-2xl" onClick={() => setAddCustomModal(false)}></div>
                        <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl w-full max-w-[340px] rounded-[40px] p-8 relative z-10 animate-scale-up shadow-2xl border border-white/50 dark:border-slate-800/50">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-[24px] flex items-center justify-center mx-auto mb-6 text-blue-500">
                                <Plus size={32} />
                            </div>
                            <h4 className="text-xl font-black text-center text-gray-800 dark:text-white mb-1">Yeni Varlık Ekle</h4>
                            <p className="text-xs text-center text-gray-400 font-bold uppercase tracking-wider mb-8">Diğer Yatırımlar</p>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">VARLIK ADI</label>
                                    <input 
                                        type="text"
                                        value={newCustomName}
                                        onChange={(e) => setNewCustomName(e.target.value)}
                                        placeholder="Örn: Gümüş, Arsa, Döviz..."
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-700 font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
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
                                            className="w-full pl-10 pr-5 py-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-700 font-black text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
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
                                                custom: [...(prev.items.custom || []), { id: Date.now(), name: newCustomName, value: parseFloat(newCustomValue.toString().replace(',','.')) }] 
                                            }
                                        }));
                                        setAddCustomModal(false);
                                        setNewCustomName('');
                                        setNewCustomValue('');
                                    }}
                                    className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
                                >Ekle</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
