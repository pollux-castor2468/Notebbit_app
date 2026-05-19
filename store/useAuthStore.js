import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isLoading: false,
  
  profileName: '未登入',
  profileDesc: '',
  profileAvatar: null,

  setAuth: (user, session) => set({ user, session }),
  setProfile: (name, desc, avatar) => set({ 
    profileName: name, 
    profileDesc: desc, 
    profileAvatar: avatar 
  }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => set({ 
    user: null, 
    session: null, 
    profileName: '未登入', 
    profileDesc: '', 
    profileAvatar: null 
  }),
}));
