import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useFileStore = create(
  persist(
    (set) => ({
      data: [],

      setData: (updater) => set((state) => ({ 
        data: typeof updater === 'function' ? updater(state.data) : updater 
      })),

      addFile: (newFile) => set((state) => ({ 
        data: [newFile, ...state.data] 
      })),

      updateFileLocally: (id, updates, isSynced) => set((state) => ({
        data: state.data.map(item => item.id === id ? { ...item, ...updates, isSynced } : item)
      })),

      removeFileLocally: (id) => set((state) => ({
        data: state.data.filter(item => item.id !== id)
      })),

      addVersionLocally: (fileId, newVersion, isSynced) => set((state) => ({
        data: state.data.map(item => {
          if (item.id === fileId) {
            return {
              ...item,
              versionNumber: (item.versionNumber || 0) + 1,
              version: [newVersion, ...(item.version || [])],
              isSynced,
            };
          }
          return item;
        })
      })),

      removeVersionLocally: (fileId, versionId, isSynced) => set((state) => ({
        data: state.data.map(item => {
          if (item.id === fileId) {
            return {
              ...item,
              version: (item.version || []).filter(v => v.versionId !== versionId),
              isSynced,
            };
          }
          return item;
        })
      })),

      addSourceLocally: (fileId, newSource, isSynced) => set((state) => ({
        data: state.data.map(item => {
          if (item.id === fileId) {
            return {
              ...item,
              sourceNumber: (item.sourceNumber || 0) + 1,
              source: [newSource, ...(item.source || [])],
              isSynced,
            };
          }
          return item;
        })
      })),

      updateSourceLocally: (fileId, sourceId, content, isSynced) => set((state) => ({
        data: state.data.map(item => {
          if (item.id === fileId) {
            return {
              ...item,
              source: (item.source || []).map(s =>
                s.sourceId === sourceId ? { ...s, sourceContent: content, isSynced } : s
              ),
              isSynced,
            };
          }
          return item;
        })
      })),

      removeSourceLocally: (fileId, sourceId, isSynced) => set((state) => ({
        data: state.data.map(item => {
          if (item.id === fileId) {
            return {
              ...item,
              source: (item.source || []).filter(s => s.sourceId !== sourceId),
              isSynced,
            };
          }
          return item;
        })
      })),
      
      markAllAsSynced: () => set((state) => ({
        data: state.data.map(item => ({ 
          ...item, 
          isSynced: true, 
          version: (item.version || []).map(v => ({ ...v, isSynced: true })),
          source: (item.source || []).map(s => ({ ...s, isSynced: true }))
        }))
      })),
    }),
    {
      name: 'file-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
