import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon, Clock, MapPin, AlignLeft, Edit2, AlertTriangle, X } from 'lucide-react';

const EventsCalendar = ({ onBack, events, onAddEvent, onDeleteEvent, onUpdateEvent }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null); // 'YYYY-MM-DD'
    const [showEventModal, setShowEventModal] = useState(false);

    // New Event / Edit State
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDesc, setNewEventDesc] = useState('');
    const [newEventTime, setNewEventTime] = useState('');
    const [editingEventId, setEditingEventId] = useState(null);

    // Delete Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

    // Calendar Helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
        // Adjust for Monday start (Turkey standard)
        // 0(Sun) -> 6, 1(Mon) -> 0
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
        return { days, firstDay: adjustedFirstDay };
    };

    const { days: daysInMonth, firstDay } = getDaysInMonth(currentDate);

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        setShowEventModal(true);
        resetForm();
    };

    const resetForm = () => {
        setNewEventTitle('');
        setNewEventDesc('');
        setNewEventTime('');
        setEditingEventId(null);
    }

    const handleEditClick = (event) => {
        setEditingEventId(event.id);
        setNewEventTitle(event.title);
        setNewEventDesc(event.description || '');
        setNewEventTime(event.time || '');
    }

    const handleDeleteClick = (event) => {
        setEventToDelete(event);
        setShowDeleteConfirm(true);
    }

    const confirmDelete = () => {
        if (eventToDelete) {
            onDeleteEvent(eventToDelete.id);
            setEventToDelete(null);
            setShowDeleteConfirm(false);
            // If we deleted the last event being edited, reset form (edge case)
            if (editingEventId === eventToDelete.id) {
                resetForm();
            }
        }
    }

    const handleSaveEvent = () => {
        if (!newEventTitle.trim()) return;

        const eventData = {
            date: selectedDate,
            title: newEventTitle,
            description: newEventDesc,
            time: newEventTime
        };

        if (editingEventId) {
            onUpdateEvent({ ...eventData, id: editingEventId });
        } else {
            onAddEvent({ ...eventData, id: Date.now().toString() });
        }

        resetForm();
        // Keep modal open to see the change
    };

    const currentMonthName = currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    // Filter events for current month (for dots)
    const getEventsForDay = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.date === dateStr);
    };

    return (
        <div className="min-h-screen bg-[#F2F4F8] dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center p-0 md:p-8 font-sans relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-[100px] animate-fade-in"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300/30 dark:bg-indigo-900/20 rounded-full blur-[100px] animate-fade-in delay-100"></div>

            <div className="w-full max-w-[480px] md:max-w-[760px] bg-[#F8FAFC] dark:bg-slate-900 h-screen md:h-[92vh] md:max-h-[1000px] md:rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col md:border-[8px] md:border-white dark:md:border-slate-800 ring-1 ring-black/5 z-10 transition-colors duration-300">
                {/* Header */}
                <div className="px-8 pt-[calc(2.5rem+var(--safe-area-inset-top))] pb-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl z-20 sticky top-0 border-b border-gray-100/50 dark:border-white/5 transition-all">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={onBack}
                            className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-100 dark:border-slate-700 shadow-sm transition-all active:scale-95"
                            title="Geri Dön"
                        >
                            <ArrowLeft size={22} strokeWidth={2} />
                        </button>
                        <div className="text-center">
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-1">Etkinlik Ajandası</h1>
                            <p className="text-[10px] font-extrabold text-indigo-500/80 uppercase tracking-[0.2em]">{events.length} Kayıtlı Etkinlik</p>
                        </div>
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 dark:border-slate-700 shadow-sm">
                            <CalendarIcon size={22} strokeWidth={2} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-1.5 rounded-[22px] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/20 dark:shadow-none">
                        <button onClick={prevMonth} className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-all active:scale-90">
                            <ChevronLeft size={24} strokeWidth={2} />
                        </button>
                        <span className="font-black text-gray-900 dark:text-white text-lg tracking-tight capitalize">{currentMonthName}</span>
                        <button onClick={nextMonth} className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-all active:scale-90">
                            <ChevronRight size={24} strokeWidth={2} />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/20 dark:bg-slate-950/20">
                    <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-[48px] p-8 shadow-2xl shadow-indigo-500/[0.03] border border-white dark:border-white/5">
                        {/* Weekdays */}
                        <div className="grid grid-cols-7 mb-8">
                            {weekDays.map((day) => (
                                <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days */}
                        <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                            {/* Empty Cells for offset */}
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square opacity-20">
                                    <div className="w-full h-full rounded-[18px] bg-gray-50 dark:bg-slate-800/30"></div>
                                </div>
                            ))}

                            {/* Actual Days */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dayEvents = getEventsForDay(day);
                                const isToday =
                                    day === new Date().getDate() &&
                                    currentDate.getMonth() === new Date().getMonth() &&
                                    currentDate.getFullYear() === new Date().getFullYear();

                                return (
                                    <div key={day} className="aspect-square">
                                        <button
                                            onClick={() => handleDateClick(day)}
                                            className={`w-full h-full rounded-[24px] flex flex-col items-center justify-center relative transition-all duration-500 active:scale-90 group 
                                    ${isToday
                                                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40'
                                                    : dayEvents.length > 0
                                                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xl border-2 border-indigo-200 dark:border-indigo-900 ring-4 ring-indigo-50/50 dark:ring-indigo-900/10'
                                                        : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/10 text-gray-800 dark:text-gray-200'
                                                }
                                `}
                                        >
                                            <span className={`text-[17px] font-black tracking-tighter ${isToday ? 'scale-110' : ''}`}>{day}</span>

                                            {/* Noble Glow on hover */}
                                            {!isToday && (
                                                <div className="absolute inset-0 rounded-[22px] opacity-0 group-hover:opacity-100 bg-indigo-500/[0.03] transition-opacity"></div>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Event Modal */}
                {showEventModal && (
                    <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
                        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md pointer-events-auto transition-opacity animate-fade-in" onClick={() => setShowEventModal(false)}></div>
                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full sm:w-[450px] h-[92vh] sm:h-[85vh] sm:max-h-[900px] rounded-t-[40px] sm:rounded-[40px] p-8 relative z-10 animate-slide-up shadow-2xl flex flex-col pointer-events-auto border border-white/50 dark:border-slate-800/50 transition-colors">
                            <div className="w-16 h-1.5 bg-gray-300/50 rounded-full mx-auto mb-8 sm:hidden"></div>

                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight first-letter:uppercase">
                                        {new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">{events.filter(e => e.date === selectedDate).length} Etkinlik</p>
                                </div>
                                <button onClick={() => setShowEventModal(false)} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 font-bold text-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 pr-1 -mr-1 pb-10">
                                {/* Existing Events for this day */}
                                <div className="space-y-3 mb-6">
                                    {events.filter(e => e.date === selectedDate).length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 bg-gray-50/50 dark:bg-slate-800/50 rounded-[32px] border border-dashed border-gray-200 dark:border-slate-700 flex flex-col items-center">
                                            <div className="w-14 h-14 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 text-gray-300 dark:text-gray-600">
                                                <CalendarIcon size={28} />
                                            </div>
                                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Bugün için plan yok</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-bold">Yeni bir kayıt oluştur</p>
                                        </div>
                                    ) : (
                                        events.filter(e => e.date === selectedDate).map(event => (
                                            <div key={event.id} className={`bg-white dark:bg-slate-800 p-4 rounded-[24px] border shadow-sm flex justify-between group transition-all hover:scale-[1.01] ${editingEventId === event.id ? 'border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20' : 'border-gray-100 dark:border-slate-700'}`}>
                                                <div className="flex gap-4 items-start overflow-hidden">
                                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100 dark:border-indigo-900/30">
                                                        <CalendarIcon size={18} strokeWidth={2.5} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-gray-800 dark:text-white text-sm truncate">{event.title}</h4>
                                                        {event.time && (
                                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 mt-1 bg-indigo-50 dark:bg-indigo-900/40 w-fit px-2 py-0.5 rounded-md uppercase">
                                                                <Clock size={10} strokeWidth={3} />
                                                                <span>{event.time}</span>
                                                            </div>
                                                        )}
                                                        {event.description && <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{event.description}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 shrink-0 ml-2">
                                                    <button
                                                        onClick={() => handleEditClick(event)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(event)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-400 hover:text-red-500 transition-all shadow-sm"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Add/Edit Form */}
                                <div className={`bg-white dark:bg-slate-800 p-5 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-xl transition-all duration-300 ${editingEventId ? 'ring-2 ring-indigo-500/20 bg-indigo-50/10 dark:bg-indigo-900/5' : ''}`}>
                                    <h4 className="font-black text-gray-800 dark:text-white text-[11px] uppercase tracking-widest mb-4 flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${editingEventId ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'} transition-colors`}>
                                                {editingEventId ? <Edit2 size={12} /> : <Plus size={14} strokeWidth={3} />}
                                            </span>
                                            {editingEventId ? 'DÜZENLE' : 'YENİ KAYIT'}
                                        </span>
                                        {editingEventId && (
                                            <button onClick={resetForm} className="text-[10px] font-black text-gray-400 hover:text-rose-500 bg-gray-50 dark:bg-slate-700 px-3 py-1 rounded-lg border border-gray-100 dark:border-slate-600 transition-colors">
                                                VAZGEÇ
                                            </button>
                                        )}
                                    </h4>

                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Etkinlik Başlığı"
                                            className="w-full p-3.5 bg-gray-50 dark:bg-slate-900 rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all placeholder-gray-300 dark:placeholder-gray-500 text-gray-800 dark:text-white"
                                            value={newEventTitle}
                                            onChange={e => setNewEventTitle(e.target.value)}
                                        />

                                        <div className="relative group w-[220px]">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                                                <Clock size={16} strokeWidth={2.5} />
                                            </div>
                                            <input
                                                type="time"
                                                className="w-full p-3.5 pl-11 bg-gray-50 dark:bg-slate-900 rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all text-gray-800 dark:text-white"
                                                value={newEventTime}
                                                onChange={e => setNewEventTime(e.target.value)}
                                            />
                                        </div>

                                        <textarea
                                            placeholder="Notlar (opsiyonel)"
                                            rows="2"
                                            className="w-full p-3.5 bg-gray-50 dark:bg-slate-900 rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all placeholder-gray-300 dark:placeholder-gray-500 text-gray-800 dark:text-white resize-none"
                                            value={newEventDesc}
                                            onChange={e => setNewEventDesc(e.target.value)}
                                        ></textarea>

                                        <button
                                            onClick={handleSaveEvent}
                                            disabled={!newEventTitle}
                                            className={`w-full py-4 rounded-2xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${newEventTitle
                                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:shadow-indigo-500/30 active:scale-[0.98]'
                                                : 'bg-gray-100 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {editingEventId ? (
                                                <>
                                                    <Edit2 size={16} /> GÜNCELLE
                                                </>
                                            ) : (
                                                <>
                                                    <Plus size={18} strokeWidth={3} /> EKLE
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Custom Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowDeleteConfirm(false)}></div>
                        <div className="bg-white dark:bg-slate-900 w-full max-w-sm p-6 rounded-[32px] shadow-2xl relative z-10 animate-scale-up border border-white/20 dark:border-slate-700">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 dark:text-red-400">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-black text-center text-gray-800 dark:text-white mb-2">Emin misiniz?</h3>
                            <p className="text-center text-gray-500 dark:text-gray-400 font-medium mb-6 text-sm">
                                "<span className="text-gray-800 dark:text-white font-bold">{eventToDelete?.title}</span>" etkinliği silinecek. Bu işlem geri alınamaz.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 dark:shadow-red-900/30 transition-transform active:scale-95"
                                >
                                    Sil
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsCalendar;
