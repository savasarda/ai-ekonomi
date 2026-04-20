import React from 'react';
import { supabase } from '../../lib/supabaseClient';
import { LogIn, ShieldCheck, Zap, TrendingUp } from 'lucide-react';

const LoginScreen = () => {
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error.message);
      alert('Giriş yapılırken bir hata oluştu: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-500/20 mb-6 group transition-transform hover:scale-105 active:scale-95">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            AIEkonomi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Aile Bütçenizi Akıllıca Yönetin
          </p>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Güvenli Oturum</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Verileriniz Google güvencesiyle korunur.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Anlık Senkronizasyon</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tüm aile üyeleri verileri anında görür.</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold py-4 px-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-all active:scale-[0.98] group"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google ile Devam Et
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium px-4">
          Giriş yaparak kullanım koşullarını ve gizlilik politikasını kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
