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

export const useTaskStore = create(
  persist(
    (set) => ({
      tasks: [
        { id: '1', title: '完成今天的日記', completed: true },
        { id: '2', title: '完成心得報告800字', completed: true },
        { id: '3', title: '完成app簡報', completed: false },
        { id: '4', title: '走10000步', completed: false },
      ],
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      })),
      addTask: (title) => set((state) => ({
        tasks: [...state.tasks, { id: String(Date.now()), title, completed: false }]
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => customStorage),
    }
  )
);
