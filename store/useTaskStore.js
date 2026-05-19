import { create } from 'zustand';

export const useTaskStore = create((set) => ({
  tasks: [],
  level: 1,
  exp: 0,
  lastExpDate: '',
  dailyExpCount: 0,

  setTasks: (tasks) => set({ tasks }),
  
  setExpLevel: (exp, level, dailyExpCount, lastExpDate) => set({
    exp,
    level,
    dailyExpCount,
    lastExpDate
  }),

  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task]
  })),

  updateTaskState: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),

  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id)
  })),
  
  clearTasks: () => set({ tasks: [], level: 1, exp: 0, lastExpDate: '', dailyExpCount: 0 }),
}));
