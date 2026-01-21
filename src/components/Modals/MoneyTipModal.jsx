import { X, Lightbulb } from 'lucide-react'

export default function MoneyTipModal({ isOpen, onClose, tip }) {
    if (!isOpen || !tip) return null;

    return (
        <div className="absolute inset-x-0 top-24 z-[70] px-6 animate-fade-in mx-auto max-w-[420px]">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-2xl relative overflow-hidden ring-4 ring-white dark:ring-slate-800">

                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                            <Lightbulb size={16} className="text-yellow-300 fill-yellow-300" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Günün İpucu</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                        {tip.title}
                    </h3>
                    <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                        {tip.content}
                    </p>
                </div>
            </div>
            {/* Backdrop close area */}
            <div className="fixed inset-0 z-[-1]" onClick={onClose}></div>
        </div>
    )
}
