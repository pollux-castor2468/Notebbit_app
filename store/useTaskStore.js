import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useTaskStore = create(
  persist(
    (set) => ({
      tasks: [],
      level: 1,
      exp: 0,
      lastExpDate: '',
      dailyExpCount: 0,
      profileIsSynced: true,
      pendingDeletedTaskIds: [],
      taskCompletions: [],

      setTasks: (tasks) => set({ tasks }),

      setTaskCompletions: (completions) => set({ taskCompletions: completions }),

      addTaskCompletionLocally: (completion) => set((state) => ({
        taskCompletions: [completion, ...state.taskCompletions]
      })),
      
      setExpLevel: (exp, level, dailyExpCount, lastExpDate, profileIsSynced = true) => set({
        exp,
        level,
        dailyExpCount,
        lastExpDate,
        profileIsSynced
      }),

      addTask: (task) => set((state) => ({
        tasks: [task, ...state.tasks]
      })),

      updateTaskState: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
      })),

      removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
      
      clearTasks: () => set({ tasks: [], level: 1, exp: 0, lastExpDate: '', dailyExpCount: 0, profileIsSynced: true, pendingDeletedTaskIds: [], taskCompletions: [] }),

      markTasksAsSynced: () => set((state) => ({
        tasks: state.tasks.map(t => ({ ...t, isSynced: true }))
      })),

      markProfileAsSynced: () => set({ profileIsSynced: true }),

      addPendingDelete: (id) => set((state) => {
        if (!state.pendingDeletedTaskIds.includes(id)) {
          return { pendingDeletedTaskIds: [...state.pendingDeletedTaskIds, id] };
        }
        return state;
      }),

      clearPendingDeletes: () => set({ pendingDeletedTaskIds: [] }),
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
