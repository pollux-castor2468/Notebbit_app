import { create } from 'zustand';
import { supabase } from '../constants/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isLoading: false,

  autoLogin: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'example@gmail.com',
        password: 'example',
      });
      if (error) {
        console.error('Auto login error:', error.message);
      } else {
        console.log('Auto logged in as:', data.user?.email);
        set({ user: data.user, session: data.session });
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
