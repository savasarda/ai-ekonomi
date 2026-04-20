import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { logger } from '../../lib/logger';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Plus, ArrowRight, Loader2, Home, LogOut } from 'lucide-react';

const FamilySetup = () => {
  const { user, setProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(null); // 'create' or 'join'
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [savedFamilies] = useState(() => {
    const saved = localStorage.getItem('saved_families');
    return saved ? JSON.parse(saved) : [];
  });

  const generateInviteCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    if (!familyName.trim()) return;

    setLoading(true);
    try {
      const code = generateInviteCode();
      
      // 1. Create Family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          name: familyName,
          invite_code: code,
          created_by: user.id
        })
        .select()
        .single();

      if (familyError) throw familyError;

      // 2. Create/Update Profile with family_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: user.user_metadata.full_name,
          avatar_url: user.user_metadata.avatar_url,
          family_id: family.id
        })
        .select()
        .single();

      if (profileError) throw profileError;

      setProfile({ ...profile, families: family });
    } catch (error) {
      logger.error('handleCreateFamily error', { error: error.message });
      alert('Aile oluşturulurken hata: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async (e) => {
    e.preventDefault();
    if (inviteCode.length !== 6) return;

    setLoading(true);
    try {
      // 1. Find Family by Code
      const { data: family, error: familyError } = await supabase
        .from('families')
        .select()
        .eq('invite_code', inviteCode)
        .single();

      if (familyError || !family) {
        throw new Error('Geçersiz davet kodu.' + (familyError ? ' (Sistem: ' + familyError.message + ')' : ''));
      }

      // 2. Update Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: user.user_metadata.full_name,
          avatar_url: user.user_metadata.avatar_url,
          family_id: family.id
        })
        .select()
        .single();

      if (profileError) throw profileError;

      setProfile({ ...profile, families: family });
    } catch (error) {
      logger.error('handleJoinFamily error', { error: error.message, inviteCode });
      alert('Aileye katılırken hata: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 animate-fade-in">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl mb-8">
            <Users className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Aile Grubu Kurun</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-10">
            Ekonominizi birlikte yönetmek için yeni bir grup oluşturun veya mevcut bir aileye katılın.
          </p>

          <div className="grid gap-4">
            <button
              onClick={() => setMode('create')}
              className="group flex items-center justify-between p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Yeni Aile Oluştur</h3>
                  <p className="text-xs text-slate-500">Kendi bütçe grubunuzun yöneticisi olun.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => setMode('join')}
              className="group flex items-center justify-between p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Aileye Katıl</h3>
                  <p className="text-xs text-slate-500">Mevcut bir gruba davet koduyla bağlanın.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {savedFamilies.length > 0 && (
            <div className="mt-8 text-left animate-fade-in">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Kayıtlı Aileleriniz</h4>
              <div className="space-y-2">
                {savedFamilies.map(f => (
                  <button
                    key={f.family_id}
                    onClick={() => {
                        setInviteCode(f.invite_code);
                        setMode('join');
                    }}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500 transition-all shadow-sm group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                         <h4 className="text-sm font-bold text-slate-800 dark:text-white">{f.name}</h4>
                         <p className="text-[10px] font-bold text-indigo-500 tracking-wider">#{f.invite_code}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => supabase.auth.signOut()} className="mt-10 flex items-center gap-2 text-slate-400 hover:text-red-500 mx-auto text-sm font-bold transition-all hover:scale-105">
             Giriş Ekranına Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 animate-scale-up">
      <div className="w-full max-w-md">
        <button
          onClick={() => setMode(null)}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="text-sm font-semibold">Geri Dön</span>
        </button>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {mode === 'create' ? 'Aile Grubu İsmi' : 'Davet Kodunu Gir'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            {mode === 'create' 
              ? 'Aileniz veya bütçe grubunuz için kapsayıcı bir isim belirleyin.' 
              : 'Aktif bir aile grubuna katılmak için 6 haneli kodu girin.'}
          </p>

          <form onSubmit={mode === 'create' ? handleCreateFamily : handleJoinFamily} className="space-y-6">
            <div>
              {mode === 'create' ? (
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Örn: Akdemir Ailesi"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none transition-all"
                  required
                />
              ) : (
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="589821"
                  className="w-full px-5 py-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-3xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none transition-all"
                  required
                />
              )}
            </div>

            <button
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Devam Et'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FamilySetup;
