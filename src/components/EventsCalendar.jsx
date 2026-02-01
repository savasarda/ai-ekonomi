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
        <div className="absolute inset-0 bg-[#F2F4F8] dark:bg-slate-950 flex flex-col z-50 overflow-hidden transition-colors duration-300">
            {/* Header */}
            <div className="px-6 pt-[calc(2rem+var(--safe-area-inset-top))] pb-4 bg-white dark:bg-slate-900 shadow-sm z-10">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        title="Geri Dön"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-gray-800 dark:text-white tracking-tight">Etkinlikler</h1>
                    <div className="w-10"></div> {/* Spacer */}
                </div>

                <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 p-2 rounded-2xl border border-gray-100 dark:border-slate-700">
                    <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <span className="font-bold text-gray-800 dark:text-white text-lg capitalize">{currentMonthName}</span>
                    <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-4 shadow-xl shadow-gray-100 dark:shadow-none border border-white/50 dark:border-slate-800">
                    {/* Weekdays */}
                    <div className="grid grid-cols-7 mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                        {/* Empty Cells for offset */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square"></div>
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
                                        className={`w-full h-full rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-95 group 
                                    ${isToday
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40'
                                                : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                                            }
                                    ${dayEvents.length > 0 && !isToday ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold border border-orange-100 dark:border-orange-900/30' : ''}
                                `}
                                    >
                                        <span className={`text-sm font-bold`}>{day}</span>

                                        {/* Event Dots */}
                                        <div className="flex gap-0.5 mt-1 h-1.5 items-end justify-center">
                                            {dayEvents.slice(0, 3).map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`w-1 h-1 rounded-full ${isToday ? 'bg-white/70' : 'bg-orange-500'}`}
                                                />
                                            ))}
                                        </div>
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
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full sm:w-[450px] h-[85vh] sm:h-auto rounded-t-[40px] sm:rounded-[40px] p-8 relative z-10 animate-slide-up shadow-2xl flex flex-col pointer-events-auto border border-white/50 dark:border-slate-800/50 transition-colors">
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

                        <div className="flex-1 overflow-y-auto custom-scrollbar mb-6 pr-1 -mr-1">
                            {/* Existing Events for this day */}
                            <div className="space-y-3 mb-8">
                                {events.filter(e => e.date === selectedDate).length === 0 ? (
                                    <div className="text-center py-10 text-gray-400 bg-gray-50/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700 flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 text-gray-300 dark:text-gray-600">
                                            <CalendarIcon size={32} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Bugün için plan yok</p>
                                        <p className="text-xs text-gray-400 mt-1">Aşağıdan yeni bir etkinlik ekle</p>
                                    </div>
                                ) : (
                                    events.filter(e => e.date === selectedDate).map(event => (
                                        <div key={event.id} className={`bg-white dark:bg-slate-800 p-5 rounded-[24px] border shadow-sm flex justify-between group transition-all hover:scale-[1.01] ${editingEventId === event.id ? 'border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20' : 'border-gray-100 dark:border-slate-700'}`}>
                                            <div className="flex gap-4 items-start overflow-hidden">
                                                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/10 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 border border-orange-100 dark:border-orange-900/20">
                                                    <CalendarIcon size={20} strokeWidth={2} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-gray-800 dark:text-white text-base truncate">{event.title}</h4>
                                                    {event.time && (
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 dark:text-indigo-400 mt-1 bg-indigo-50 dark:bg-indigo-900/20 w-fit px-2 py-0.5 rounded-md">
                                                            <Clock size={12} strokeWidth={2.5} />
                                                            <span>{event.time}</span>
                                                        </div>
                                                    )}
                                                    {event.description && <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">{event.description}</p>}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 shrink-0 ml-2">
                                                <button
                                                    onClick={() => handleEditClick(event)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(event)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add/Edit Form */}
                            <div className={`bg-gray-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-inner transition-all duration-300 ${editingEventId ? 'ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                                <h4 className="font-black text-gray-800 dark:text-white text-sm mb-4 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${editingEventId ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'} transition-colors`}>
                                            {editingEventId ? <Edit2 size={14} /> : <Plus size={16} strokeWidth={3} />}
                                        </span>
                                        {editingEventId ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}
                                    </span>
                                    {editingEventId && (
                                        <button onClick={resetForm} className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-white dark:bg-slate-700 px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-600">
                                            Vazgeç
                                        </button>
                                    )}
                                </h4>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Başlık (Örn: Doğum Günü, Toplantı)"
                                        className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-all placeholder-gray-300 dark:placeholder-gray-600 text-gray-800 dark:text-white shadow-sm"
                                        value={newEventTitle}
                                        onChange={e => setNewEventTitle(e.target.value)}
                                    />

                                    <div className="flex gap-3">
                                        <div className="flex-1 relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                                                <Clock size={16} strokeWidth={2.5} />
                                            </div>
                                            <input
                                                type="time"
                                                className="w-full p-4 pl-11 bg-white dark:bg-slate-900 rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-all text-gray-800 dark:text-white shadow-sm"
                                                value={newEventTime}
                                                onChange={e => setNewEventTime(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <textarea
                                        placeholder="Notlar veya detaylar..."
                                        rows="2"
                                        className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-all placeholder-gray-300 dark:placeholder-gray-600 text-gray-800 dark:text-white resize-none shadow-sm"
                                        value={newEventDesc}
                                        onChange={e => setNewEventDesc(e.target.value)}
                                    ></textarea>

                                    <button
                                        onClick={handleSaveEvent}
                                        disabled={!newEventTitle}
                                        className={`w-full py-4 rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 ${newEventTitle
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-200 dark:shadow-indigo-900/30'
                                            : 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {editingEventId ? (
                                            <>
                                                <Edit2 size={18} /> Güncelle
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={20} strokeWidth={3} /> Ekle
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
    );
};

export default EventsCalendar;
