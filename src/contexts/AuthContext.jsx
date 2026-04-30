import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const isLocal = typeof window !== 'undefined' && 
                 (window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  window.location.hostname.startsWith('192.168.') ||
                  window.location.hostname.endsWith('.local'));

  const mockUUID = '00000000-0000-0000-0000-000000000000';
  const mockFamilyUUID = '11111111-1111-1111-1111-111111111111';

  const [user, setUser] = useState(isLocal ? { id: mockUUID, email: 'dev@example.com' } : null);
  const [session, setSession] = useState(isLocal ? { user: { id: mockUUID, email: 'dev@example.com' } } : null);
  const [profile, setProfile] = useState(isLocal ? {
    id: mockUUID,
    family_id: mockFamilyUUID,
    families: { id: mockFamilyUUID, name: 'Geliştirici Ailesi', invite_code: 'DEV123', created_by: mockUUID }
  } : null);
  const [loading, setLoading] = useState(!isLocal);

  useEffect(() => {
    if (isLocal) {
      const mockUser = { id: mockUUID, email: 'dev@example.com' };
      setSession({ user: mockUser });
      setUser(mockUser);
      setProfile({
        id: mockUUID,
        family_id: mockFamilyUUID,
        families: { id: mockFamilyUUID, name: 'Geliştirici Ailesi', invite_code: 'DEV123', created_by: mockUUID }
      });
      setLoading(false);
    };

    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id);
      } else if (isLocal) {
        handleLocalDev();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id);
      } else if (isLocal) {
        handleLocalDev();
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isLocal]);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`*, families(*)`)
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
