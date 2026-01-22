import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { X, Clock, TrendingUp, TrendingDown, ChevronDown, Plus, Minus, AlertTriangle, RefreshCw, Sparkles, RotateCcw } from 'lucide-react'

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

    // Helper for price calculation
    const getPrice = (key, rawPrices) => {
        let priceKey = '';
        switch (key) {
            case 'gram': priceKey = 'gram-altin'; break;
            case 'ceyrek': priceKey = 'ceyrek-altin'; break;
            case 'yarim': priceKey = 'yarim-altin'; break;
            case 'tam': priceKey = 'tam-altin'; break;
            case 'cumhuriyet': priceKey = 'cumhuriyet-altini'; break;
            case 'ethereum': priceKey = 'ethereum'; break;
        }
        let rawPrice = rawPrices?.[priceKey]?.Satış || "0";
        rawPrice = String(rawPrice).replace(/\./g, '').replace(',', '.');
        return parseFloat(rawPrice) || 0;
    }

    const calculateTotal = (items, prices) => {
        return Object.keys(items || {}).reduce((acc, key) => {
            if (key === 'custom') return acc;
            const qty = items?.[key] || 0;
            return acc + (qty * getPrice(key, prices));
        }, 0) + (items.custom || []).reduce((acc, i) => acc + (parseFloat(i.qty) * parseFloat(i.price)), 0);
    }

    return (
        <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-all" onClick={onClose}></div>
            <div className="bg-[#F8FAFC] dark:bg-slate-900 w-full sm:max-w-[420px] h-[90vh] sm:h-[800px] rounded-t-[40px] sm:rounded-[40px] p-0 relative z-10 animate-slide-up sm:animate-scale-up flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-white/50 dark:border-slate-800/50">

                {/* HEADER */}
                <div className="px-8 pt-8 pb-4 bg-white dark:bg-slate-900 sticky top-0 z-20 rounded-t-[40px]">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">Altın Portföyüm</h3>
                            <p className="text-sm text-gray-400 font-medium">Anlık değer takibi</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    if (!showHistory) handleFetchHistory();
                                    setShowHistory(!showHistory);
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${showHistory ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                                title={showHistory ? 'Geçmişi Kapat' : 'Geçmişi Görüntüle'}
                            >
                                {showHistory ? <X size={20} /> : <Clock size={20} />}
                            </button>
                            <button onClick={() => { onClose(); setShowHistory(false); }} className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Gold Price Update Info */}
                    {lastUpdateTime && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 font-medium">Son güncelleme:</span>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                    {new Date(lastUpdateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <button
                                onClick={async () => {
                                    setIsRefreshing(true);
                                    await fetchGoldPrices();
                                    setTimeout(() => setIsRefreshing(false), 500);
                                }}
                                disabled={isRefreshing}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg text-xs font-bold hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors disabled:opacity-50"
                                title="Altın fiyatlarını yenile"
                            >
                                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                                {isRefreshing ? 'Yenileniyor...' : 'Yenile'}
                            </button>
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
                                        className={`bg-white dark:bg-slate-800 p-4 rounded-2xl border transition-all cursor-pointer ${expandedLogId === log.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-100 dark:border-slate-700 hover:border-indigo-300'}`}>
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
                                                            case 'gram': label = 'Gram'; break;
                                                            case 'ceyrek': label = 'Çeyrek'; break;
                                                            case 'yarim': label = 'Yarım'; break;
                                                            case 'tam': label = 'Tam'; break;
                                                            case 'cumhuriyet': label = 'Cumhuriyet'; break;
                                                            case 'ethereum': label = 'Ethereum'; break;
                                                        }
                                                        return (
                                                            <div key={key} className="flex justify-between bg-gray-50 dark:bg-slate-900 px-3 py-2 rounded-lg">
                                                                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                                                                <span className="font-bold text-gray-800 dark:text-white">{qty} adet</span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>

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
                                    { id: 'gram', label: 'Gram Altın', code: 'gram-altin' },
                                    { id: 'ceyrek', label: 'Çeyrek Altın', code: 'ceyrek-altin' },
                                    { id: 'yarim', label: 'Yarım Altın', code: 'yarim-altin' },
                                    { id: 'tam', label: 'Tam Altın', code: 'tam-altin' },
                                    { id: 'cumhuriyet', label: 'Cumhuriyet Altını', code: 'cumhuriyet-altini' },
                                    { id: 'ethereum', label: 'Ethereum', code: 'ethereum' },
                                ].map(item => {
                                    const price = getPrice(item.id, goldPrices);
                                    return (
                                        <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 flex items-center justify-between shadow-sm">
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-white">{item.label}</p>
                                                <p className="text-xs text-gray-400 font-bold">
                                                    Birim: {price ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price) : '-'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 rounded-xl p-1 border border-gray-200 dark:border-slate-700">
                                                    <button
                                                        onClick={() => setPortfolio(prev => ({ ...prev, items: { ...prev.items, [item.id]: Math.max(0, prev.items[item.id] - 1) } }))}
                                                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg shadow-sm text-gray-500 font-bold hover:text-red-500 transition-colors"
                                                    ><Minus size={16} /></button>
                                                    {editingItem === item.id ? (
                                                        <input
                                                            type="number"
                                                            step="0.01"
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
                                                            className="w-16 text-center font-black text-lg text-gray-800 dark:text-white bg-white dark:bg-slate-800 rounded-lg px-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                                                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg shadow-sm text-gray-500 font-bold hover:text-green-500 transition-colors"
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
                                        onClick={() => {
                                            const name = prompt("Varlık Adı (Örn: Ethereum, ASELSAN):");
                                            if (!name) return;
                                            const qty = prompt(`${name} Adedi:`);
                                            if (!qty) return;
                                            const price = prompt(`${name} Birim Fiyatı (TL):`);
                                            if (!price) return;

                                            setPortfolio(prev => ({
                                                ...prev,
                                                items: {
                                                    ...prev.items,
                                                    custom: [
                                                        ...(prev.items.custom || []),
                                                        { id: Date.now(), name, qty: parseFloat(qty), price: parseFloat(price) }
                                                    ]
                                                }
                                            }))
                                        }}
                                        className="text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-lg font-bold hover:bg-indigo-200 transition-colors"
                                    >
                                        + Ekle
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {(portfolio.items?.custom || []).map((item, idx) => (
                                        <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 flex items-center justify-between shadow-sm relative group">
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-white">{item.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                                                    <span>{item.qty} adet</span>
                                                    <span>x</span>
                                                    <span>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.price)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="font-black text-gray-800 dark:text-white">
                                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(item.qty * item.price)}
                                                </p>
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
                                                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity px-2"
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

                                        // Save to DB Log
                                        if (isSupabaseConfigured) {
                                            supabase.from('portfolio_logs').insert([
                                                {
                                                    items: portfolio.items,
                                                    total_value: currentTotal,
                                                    // user_id: 'current_user_id' // Optional if auth is fully implemented
                                                }
                                            ]).then(({ error }) => {
                                                if (error) console.error("Log insert error", error)
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
                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-[340px] rounded-[32px] p-6 relative z-10 animate-scale-up shadow-2xl border border-white/50 dark:border-slate-800/50">
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
                                    className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold transition-all hover:bg-gray-200 dark:hover:bg-slate-700"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={() => {
                                        setPortfolio(prev => ({ ...prev, items: portfolio.lastItems }));
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
            </div>
        </div>
    )
}
