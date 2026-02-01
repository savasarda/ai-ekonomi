
import React from 'react';
import { Calendar, X, Info, Clock, Bell } from 'lucide-react';

const ReminderModal = ({ events, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden border border-white/50 dark:border-slate-800 animate-scale-up">
                {/* Header */}
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-8 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <Bell size={24} className="animate-bounce" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">Hatırlatıcı</h3>
                            <p className="text-orange-100 text-sm font-medium">Önümüzdeki 30 günün özeti</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {events && events.length > 0 ? (
                        <div className="space-y-4">
                            {events.map((event, index) => (
                                <div
                                    key={event.id || index}
                                    className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-[28px] border border-gray-100 dark:border-slate-800 transition-all hover:scale-[1.02]"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white leading-tight">{event.title}</h4>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                                                    <span>{new Date(event.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</span>
                                                    {event.time && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1"><Clock size={10} /> {event.time}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {event.description && event.description !== 'EMPTY' && (
                                        <div className="flex gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 mt-1">
                                            <Info size={14} className="text-orange-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed font-medium">
                                                {event.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Calendar size={32} />
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white mb-1">Harika!</h4>
                            <p className="text-sm text-gray-500">Önümüzdeki 30 gün için planlı bir etkinlik görünmüyor.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-50 dark:border-slate-800">
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-[20px] font-bold text-lg shadow-xl shadow-slate-200 dark:shadow-none hover:bg-black dark:hover:bg-slate-100 transition-all active:scale-[0.98]"
                    >
                        Anladım
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReminderModal;
