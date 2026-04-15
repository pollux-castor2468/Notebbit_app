import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Platform } from 'react-native';

// const customStorage = {
//   getItem: (name) => {
//     if (Platform.OS === 'web') return localStorage.getItem(name);
//     return AsyncStorage.getItem(name);
//   },
//   setItem: (name, value) => {
//     if (Platform.OS === 'web') return localStorage.setItem(name, value);
//     return AsyncStorage.setItem(name, value);
//   },
//   removeItem: (name) => {
//     if (Platform.OS === 'web') return localStorage.removeItem(name);
//     return AsyncStorage.removeItem(name);
//   },
// };

export const useFileStore = create(
  (set) => ({
      data: [
        { id: '1', title: '第一份研究報告', type: 'document', date: '2026.04.04 11:46', starred: true },
        { id: '2', title: '日常隨記 01', type: 'diary', date: '2026.04.03 20:12', starred: false },
        { id: '3', title: '神秘森林考察', type: 'document', date: '2026.04.02 09:30', starred: true },
        { id: '4', title: '筆記：React Native', type: 'document', date: '2026.04.01 14:05', starred: false },
        { id: '5', title: '心情日記', type: 'diary', date: '2026.03.28 22:55', starred: true },
      ],
      createFile: (type, title = '未命名文件') => {
        const newId = String(Date.now());
        const date = new Date();
        const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        const newFile = {
          id: newId,
          title,
          type,
          date: formattedDate,
          starred: false,
          content: ''
        };
        set((state) => ({ data: [newFile, ...state.data] }));
        return newFile;
      },
      updateFile: (id, updates) => set((state) => ({
        data: state.data.map(item => item.id === id ? { ...item, ...updates } : item)
      })),
      setData: (updater) => set((state) => ({ 
        data: typeof updater === 'function' ? updater(state.data) : updater 
      })),
      deleteItem: (id) => set((state) => ({
        data: state.data.filter(item => item.id !== id)
      })),
      toggleStar: (id) => set((state) => ({
        data: state.data.map(item => item.id === id ? { ...item, starred: !item.starred } : item)
      })),
      saveVersion: (id, versionData) => set((state) => ({
        data: state.data.map(item => {
          if (item.id === id) {
            const versions = item.versions || [];
            return { ...item, versions: [versionData, ...versions] };
          }
          return item;
        })
      })),
      deleteVersion: (id, versionId) => set((state) => ({
        data: state.data.map(item => {
          if (item.id === id) {
             const versions = item.versions || [];
             return { ...item, versions: versions.filter(v => v.id !== versionId) };
          }
          return item;
        })
      })),
    }
  )
);
