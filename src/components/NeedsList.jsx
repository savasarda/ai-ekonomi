import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, CheckCircle, Circle, ShoppingBag, Star } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const commonItems = ['Ekmek 🍞', 'Süt 🥛', 'Yumurta 🥚', 'Peynir 🧀', 'Su 💧', 'Meyve 🍎', 'Sebze 🥦', 'Kahve ☕', 'Deterjan 🧼', 'Peçete 🧻', 'Yoğurt 🥣', 'Makarna 🍝', 'Yağ 🌻', 'Un 🌾'];

const SwipeableItem = ({ item, onToggle, onDelete }) => {
    const [startX, setStartX] = useState(0);
    const [translateX, setTranslateX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);

    const handleTouchStart = (e) => {
        setStartX(e.targetTouches[0].clientX);
        setIsSwiping(false);
    };

    const handleTouchMove = (e) => {
        const currentX = e.targetTouches[0].clientX;
        const diff = currentX - startX;

        // Only allow swiping left
        if (diff < 0) {
            setTranslateX(diff);
            if (Math.abs(diff) > 10) setIsSwiping(true);
        }
    };

    const handleTouchEnd = () => {
        if (translateX < -100) {
            // Swiped far enough to delete
            setTranslateX(-500); // Animate off screen
            setTimeout(() => onDelete(item.id), 300);
        } else {
            // Snap back
            setTranslateX(0);
            setIsSwiping(false);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-[24px] mb-3">
            {/* Background (Delete Action) */}
            <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-6">
                <Trash2 className="text-white" size={24} />
            </div>

            {/* Foreground (Card Content) */}
            <div
                className={`group flex items-center gap-4 p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm relative z-10 transition-transform duration-200 ${item.completed ? 'opacity-60' : ''}`}
                style={{ transform: `translateX(${translateX}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <button
                    onClick={(e) => {
                        // Prevent toggle if swiping was detected
                        if (!isSwiping && Math.abs(translateX) < 5) onToggle(item.id, item.completed)
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${item.completed ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`}
                >
                    {item.completed ? <CheckCircle size={24} strokeWidth={2.5} className="fill-green-100 dark:fill-green-900/30" /> : <Circle size={24} strokeWidth={2.5} />}
                </button>

                <span className={`flex-1 font-bold text-lg transition-all ${item.completed ? 'text-gray-400 line-through decoration-2 decoration-gray-300' : 'text-gray-800 dark:text-white'}`}>
                    {item.text}
                </span>

                {/* Desktop Delete Button (Fallback) */}
                <button
                    onClick={() => onDelete(item.id)}
                    className="sm:flex hidden w-8 h-8 rounded-xl items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

const NeedsList = ({ onBack, isSupabaseConfigured }) => {
    // Items State
    const [items, setItems] = useState([]);
    // Stats State
    const [needsStats, setNeedsStats] = useState({});
    const [newItem, setNewItem] = useState('');
    const [loading, setLoading] = useState(true);

    // Initial Data Fetch
    useEffect(() => {
        fetchData();
    }, [isSupabaseConfigured]);

    const fetchData = async () => {
        setLoading(true);
        if (isSupabaseConfigured) {
            // Fetch List
            const { data: listData, error: listError } = await supabase
                .from('needs_list')
                .select('*')
                .order('created_at', { ascending: false });

            if (listData) setItems(listData);
            if (listError) console.error("Error fetching needs list:", listError);

            // Fetch Stats
            const { data: statsData, error: statsError } = await supabase
                .from('needs_stats')
                .select('*');

            if (statsData) {
                const statsObj = {};
                statsData.forEach(s => statsObj[s.item_name] = s.count);
                setNeedsStats(statsObj);
            }
        } else {
            // LocalStorage Fallback
            const savedList = localStorage.getItem('needsList');
            if (savedList) setItems(JSON.parse(savedList));

            const savedStats = localStorage.getItem('needsStats');
            if (savedStats) setNeedsStats(JSON.parse(savedStats));
        }
        setLoading(false);
    };

    // Sync LocalStorage only if NOT using Supabase (to avoid overwriting with stale data)
    useEffect(() => {
        if (!isSupabaseConfigured && !loading) {
            localStorage.setItem('needsList', JSON.stringify(items));
        }
    }, [items, isSupabaseConfigured, loading]);

    useEffect(() => {
        if (!isSupabaseConfigured && !loading) {
            localStorage.setItem('needsStats', JSON.stringify(needsStats));
        }
    }, [needsStats, isSupabaseConfigured, loading]);

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        addItem(newItem.trim());
        setNewItem('');
    };

    const addItem = async (text) => {
        const cleanText = text.trim();
        const tempId = Date.now().toString(); // ID for optimistic update

        // Optimistic Update
        const optimisticItem = {
            id: tempId,
            text: cleanText,
            completed: false,
            created_at: new Date().toISOString()
        };
        setItems(prev => [optimisticItem, ...prev]);

        // Update Stats
        const newCount = (needsStats[cleanText] || 0) + 1;
        setNeedsStats(prev => ({ ...prev, [cleanText]: newCount }));

        if (isSupabaseConfigured) {
            // DB Insert Item
            const { data, error } = await supabase
                .from('needs_list')
                .insert([{ text: cleanText }])
                .select()
                .single();

            if (data) {
                // Replace temp item with real DB item
                setItems(prev => prev.map(i => i.id === tempId ? data : i));
            }

            // DB Upsert Stats
            // Check if exists first or use upsert if constraint exists.
            // We made item_name primary key, so upsert works.
            await supabase
                .from('needs_stats')
                .upsert({ item_name: cleanText, count: newCount, last_added_at: new Date().toISOString() }, { onConflict: 'item_name' });
        }
    };

    const toggleComplete = async (id, currentStatus) => {
        // Optimistic
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, completed: !currentStatus } : item
        ));

        if (isSupabaseConfigured) {
            await supabase
                .from('needs_list')
                .update({ completed: !currentStatus })
                .eq('id', id);
        }
    };

    const deleteItem = async (id) => {
        // Optimistic
        setItems(prev => prev.filter(item => item.id !== id));

        if (isSupabaseConfigured) {
            await supabase
                .from('needs_list')
                .delete()
                .eq('id', id);
        }
    };

    const getSortedSuggestions = () => {
        // 1. Get frequent items (> 2 usages)
        const favoriteItems = Object.entries(needsStats)
            .filter(([_, count]) => count > 2)
            .sort((a, b) => b[1] - a[1]) // Sort by count desc
            .map(([name]) => name);

        // 2. Combine favorites + common items, removing duplicates
        const combined = [...new Set([...favoriteItems, ...commonItems])];
        return combined;
    };

    const sortedSuggestions = getSortedSuggestions();
    const completedCount = items.filter(i => i.completed).length;

    return (
        <div className="min-h-screen bg-[#F2F4F8] dark:bg-slate-950 flex items-center justify-center p-0 sm:p-8 font-sans relative overflow-hidden transition-colors duration-300">

            {/* Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-300/30 dark:bg-pink-900/20 rounded-full blur-[100px] animate-fade-in"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-300/30 dark:bg-indigo-900/20 rounded-full blur-[100px] animate-fade-in delay-100"></div>

            <div className="w-full max-w-[480px] bg-[#F8FAFC] dark:bg-slate-900 h-screen sm:h-[850px] sm:rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col sm:border-[8px] sm:border-white dark:sm:border-slate-800 ring-1 ring-black/5 z-10 transition-colors duration-300">

                {/* Header */}
                <header className="px-8 pt-[calc(3rem+var(--safe-area-inset-top))] pb-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 z-10 sticky top-0">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center text-pink-600 dark:text-pink-400">
                            <ShoppingBag size={20} />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight mb-1">İhtiyaç Listesi</h1>
                        <p className="text-sm text-gray-500 font-medium">
                            {items.length === 0 ? 'Listeniz boş' : `${items.length} ürün • ${completedCount} tamamlandı`}
                        </p>
                    </div>
                </header>

                {/* Input Area */}
                <div className="p-6 pb-2">
                    <form onSubmit={handleAddItem} className="relative mb-4">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder="Yeni ihtiyaç ekle..."
                            className="w-full pl-5 pr-14 py-4 rounded-[20px] bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-2 border-transparent focus:border-pink-500 dark:focus:border-pink-500 focus:ring-0 outline-none text-gray-800 dark:text-white font-bold placeholder-gray-300 dark:placeholder-slate-600 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!newItem.trim()}
                            className="absolute right-2 top-2 bottom-2 w-12 bg-pink-500 text-white rounded-[14px] flex items-center justify-center shadow-lg shadow-pink-200 dark:shadow-pink-900/20 disabled:opacity-50 disabled:shadow-none hover:bg-pink-600 transition-all active:scale-95"
                        >
                            <Plus size={24} strokeWidth={3} />
                        </button>
                    </form>

                    {/* Quick Suggestions */}
                    <div>
                        <div className="flex items-center justify-between mb-2 px-1">
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Hızlı Ekle</p>
                            {sortedSuggestions.length > commonItems.length && (
                                <div className="flex items-center gap-1 text-[10px] text-pink-500 font-bold bg-pink-50 dark:bg-pink-900/20 px-2 py-0.5 rounded-full">
                                    <Star size={10} fill="currentColor" />
                                    <span>Sık Kullanılanlar Üstte</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 -mx-1 px-1">
                            {sortedSuggestions.map(item => {
                                const isFavorite = (needsStats[item] || 0) > 2;
                                return (
                                    <button
                                        key={item}
                                        onClick={() => addItem(item)}
                                        className={`px-4 py-2 rounded-[14px] border text-sm font-bold whitespace-nowrap transition-all shadow-sm active:scale-95 flex items-center gap-1
                        ${isFavorite
                                                ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300'
                                                : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {isFavorite && <Star size={12} fill="currentColor" />}
                                        {isFavorite ? item : '+ ' + item}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-8">
                    {items.map(item => (
                        <SwipeableItem
                            key={item.id}
                            item={item}
                            onToggle={toggleComplete}
                            onDelete={deleteItem}
                        />
                    ))}

                    {items.length === 0 && (
                        <div className="text-center py-20 text-gray-300 dark:text-slate-700">
                            <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag size={40} />
                            </div>
                            <p className="font-bold text-lg">Liste Boş</p>
                            <p className="text-sm">Eksikleri eklemeye başla</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default NeedsList;
