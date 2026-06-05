import { supabase } from '../constants/supabase';

export const TaskService = {
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  createProfile: async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({ id: userId, total_exp: 0, current_level: 1 })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateProfileExp: async (userId, newExp, newLevel) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ total_exp: newExp, current_level: newLevel })
      .eq('id', userId);
    if (error) throw error;
  },

  getTasks: async (userId) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  createTask: async (taskData) => {
    const { error } = await supabase
      .from('tasks')
      .insert(taskData);
    if (error) throw error;
  },

  upsertTask: async (taskData) => {
    const { error } = await supabase
      .from('tasks')
      .upsert(taskData);
    if (error) throw error;
  },

  updateTask: async (taskId, updates) => {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);
    if (error) throw error;
  },

  deleteTask: async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    if (error) throw error;
  },

  fetchTaskCompletions: async (userId) => {
    const { data, error } = await supabase
      .from('task_completions')
      .select('*, tasks(task_name)')
      .eq('user_id', userId)
      .order('completed_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  insertTaskCompletion: async (completionData) => {
    const { error } = await supabase
      .from('task_completions')
      .insert(completionData);
    if (error) throw error;
  },

  deleteTaskCompletion: async (taskId, date) => {
    const { error } = await supabase
      .from('task_completions')
      .delete()
      .eq('task_id', taskId)
      .eq('completed_date', date);
    if (error) throw error;
  }
};
