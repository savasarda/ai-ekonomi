import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, Check, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// Smart suggestions based on common shopping items
const commonItems = [
    { name: 'Süt', icon: '🥛' },
    { name: 'Ekmek', icon: '🍞' },
    { name: 'Yumurta', icon: '🥚' },
    { name: 'Peynir', icon: '🧀' },
    { name: 'Domates', icon: '🍅' },
    { name: 'Meyve', icon: '🍎' },
    { name: 'Kahve', icon: '☕' },
    { name: 'Deterjan', icon: '🧼' },
    { name: 'Tuvalet Kağıdı', icon: '🧻' },
    { name: 'Su', icon: '💧' }
];

const NeedsList = ({ onBack, isSupabaseConfigured }) => {
    const [needs, setNeeds] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [suggestions, setSuggestions] = useState(commonItems); // Show all by default
    const [isLoading, setIsLoading] = useState(false);
    const listRef = useRef(null);

    // Fetch Needs
    const fetchNeeds = async () => {
        if (!isSupabaseConfigured) {
            // Local fallback
            const saved = localStorage.getItem('needs_list');
            if (saved) setNeeds(JSON.parse(saved));
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('needs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setNeeds(data);
        } catch (error) {
            console.error('Error fetching needs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNeeds();

        // Subscription
        if (isSupabaseConfigured) {
            const sub = supabase
                .channel('public:needs')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'needs' }, fetchNeeds)
                .subscribe();

            return () => {
                supabase.removeChannel(sub);
            };
        }
    }, [isSupabaseConfigured]);

    const handleAddItem = async (text) => {
        if (!text.trim()) return;

        const newItemObj = {
            id: Date.now().toString(), // temp id
            text: text.trim(),
            completed: false,
            created_at: new Date().toISOString()
        };

        if (isSupabaseConfigured) {
            try {
                // Remove id for supabase auto-gen if strictly using uuid, but if text/int, maybe ok. 
                // Let's rely on DB default for ID if possible, or generate UUID. 
                // For simplicity in mixed mode, let's use the object structure but don't send ID if it's auto-inc/uuid.
                // Assuming 'needs' table exists. If not, I should create it.
                await supabase.from('needs').insert([{ text: newItemObj.text, completed: false }]);
            } catch (e) {
                console.error("Error adding need:", e);
                // Optimistic update handled by fetch or explicitly here
            }
        } else {
            const updated = [newItemObj, ...needs];
            setNeeds(updated);
            localStorage.setItem('needs_list', JSON.stringify(updated));
        }

        setNewItem('');
        setSuggestions(commonItems);
    };

    const handleToggle = async (id, currentStatus) => {
        if (isSupabaseConfigured) {
            await supabase.from('needs').update({ completed: !currentStatus }).eq('id', id);
        } else {
            const updated = needs.map(n => n.id === id ? { ...n, completed: !n.completed } : n);
            setNeeds(updated);
            localStorage.setItem('needs_list', JSON.stringify(updated));
        }
    };

    const handleDelete = async (id) => {
        if (isSupabaseConfigured) {
            await supabase.from('needs').delete().eq('id', id);
        } else {
            const updated = needs.filter(n => n.id !== id);
            setNeeds(updated);
            localStorage.setItem('needs_list', JSON.stringify(updated));
        }
    };

    // Smart Suggestions Logic
    const handleInput = (e) => {
        const val = e.target.value;
        setNewItem(val);

        const filtered = commonItems.filter(i =>
            i.name.toLowerCase().includes(val.toLowerCase()) &&
            !needs.some(n => n.text.toLowerCase() === i.name.toLowerCase() && !n.completed)
        );
        setSuggestions(filtered);
    };

    return (
        <div className="min-h-screen bg-[#F2F4F8] dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center p-0 sm:p-8 font-sans relative overflow-hidden">

            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-[100px] animate-fade-in"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300/30 dark:bg-indigo-900/20 rounded-full blur-[100px] animate-fade-in delay-100"></div>

            <div className="w-full max-w-[480px] bg-[#F8FAFC] dark:bg-slate-900 h-screen sm:h-[850px] sm:rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col sm:border-[8px] sm:border-white dark:sm:border-slate-800 ring-1 ring-black/5 z-10 transition-colors duration-300">

                {/* Header */}
                <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-6 pt-[calc(1.5rem+var(--safe-area-inset-top))] pb-4 sticky top-0 z-20 shadow-sm flex items-center gap-4 transition-colors">
                    <button onClick={onBack} className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <ShoppingBag className="text-pink-500" size={24} />
                        İhtiyaç Listesi
                    </h1>
                </header>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-slate-900 shadow-sm relative z-10 transition-colors">
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newItem}
                            onChange={handleInput}
                            placeholder="Ne lazım? (Örn: Süt)"
                            className="flex-1 bg-gray-100 dark:bg-slate-800 border-0 rounded-2xl px-5 py-4 font-bold text-gray-800 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-pink-500 transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem(newItem)}
                        />
                        <button
                            onClick={() => handleAddItem(newItem)}
                            className="bg-pink-500 hover:bg-pink-600 text-white rounded-2xl w-14 flex items-center justify-center transition-colors shadow-lg shadow-pink-200 dark:shadow-pink-900/30"
                        >
                            <Plus size={28} />
                        </button>
                    </div>

                    {/* Suggestions Pills */}
                    {suggestions.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 animate-fade-in-up custom-scrollbar">
                            {suggestions.map(s => (
                                <button
                                    key={s.name}
                                    onClick={() => handleAddItem(s.name)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-full text-xs font-bold whitespace-nowrap active:scale-95 transition-transform"
                                >
                                    <span>{s.icon}</span>
                                    <span>{s.name}</span>
                                    <Plus size={12} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 custom-scrollbar" ref={listRef}>
                    {needs.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-600 opacity-50">
                            <ShoppingBag size={48} className="mb-2 stroke-1" />
                            <p className="text-sm font-medium">Listeniz boş.</p>
                        </div>
                    )}

                    {needs.filter(n => !n.completed).map(item => (
                        <NeedItem
                            key={item.id}
                            item={item}
                            onToggle={() => handleToggle(item.id, item.completed)}
                            onDelete={() => handleDelete(item.id)}
                        />
                    ))}

                    {needs.some(n => n.completed) && (
                        <div className="mt-8">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-3">Tamamlananlar</h3>
                            <div className="space-y-2 opacity-60">
                                {needs.filter(n => n.completed).map(item => (
                                    <NeedItem
                                        key={item.id}
                                        item={item}
                                        onToggle={() => handleToggle(item.id, item.completed)}
                                        onDelete={() => handleDelete(item.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Swipeable Item Component
const NeedItem = ({ item, onToggle, onDelete }) => {
    // Simple implementation for desktop/touch - can be enhanced with real gesture lib usually
    // For now, standard button approach but styled nicely
    return (
        <div className="group relative overflow-hidden rounded-2xl">
            {/* Background / Delete Action */}
            <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-5 text-white">
                <Trash2 size={20} />
            </div>

            {/* Content Content (Sliding Part - simulated with simple grid for now or just overlay) */}
            {/* Real swipe requires complex event handling. Let's use a delete button for reliability in this MVP */}

            <div className={`relative bg-white dark:bg-slate-800 p-4 transition-transform flex items-center gap-3 border border-gray-100 dark:border-slate-700`}>
                <button
                    onClick={onToggle}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}
                >
                    {item.completed && <Check size={14} strokeWidth={3} />}
                </button>

                <span className={`flex-1 font-bold text-gray-800 dark:text-white ${item.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                    {item.text}
                </span>

                <button
                    onClick={onDelete}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default NeedsList;
