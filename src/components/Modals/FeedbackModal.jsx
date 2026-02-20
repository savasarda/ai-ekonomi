import { useState } from 'react'
import { X, Send, MessageSquare, Trash2, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

export default function FeedbackModal({ isOpen, onClose }) {
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const [isAdminState, setIsAdminState] = useState(false)
    const [feedbacks, setFeedbacks] = useState([])
    const [fetchingFeedbacks, setFetchingFeedbacks] = useState(false)
    const [showPasswordInput, setShowPasswordInput] = useState(false)
    const [passwordVal, setPasswordVal] = useState('')
    const [passwordError, setPasswordError] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState(null)

    if (!isOpen) return null

    const handleClose = () => {
        setIsAdminState(false)
        setShowPasswordInput(false)
        setPasswordVal('')
        setPasswordError(false)
        setMessage('')
        setDeleteConfirmId(null)
        onClose()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!message.trim()) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('feedback')
                .insert([{ message: message, type: 'general' }])

            if (error) throw error

            setSent(true)
            setMessage('')
            setTimeout(() => {
                setSent(false)
                if (!isAdminState) handleClose()
            }, 2000)
        } catch (error) {
            console.error('Feedback error:', error)
            alert('Gönderim hatası!')
        } finally {
            setLoading(false)
        }
    }

    const handleTitleClick = () => {
        if (isAdminState) {
            setIsAdminState(false)
            return
        }
        setShowPasswordInput(prev => !prev)
        setPasswordVal('')
        setPasswordError(false)
    }

    const handlePasswordSubmit = (e) => {
        e.preventDefault()
        if (passwordVal === "5898") {
            setIsAdminState(true)
            setShowPasswordInput(false)
            setPasswordVal('')
            setPasswordError(false)
            fetchFeedbacks()
        } else {
            setPasswordError(true)
            setPasswordVal('')
        }
    }

    const handleToggleFeedbackStatus = async (id, currentType) => {
        const newType = currentType === 'done' ? 'general' : 'done'

        // Optimistic UI update
        setFeedbacks(prev => prev.map(fb => fb.id === id ? { ...fb, type: newType } : fb))

        try {
            const { error } = await supabase
                .from('feedback')
                .update({ type: newType })
                .eq('id', id)

            if (error) {
                // Revert on error
                setFeedbacks(prev => prev.map(fb => fb.id === id ? { ...fb, type: currentType } : fb))
                throw error
            }
        } catch (error) {
            console.error('Status update error:', error)
            alert("Durum güncellenemedi.")
        }
    }

    const handleDeleteFeedback = async (id) => {
        // Optimistic UI update
        const previousFeedbacks = [...feedbacks]
        setFeedbacks(prev => prev.filter(fb => fb.id !== id))
        setDeleteConfirmId(null)

        try {
            const { error } = await supabase
                .from('feedback')
                .delete()
                .eq('id', id)

            if (error) {
                // Revert on error
                setFeedbacks(previousFeedbacks)
                throw error
            }
        } catch (error) {
            console.error('Delete error:', error)
            alert("İstek silinemedi.")
        }
    }

    const fetchFeedbacks = async () => {
        setFetchingFeedbacks(true)
        try {
            const { data, error } = await supabase
                .from('feedback')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setFeedbacks(data || [])
        } catch (error) {
            console.error('Error fetching feedbacks:', error)
            alert("İstekler yüklenirken hata oluştu.")
        } finally {
            setFetchingFeedbacks(false)
        }
    }

    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-all" onClick={handleClose}></div>
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] p-6 relative z-10 animate-scale-up shadow-2xl border border-white/50 dark:border-slate-800/50 max-h-[90vh] flex flex-col">

                <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 hover:bg-gray-200 transition-colors z-20">
                    <X size={16} />
                </button>

                <div className="flex flex-col items-center text-center flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 cursor-pointer hover:scale-105 transition-transform" onClick={handleTitleClick}>
                        <MessageSquare size={24} />
                    </div>

                    <h3
                        className="text-xl font-black text-gray-800 dark:text-white mb-1 cursor-pointer select-none hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        onClick={handleTitleClick}
                        title="Yönetici girişi için tıklayın"
                    >
                        {isAdminState ? "Toplanan İstekler" : showPasswordInput ? "Yönetici Girişi" : "Görüş ve Öneri"}
                    </h3>

                    {!isAdminState && !showPasswordInput && <p className="text-xs text-gray-400 mb-6">Uygulamayı geliştirmemiz için fikrini yaz.</p>}
                    {showPasswordInput && <p className="text-xs text-indigo-400 mb-6">Lütfen şifrenizi girin.</p>}
                </div>

                {isAdminState ? (
                    <div className="flex-1 overflow-y-auto mt-4 custom-scrollbar pr-2 min-h-[300px]">
                        {fetchingFeedbacks ? (
                            <div className="flex flex-col items-center justify-center py-10 opacity-50">
                                <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></span>
                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Yükleniyor...</p>
                            </div>
                        ) : feedbacks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 opacity-50">
                                <p className="text-sm font-bold text-gray-500">Henüz hiçbir istek bulunmuyor.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {feedbacks.map((fb) => (
                                    <div key={fb.id} className={`p-4 rounded-2xl border text-left transition-colors relative group flex flex-col ${fb.type === 'done' ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-900/50'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <p className={`text-[10px] font-bold uppercase tracking-wider ${fb.type === 'done' ? 'text-green-500/70' : 'text-gray-400'}`}>
                                                {new Date(fb.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity relative z-0">
                                                <button
                                                    onClick={() => setDeleteConfirmId(fb.id)}
                                                    className="p-1.5 rounded-lg bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-500 dark:bg-slate-700 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className={`text-sm whitespace-pre-wrap font-medium flex-1 mb-3 ${fb.type === 'done' ? 'text-green-800/60 dark:text-green-200/50 line-through' : 'text-gray-800 dark:text-white'}`}>{fb.message}</p>

                                        <div className="flex justify-start relative z-0">
                                            <button
                                                onClick={() => handleToggleFeedbackStatus(fb.id, fb.type)}
                                                className={`py-1.5 px-3 flex items-center gap-1.5 text-xs font-bold rounded-lg transition-colors border ${fb.type === 'done' ? 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50 hover:bg-green-200 dark:hover:bg-green-900/50' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 dark:bg-slate-900 dark:text-gray-400 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-indigo-400 dark:hover:border-indigo-800/50'}`}
                                            >
                                                <CheckCircle size={14} className={fb.type === 'done' ? 'fill-green-600/20 text-green-600 dark:fill-green-400/20 dark:text-green-400' : ''} />
                                                {fb.type === 'done' ? 'Geri Al' : 'Tamamlandı'}
                                            </button>
                                        </div>

                                        {deleteConfirmId === fb.id && (
                                            <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 z-10 animate-fade-in border border-red-200 dark:border-red-900/50 shadow-sm">
                                                <p className="text-sm font-bold text-gray-800 dark:text-white mb-3 text-center">Bu isteği tamamen silmek istediğinize emin misiniz?</p>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setDeleteConfirmId(null)}
                                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 transition-colors"
                                                    >
                                                        İptal
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteFeedback(fb.id)}
                                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                                                    >
                                                        Evet, Sil
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : showPasswordInput ? (
                    <div className="w-full flex-shrink-0 animate-fade-in relative z-10">
                        {passwordError && (
                            <div className="absolute -top-14 left-0 right-0 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 p-3 rounded-xl w-full text-xs font-bold animate-fade-in text-center flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/50 shadow-sm">
                                <X size={14} className="bg-red-500 text-white rounded-full p-0.5" />
                                Hatalı şifre, tekrar deneyiniz.
                            </div>
                        )}
                        <form onSubmit={handlePasswordSubmit} className="w-full">
                            <input
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className={`w-full bg-gray-50 dark:bg-slate-800 border ${passwordError ? 'border-red-400 dark:border-red-500/50 focus:ring-red-500/10' : 'focus:border-indigo-500 dark:border-slate-700 focus:ring-indigo-500/10'} rounded-xl p-4 text-center font-black tracking-[0.5em] text-lg text-gray-800 dark:text-white placeholder-gray-300 dark:placeholder-slate-600 focus:ring-4 mb-4 outline-none transition-all`}
                                placeholder="••••"
                                value={passwordVal}
                                onChange={(e) => {
                                    setPasswordVal(e.target.value)
                                    if (passwordError) setPasswordError(false)
                                }}
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!passwordVal}
                                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
                            >
                                Giriş Yap
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="w-full flex-shrink-0">
                        {sent ? (
                            <div className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl w-full text-sm font-bold animate-fade-in text-center flex items-center justify-center gap-2 border border-green-200 dark:border-green-900/30">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">✓</div>
                                Teşekkürler! Mesajın alındı.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="w-full">
                                <textarea
                                    className="w-full bg-gray-50 dark:bg-slate-800 border focus:border-indigo-500 dark:border-slate-700 rounded-xl p-4 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:ring-4 focus:ring-indigo-500/10 min-h-[140px] resize-none mb-4 outline-none transition-all"
                                    placeholder="Önerini buraya yaz..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                ></textarea>

                                <button
                                    disabled={loading || !message.trim()}
                                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl active:scale-95 hover:bg-black dark:hover:bg-gray-100"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white/50 border-t-white dark:border-gray-900/50 dark:border-t-gray-900 rounded-full animate-spin"></span>
                                    ) : (
                                        <> <Send size={16} /> Gönder </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
