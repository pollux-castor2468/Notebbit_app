import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const customStorage = {
  getItem: (name) => {
    if (Platform.OS === 'web') return localStorage.getItem(name);
    return AsyncStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (Platform.OS === 'web') return localStorage.setItem(name, value);
    return AsyncStorage.setItem(name, value);
  },
  removeItem: (name) => {
    if (Platform.OS === 'web') return localStorage.removeItem(name);
    return AsyncStorage.removeItem(name);
  },
};

export const useSettingsStore = create(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setIsDarkMode: (value) => set({ isDarkMode: value }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => customStorage),
    }
  )
);
