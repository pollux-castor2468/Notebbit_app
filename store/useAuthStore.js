import { create } from 'zustand';
import { supabase } from '../constants/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  
  profileName: '激動到露眼白兔',
  profileDesc: '據說兔子太激動的時候會露眼白',
  profileAvatar: null,

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        set({
          profileName: data.name || '未命名',
          profileDesc: data.description || '這個人很懶，什麼都沒留下',
          profileAvatar: data.avatar_url || null,
        });
      }
    } catch (e) {
      console.error(e);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      set({ user: data.user, session: data.session });
      if (data.user) {
        await get().fetchProfile(data.user.id);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      
      if (data.user) {
        // Create profile
        await supabase.from('user_profiles').upsert({
          id: data.user.id,
          name: name,
          total_exp: 0,
          current_level: 1,
        });
        set({ user: data.user, session: data.session });
        await get().fetchProfile(data.user.id);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null, profileName: '未登入', profileDesc: '', profileAvatar: null });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (name, desc, avatar) => {
    const user = get().user;
    if (!user) return;
    try {
      await supabase.from('user_profiles').update({
        name: name,
        description: desc,
        avatar_url: avatar
      }).eq('id', user.id);
      
      set({ profileName: name, profileDesc: desc, profileAvatar: avatar });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  autoLogin: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
         set({ user: session.user, session });
         await get().fetchProfile(session.user.id);
      }
    } catch (e) {
      console.error('Auto login exception:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
}));
