import { useState } from 'react'
import { X, Send, MessageSquare } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

export default function FeedbackModal({ isOpen, onClose }) {
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    if (!isOpen) return null

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
                onClose()
            }, 2000)
        } catch (error) {
            console.error('Feedback error:', error)
            alert('Gönderim hatası!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-all" onClick={onClose}></div>
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 relative z-10 animate-scale-up shadow-2xl border border-white/50 dark:border-slate-800/50">

                <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                    <X size={16} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                        <MessageSquare size={24} />
                    </div>

                    <h3 className="text-xl font-black text-gray-800 dark:text-white mb-1">Görüş ve Öneri</h3>
                    <p className="text-xs text-gray-400 mb-6">Uygulamayı geliştirmemiz için fikrini yaz.</p>

                    {sent ? (
                        <div className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl w-full text-sm font-bold animate-fade-in">
                            ✅ Teşekkürler! Mesajın alındı.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="w-full">
                            <textarea
                                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-none mb-4"
                                placeholder="Önerini buraya yaz..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            ></textarea>

                            <button
                                disabled={loading || !message.trim()}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                {loading ? 'Gönderiliyor...' : <> <Send size={16} /> Gönder </>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
