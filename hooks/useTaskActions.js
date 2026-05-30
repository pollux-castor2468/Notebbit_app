import { useTaskStore } from '../store/useTaskStore';
import { useAuthStore } from '../store/useAuthStore';
import { TaskService } from '../services/taskService';
import * as Crypto from 'expo-crypto';
import { checkLevelUp } from '../utils/leveling';

export const useTaskActions = () => {
  const store = useTaskStore();

  const fetchTasks = async () => {
    const user = useAuthStore.getState().user;
    if (!user) return; // If not logged in, we only use local tasks, no fetching.

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
        created_at: t.created_at,
        isSynced: true,
      }));

      // Merge local offline tasks with fetched server tasks
      const localData = useTaskStore.getState().tasks.filter(t => t.isSynced === false);
      const allTasks = [...localData, ...mappedTasks];

      store.setTasks(allTasks);

      // Only overwrite exp/level if profile is fully synced
      if (store.profileIsSynced) {
        store.setExpLevel(
          profile?.total_exp || 0,
          profile?.current_level || 1,
          todayCompleted,
          today,
          true
        );
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const syncLocalTasksToCloud = async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const state = useTaskStore.getState();
    const tasks = state.tasks;
    const localTasks = tasks.filter(t => t.isSynced === false);
    const pendingDeleted = state.pendingDeletedTaskIds;

    // 1. Process deletes
    if (pendingDeleted.length > 0) {
      for (const id of pendingDeleted) {
        try {
          await TaskService.deleteTask(id);
        } catch (e) {
          console.error('Sync delete task error', e);
        }
      }
      state.clearPendingDeletes();
    }

    // 2. Process upserts
    if (localTasks.length > 0) {
      for (const t of localTasks) {
        try {
          await TaskService.upsertTask({
            id: t.id,
            user_id: user.id,
            task_name: t.title,
            is_completed: t.completed,
            completed_at: t.completed_at || null,
            created_at: new Date().toISOString().split('T')[0] // fallback
          });
        } catch (e) {
          console.error('Sync upsert task error', e);
        }
      }
      state.markTasksAsSynced();
    }

    // 3. Process profile
    if (!state.profileIsSynced) {
      try {
        await TaskService.updateProfileExp(user.id, state.exp, state.level);
        state.markProfileAsSynced();
      } catch (e) {
        console.error('Sync profile exp error', e);
      }
    }
  };

  const toggleTask = async (id) => {
    const user = useAuthStore.getState().user;
    
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

      const levelUpResult = checkLevelUp(newLevel, newExp);
      if (levelUpResult.isLevelUp) {
        newLevel = levelUpResult.nextLevel;
        newExp = levelUpResult.remainingExp;
      }
    }

    // Optimistic Update locally
    store.updateTaskState(id, { completed: true, completed_at: now, isSynced: !!user });
    
    // Update Profile locally
    store.setExpLevel(newExp, newLevel, newDailyCount, newLastExpDate, !!user);

    if (!user) return; // Wait until sync

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
      // Mark as unsynced if network fails
      store.updateTaskState(id, { isSynced: false });
      if (gainedExp) store.setExpLevel(newExp, newLevel, newDailyCount, newLastExpDate, false);
    }
  };

  const addTask = async (title) => {
    const user = useAuthStore.getState().user;
    const newId = Crypto.randomUUID();
    const today = new Date().toISOString().split('T')[0];

    const newTask = {
      id: newId,
      title,
      completed: false,
      isSynced: !!user,
    };

    store.addTask(newTask);

    if (!user) return;

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
      store.updateTaskState(newId, { isSynced: false });
    }
  };

  const deleteTask = async (id) => {
    const user = useAuthStore.getState().user;
    const taskToDelete = store.tasks.find(t => t.id === id);
    
    if (!taskToDelete) return;
    
    const wasSynced = taskToDelete.isSynced;
    store.removeTask(id);

    if (!user) {
      // If offline and it was synced to server, remember to delete it later
      if (wasSynced) {
        store.addPendingDelete(id);
      }
      return;
    }

    try {
      await TaskService.deleteTask(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      store.addPendingDelete(id);
    }
  };

  const updateTask = async (id, newTitle) => {
    const user = useAuthStore.getState().user;
    
    store.updateTaskState(id, { title: newTitle, isSynced: !!user });

    if (!user) return;

    try {
      await TaskService.updateTask(id, { task_name: newTitle });
    } catch (error) {
      console.error('Error updating task:', error);
      store.updateTaskState(id, { isSynced: false });
    }
  };

  return {
    fetchTasks,
    syncLocalTasksToCloud,
    toggleTask,
    addTask,
    deleteTask,
    updateTask,
  };
};
