import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

//總之這一頁是關於自訂任的內容儲存的地方
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

export const useTaskStore = create(
  persist(
    (set) => ({
      //任務內容儲存陣列
      tasks: [
        { id: '1', title: '完成今天的日記', completed: false },
        { id: '2', title: '完成心得報告800字', completed: false },
      ],
      level: 1,
      exp: 0,
      lastExpDate: '',
      dailyExpCount: 0,
      //切換任務狀態
      toggleTask: (id) => set((state) => {
        const taskToToggle = state.tasks.find(t => t.id === id);
        if (!taskToToggle || taskToToggle.completed) {
          return state; // Lock when completed
        }

        const today = new Date().toISOString().split('T')[0];
        let newDailyCount = state.lastExpDate !== today ? 0 : state.dailyExpCount;
        let newExp = state.exp;
        let newLevel = state.level;
        let newLastExpDate = state.lastExpDate !== today ? today : state.lastExpDate;

        if (newDailyCount < 5) {
          newExp += 1;
          newDailyCount += 1;
          newLastExpDate = today;

          let maxExpNext = 5 * Math.pow(2, newLevel - 1);
          if (newExp >= maxExpNext) {
            newLevel += 1;
            newExp = 0;
          }
        }

        return {
          tasks: state.tasks.map(t => t.id === id ? { ...t, completed: true } : t),
          exp: newExp,
          level: newLevel,
          dailyExpCount: newDailyCount,
          lastExpDate: newLastExpDate,
        };
      }),
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
      storage: createJSONStorage(() => customStorage),  //用上面的方法儲存
    }
  )
);
