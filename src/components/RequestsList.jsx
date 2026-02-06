import React, { useEffect, useState } from 'react';
import { ArrowLeft, MessageSquare, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const RequestsList = ({ onBack, isSupabaseConfigured }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRequests = async () => {
    if (!isSupabaseConfigured) {
      setRequests([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    if (isSupabaseConfigured) {
      const sub = supabase
        .channel('public:feedback')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, fetchRequests)
        .subscribe();

      return () => {
        supabase.removeChannel(sub);
      };
    }
  }, [isSupabaseConfigured]);

  return (
    <div className="min-h-screen bg-[#F2F4F8] dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center p-0 sm:p-8 font-sans relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-300/30 dark:bg-indigo-900/20 rounded-full blur-[100px] animate-fade-in"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-300/30 dark:bg-sky-900/20 rounded-full blur-[100px] animate-fade-in delay-100"></div>

      <div className="w-full max-w-[480px] bg-[#F8FAFC] dark:bg-slate-900 h-screen sm:h-[850px] sm:rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col sm:border-[8px] sm:border-white dark:sm:border-slate-800 ring-1 ring-black/5 z-10 transition-colors duration-300">
        <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-6 pt-[calc(1.5rem+var(--safe-area-inset-top))] pb-4 sticky top-0 z-20 shadow-sm flex items-center gap-4 transition-colors">
          <button onClick={onBack} className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="text-indigo-500" size={24} />
            İstekleri Görüntüle
          </h1>
          <button
            onClick={fetchRequests}
            className="ml-auto p-2 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
            title="Yenile"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 custom-scrollbar">
          {!isSupabaseConfigured && (
            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 p-4 rounded-2xl text-sm font-semibold">
              Supabase yapılandırılmadığı için istekler görüntülenemiyor.
            </div>
          )}

          {isSupabaseConfigured && requests.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-600 opacity-70">
              <MessageSquare size={48} className="mb-2 stroke-1" />
              <p className="text-sm font-medium">Henüz istek yok.</p>
            </div>
          )}

          {requests.map(request => (
            <div
              key={request.id ?? `${request.message}-${request.created_at}`}
              className="bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col gap-2"
            >
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                {request.message}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                <span>{request.type ? `Tür: ${request.type}` : 'Tür: genel'}</span>
                <span>
                  {request.created_at
                    ? new Date(request.created_at).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })
                    : ''}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Yükleniyor...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsList;
