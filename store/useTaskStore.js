import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

//總之這是關於自訂任的內容儲存的地方
//如果是用web的話就用其他方式儲存(這是AI加的吧(AI自己稱讚自己诶
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
// const customStorage = {
//   getItem: async (name) => {
//     if (typeof window !== 'undefined') {
//       return localStorage.getItem(name);
//     }
//     return AsyncStorage.getItem(name);
//   },
//   setItem: async (name, value) => {
//     if (typeof window !== 'undefined') {
//       return localStorage.setItem(name, value);
//     }
//     return AsyncStorage.setItem(name, value);
//   },
//   removeItem: async (name) => {
//     if (typeof window !== 'undefined') {
//       return localStorage.removeItem(name);
//     }
//     return AsyncStorage.removeItem(name);
//   },
// };

export const useTaskStore = create(
  persist(
    (set) => ({
      tasks: [
        { id: '1', title: '完成今天的日記', completed: true },
        { id: '2', title: '完成心得報告800字', completed: true },
        { id: '3', title: '完成app簡報', completed: false },
        { id: '4', title: '走10000步', completed: false },
      ],
      //切換任務狀態
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      })),
      //新增任務
      addTask: (title) => set((state) => ({
        tasks: [...state.tasks, { id: String(Date.now()), title, completed: false }]
      })),
      //刪除任務(這也是AI自己加的吧我又沒有設計這個
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
      //修改任務內容
      updateTask: (id, newTitle) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, title: newTitle } : t)
      })),
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => customStorage),
    }
  )
);
