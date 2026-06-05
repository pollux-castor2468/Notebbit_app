import { useTaskStore } from '../store/useTaskStore';
import { useAuthStore } from '../store/useAuthStore';
import { TaskService } from '../services/taskService';
import * as Crypto from 'expo-crypto';
import { checkLevelUp } from '../utils/leveling';

export const useTaskActions = () => {
  const store = useTaskStore();

  const fetchTasks = async () => {
    const today = new Date().toISOString().split('T')[0];

    // 1. Check and reset local offline tasks first
    const currentLocalTasks = useTaskStore.getState().tasks || [];
    let localChanged = false;
    const resetLocalTasks = currentLocalTasks.map(t => {
      const isCompletedToday = t.completed && t.completed_at && t.completed_at.startsWith(today);
      if (t.completed && !isCompletedToday) {
        localChanged = true;
        return {
          ...t,
          completed: false,
          completed_at: null,
        };
      }
      return t;
    });

    if (localChanged) {
      useTaskStore.getState().setTasks(resetLocalTasks);
    }

    const user = useAuthStore.getState().user;
    if (!user) return; // If not logged in, we only use local tasks, no fetching.

    try {
      let profile;
      try {
        profile = await TaskService.getProfile(user.id);
      } catch (err) {
        profile = await TaskService.createProfile(user.id);
      }

      // Fetch tasks AND completions in parallel!
      const [tasksData, completionsData] = await Promise.all([
        TaskService.getTasks(user.id),
        TaskService.fetchTaskCompletions(user.id)
      ]);

      const mappedCompletions = (completionsData || []).map(c => ({
        id: c.id,
        taskId: c.task_id,
        completedDate: c.completed_date,
        taskName: c.tasks?.task_name || '已刪除的任務',
        createdAt: c.created_at,
        isSynced: true,
      }));
      store.setTaskCompletions(mappedCompletions);

      // 2. Map tasks, determining today's completion state based on completionsData
      const mappedTasks = (tasksData || []).map(t => {
        const todayCompletion = mappedCompletions.find(
          c => c.taskId === t.id && c.completedDate === today
        );
        return {
          id: t.id,
          title: t.task_name,
          completed: !!todayCompletion,
          completed_at: todayCompletion ? todayCompletion.createdAt : null,
          created_at: t.created_at,
          isSynced: true,
        };
      });

      const todayCompleted = mappedTasks.filter(t => 
        t.completed && t.completed_at && t.completed_at.startsWith(today)
      ).length;

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
            created_at: new Date().toISOString().split('T')[0] // fallback
          });
        } catch (e) {
          console.error('Sync upsert task error', e);
        }
      }
      state.markTasksAsSynced();
    }

    // 2.5. Process completions
    const localCompletions = state.taskCompletions.filter(c => c.isSynced === false);
    if (localCompletions.length > 0) {
      for (const c of localCompletions) {
        try {
          await TaskService.insertTaskCompletion({
            id: c.id,
            task_id: c.taskId,
            user_id: user.id,
            completed_date: c.completedDate,
          });
        } catch (e) {
          console.error('Sync task completion error', e);
        }
      }
      state.setTaskCompletions(state.taskCompletions.map(c => ({ ...c, isSynced: true })));
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
    
    // Add completion record locally
    const newCompletionId = Crypto.randomUUID();
    const newCompletion = {
      id: newCompletionId,
      taskId: id,
      completedDate: today,
      taskName: taskToToggle.title,
      isSynced: !!user,
    };
    store.addTaskCompletionLocally(newCompletion);
    
    // Update Profile locally
    store.setExpLevel(newExp, newLevel, newDailyCount, newLastExpDate, !!user);

    if (!user) return; // Wait until sync

    // Sync task
    try {
      // Insert completion record to Supabase
      await TaskService.insertTaskCompletion({
        id: newCompletionId,
        task_id: id,
        user_id: user.id,
        completed_date: today,
      });

      // Sync profile if exp gained
      if (gainedExp) {
        await TaskService.updateProfileExp(user.id, newExp, newLevel);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      // Mark as unsynced if network fails
      store.updateTaskState(id, { isSynced: false });
      
      // Also mark completion as unsynced
      store.setTaskCompletions(
        store.taskCompletions.map(c => c.id === newCompletionId ? { ...c, isSynced: false } : c)
      );

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
