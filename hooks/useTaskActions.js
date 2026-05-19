import { useTaskStore } from '../store/useTaskStore';
import { useAuthStore } from '../store/useAuthStore';
import { TaskService } from '../services/taskService';
import * as Crypto from 'expo-crypto';

export const useTaskActions = () => {
  const store = useTaskStore();

  const fetchTasks = async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      store.clearTasks();
      return;
    }

    try {
      let profile;
      try {
        profile = await TaskService.getProfile(user.id);
      } catch (err) {
        profile = await TaskService.createProfile(user.id);
      }

      const tasksData = await TaskService.getTasks(user.id);

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

      store.setTasks(mappedTasks);
      store.setExpLevel(
        profile?.total_exp || 0,
        profile?.current_level || 1,
        todayCompleted,
        today
      );
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const toggleTask = async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const taskToToggle = store.tasks.find(t => t.id === id);
    if (!taskToToggle || taskToToggle.completed) {
      return; // Lock when completed
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    
    let newDailyCount = store.lastExpDate !== today ? 0 : store.dailyExpCount;
    let newExp = store.exp;
    let newLevel = store.level;
    let newLastExpDate = store.lastExpDate !== today ? today : store.lastExpDate;

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
    store.updateTaskState(id, { completed: true, completed_at: now });
    store.setExpLevel(newExp, newLevel, newDailyCount, newLastExpDate);

    // Sync task
    try {
      await TaskService.updateTask(id, {
        is_completed: true,
        completed_at: now
      });

      // Sync profile if exp gained
      if (gainedExp) {
        await TaskService.updateProfileExp(user.id, newExp, newLevel);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      // Ideally revert state on error, simplified here
    }
  };

  const addTask = async (title) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const newId = Crypto.randomUUID();
    const today = new Date().toISOString().split('T')[0];

    const newTask = {
      id: newId,
      title,
      completed: false,
    };

    store.addTask(newTask);

    try {
      await TaskService.createTask({
        id: newId,
        user_id: user.id,
        task_name: title,
        is_completed: false,
        created_at: today,
      });
    } catch (error) {
      console.error('Error adding task:', error);
      store.removeTask(newId);
    }
  };

  const deleteTask = async (id) => {
    const originalTasks = [...store.tasks];
    store.removeTask(id);

    try {
      await TaskService.deleteTask(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      store.setTasks(originalTasks);
    }
  };

  const updateTask = async (id, newTitle) => {
    store.updateTaskState(id, { title: newTitle });

    try {
      await TaskService.updateTask(id, { task_name: newTitle });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return {
    fetchTasks,
    toggleTask,
    addTask,
    deleteTask,
    updateTask,
  };
};
