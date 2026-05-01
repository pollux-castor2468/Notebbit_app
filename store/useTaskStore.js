import { create } from 'zustand';
import { supabase } from '../constants/supabase';
import { useAuthStore } from './useAuthStore';
import * as Crypto from 'expo-crypto';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  level: 1,
  exp: 0,
  lastExpDate: '',
  dailyExpCount: 0,

  fetchTasks: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Fetch user profile for exp and level
    const { data: profile, error: profileErr } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileErr && profileErr.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileErr);
    }
    
    // If no profile exists, create one
    let currentProfile = profile;
    if (!profile) {
      const { data: newProfile } = await supabase
        .from('user_profiles')
        .insert({ id: user.id, total_exp: 0, current_level: 1 })
        .select()
        .single();
      currentProfile = newProfile;
    }

    // Fetch tasks
    const { data: tasksData, error: tasksErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (tasksErr) console.error('Error fetching tasks:', tasksErr);

    // Compute daily count
    const today = new Date().toISOString().split('T')[0];
    const todayCompleted = (tasksData || []).filter(t => 
      t.is_completed && t.completed_at && t.completed_at.startsWith(today)
    ).length;

    const mappedTasks = (tasksData || []).map(t => ({
      id: t.id,
      title: t.task_name,
      completed: t.is_completed,
      completed_at: t.completed_at,
    }));

    set({
      tasks: mappedTasks,
      exp: currentProfile?.total_exp || 0,
      level: currentProfile?.current_level || 1,
      dailyExpCount: todayCompleted,
      lastExpDate: today,
    });
  },

  toggleTask: (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const taskToToggle = get().tasks.find(t => t.id === id);
    if (!taskToToggle || taskToToggle.completed) {
      return; // Lock when completed
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    
    let newDailyCount = get().lastExpDate !== today ? 0 : get().dailyExpCount;
    let newExp = get().exp;
    let newLevel = get().level;
    let newLastExpDate = get().lastExpDate !== today ? today : get().lastExpDate;

    let gainedExp = false;
    if (newDailyCount < 5) {
      newExp += 1;
      newDailyCount += 1;
      newLastExpDate = today;
      gainedExp = true;

      let maxExpNext = 5 * Math.pow(2, newLevel - 1);
      if (newExp >= maxExpNext) {
        newLevel += 1;
        newExp = 0;
      }
    }

    // Optimistic Update
    set((state) => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, completed: true, completed_at: now } : t),
      exp: newExp,
      level: newLevel,
      dailyExpCount: newDailyCount,
      lastExpDate: newLastExpDate,
    }));

    // Sync task
    supabase.from('tasks').update({
      is_completed: true,
      completed_at: now
    }).eq('id', id).then();

    // Sync profile if exp gained
    if (gainedExp) {
      supabase.from('user_profiles').update({
        total_exp: newExp,
        current_level: newLevel
      }).eq('id', user.id).then();
    }
  },

  addTask: (title) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const newId = Crypto.randomUUID();
    const today = new Date().toISOString().split('T')[0];

    const newTask = {
      id: newId,
      title,
      completed: false,
    };

    set((state) => ({
      tasks: [...state.tasks, newTask]
    }));

    supabase.from('tasks').insert({
      id: newId,
      user_id: user.id,
      task_name: title,
      is_completed: false,
      created_at: today,
    }).then();
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id)
    }));

    supabase.from('tasks').delete().eq('id', id).then();
  },

  updateTask: (id, newTitle) => {
    set((state) => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, title: newTitle } : t)
    }));

    supabase.from('tasks').update({ task_name: newTitle }).eq('id', id).then();
  },
}));
