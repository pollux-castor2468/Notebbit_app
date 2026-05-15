import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../constants/supabase';
import { useAuthStore } from './useAuthStore';
import * as Crypto from 'expo-crypto';

// Helper to format date
const formatDate = (dateObj) => {
  if (!dateObj) return '';
  const d = new Date(dateObj);
  if (isNaN(d)) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const useFileStore = create(
  persist(
    (set, get) => ({
      data: [],

  fetchFiles: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Fetch documents with versions and sources
    const { data: docs, error: docError } = await supabase
      .from('documents')
      .select('*, version:document_versions(*), source:data_sources(*)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (docError) console.error('Error fetching docs:', docError);

    // Fetch diaries
    const { data: diaries, error: diaryError } = await supabase
      .from('diaries')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (diaryError) console.error('Error fetching diaries:', diaryError);

    // Map documents to local format
    const mappedDocs = (docs || []).map(doc => ({
      id: doc.id,
      title: doc.title,
      type: 'document',
      date: formatDate(doc.updated_at),
      starred: doc.is_starred,
      content: doc.content || '',
      is_deleted: doc.is_deleted || false,
      tags: doc.tags || [],
      versionNumber: doc.version?.length || 0,
      sourceNumber: doc.source?.length || 0,
      version: (doc.version || []).map(v => ({
        versionId: v.id,
        versionTitle: v.version_name,
        versionDate: formatDate(v.created_at),
        versionContent: v.content_snapshot,
      })).sort((a, b) => new Date(b.versionDate) - new Date(a.versionDate)),
      source: (doc.source || []).map(s => ({
        sourceId: s.id,
        sourceName: s.source_name || '',
        sourceContent: s.note || '',
        markedText: s.marked_text || '',
      })),
    }));

    // Map diaries to local format
    const mappedDiaries = (diaries || []).map(diary => ({
      id: diary.id,
      title: diary.title,
      type: 'diary',
      date: formatDate(diary.updated_at),
      diary_date: diary.diary_date,
      weather: diary.weather,
      mood: diary.mood,
      starred: false, // Diaries don't have is_starred in DB
      content: diary.content || '',
      is_deleted: diary.is_deleted || false,
      tags: [],
      versionNumber: 0,
      sourceNumber: 0,
      version: [],
      source: [],
      isSynced: true,
    }));

    // Retain local unsynced files
    const localData = get().data.filter(item => item.isSynced === false);

    // Merge and sort (cloud overrides local if id matches, though UUID collisions are rare)
    const allFiles = [...localData, ...mappedDocs, ...mappedDiaries].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    set({ data: allFiles });
  },

  createFile: (type, title = '未命名文件') => {
    const user = useAuthStore.getState().user;
    const newId = Crypto.randomUUID();
    const now = new Date();
    
    const newFile = {
      id: newId,
      title,
      type,
      date: formatDate(now),
      starred: false,
      content: '',
      is_deleted: false,
      tags: [],
      versionNumber: 0,
      sourceNumber: 0,
      version: [],
      source: [],
      isSynced: !!user,
    };
    
    set((state) => ({ data: [newFile, ...state.data] }));

    // Sync to Supabase
    if (user) {
      if (type === 'document') {
        supabase.from('documents').insert({
          id: newId,
          user_id: user.id,
          title,
          content: '',
          is_starred: false,
          is_deleted: false,
        }).then(({ error }) => {
          if (error) console.error('Error inserting document:', error);
        });
      } else if (type === 'diary') {
        supabase.from('diaries').insert({
          id: newId,
          user_id: user.id,
          title,
          content: '',
          diary_date: now.toISOString().split('T')[0],
          is_deleted: false,
        }).then(({ error }) => {
          if (error) console.error('Error inserting diary:', error);
        });
      }
    }

    return newFile;
  },

  updateFile: (id, updates) => {
    const user = useAuthStore.getState().user;
    set((state) => ({
      data: state.data.map(item => item.id === id ? { ...item, ...updates, isSynced: !!user } : item)
    }));

    if (!user) return;

    // Sync to Supabase
    const file = get().data.find(f => f.id === id);
    if (!file) return;

    const dbUpdates = {
      title: updates.title !== undefined ? updates.title : file.title,
      content: updates.content !== undefined ? updates.content : file.content,
      updated_at: new Date().toISOString(),
    };

    if (file.type === 'document') {
      if (updates.starred !== undefined) dbUpdates.is_starred = updates.starred;
      if (updates.is_deleted !== undefined) dbUpdates.is_deleted = updates.is_deleted;
      supabase.from('documents').update(dbUpdates).eq('id', id).then();
    } else if (file.type === 'diary') {
      if (updates.weather !== undefined) dbUpdates.weather = updates.weather;
      if (updates.mood !== undefined) dbUpdates.mood = updates.mood;
      if (updates.is_deleted !== undefined) dbUpdates.is_deleted = updates.is_deleted;
      supabase.from('diaries').update(dbUpdates).eq('id', id).then();
    }
  },

  setData: (updater) => set((state) => ({ 
    data: typeof updater === 'function' ? updater(state.data) : updater 
  })),

  deleteItem: (id) => {
    // Soft delete
    get().updateFile(id, { is_deleted: true });
  },

  restoreItem: (id) => {
    get().updateFile(id, { is_deleted: false });
  },

  permanentlyDeleteItem: (id) => {
    const user = useAuthStore.getState().user;
    const file = get().data.find(f => f.id === id);
    if (!file) return;
    
    set((state) => ({
      data: state.data.filter(item => item.id !== id)
    }));

    if (!user) return;

    if (file.type === 'document') {
      supabase.from('documents').delete().eq('id', id).then();
    } else {
      supabase.from('diaries').delete().eq('id', id).then();
    }
  },

  toggleStar: (id) => {
    const user = useAuthStore.getState().user;
    const file = get().data.find(f => f.id === id);
    if (!file) return;

    const newStarred = !file.starred;
    set((state) => ({
      data: state.data.map(item => item.id === id ? { ...item, starred: newStarred, isSynced: !!user } : item)
    }));

    if (!user) return;

    if (file.type === 'document') {
      supabase.from('documents').update({ is_starred: newStarred }).eq('id', id).then();
    }
  },

  saveVersion: (id, versionTitle) => {
    const user = useAuthStore.getState().user;
    const file = get().data.find(f => f.id === id);
    if (!file || file.type !== 'document') return;

    const versionId = Crypto.randomUUID();
    const now = new Date();

    const newVersion = {
      versionId,
      versionTitle,
      versionDate: formatDate(now),
      versionContent: file.content,
      isSynced: !!user,
    };

    set((state) => ({
      data: state.data.map(item => {
        if (item.id === id) {
          return {
            ...item,
            versionNumber: item.versionNumber + 1,
            version: [newVersion, ...(item.version || [])],
            isSynced: !!user,
          };
        }
        return item;
      })
    }));

    if (!user) return;

    supabase.from('document_versions').insert({
      id: versionId,
      doc_id: id,
      version_name: versionTitle,
      content_snapshot: file.content,
    }).then();
  },

  restoreVersion: (fileId, versionId) => {
    const file = get().data.find(f => f.id === fileId);
    if (!file) return;
    
    const v = (file.version || []).find(v => v.versionId === versionId);
    if (!v) return;

    get().updateFile(fileId, { content: v.versionContent });
  },

  deleteVersion: (id, versionId) => {
    const user = useAuthStore.getState().user;
    set((state) => ({
      data: state.data.map(item => {
        if (item.id === id) {
          return {
            ...item,
            version: (item.version || []).filter(v => v.versionId !== versionId),
            isSynced: !!user,
          };
        }
        return item;
      })
    }));

    if (!user) return;
    supabase.from('document_versions').delete().eq('id', versionId).then();
  },

  addSource: (id) => {
    const user = useAuthStore.getState().user;
    const file = get().data.find(f => f.id === id);
    if (!file || file.type !== 'document') return;

    const sourceId = Crypto.randomUUID();
    const newSource = {
      sourceId,
      sourceName: '',
      sourceContent: '',
      isSynced: !!user,
    };

    set((state) => ({
      data: state.data.map(item => {
        if (item.id === id) {
          return {
            ...item,
            sourceNumber: item.sourceNumber + 1,
            source: [newSource, ...(item.source || [])],
            isSynced: !!user,
          };
        }
        return item;
      })
    }));

    if (!user) return;
    supabase.from('data_sources').insert({
      id: sourceId,
      doc_id: id,
      source_name: '',
      note: '',
    }).then();
  },

  updateSource: (fileId, sourceId, content) => {
    const user = useAuthStore.getState().user;
    set((state) => ({
      data: state.data.map(item => {
        if (item.id === fileId) {
          return {
            ...item,
            source: (item.source || []).map(s =>
              s.sourceId === sourceId ? { ...s, sourceContent: content, isSynced: !!user } : s
            ),
            isSynced: !!user,
          };
        }
        return item;
      })
    }));

    if (!user) return;
    supabase.from('data_sources').update({ note: content }).eq('id', sourceId).then();
  },

  deleteSource: (fileId, sourceId) => {
    const user = useAuthStore.getState().user;
    set((state) => ({
      data: state.data.map(item => {
        if (item.id === fileId) {
          return {
            ...item,
            source: (item.source || []).filter(s => s.sourceId !== sourceId),
            isSynced: !!user,
          };
        }
        return item;
      })
    }));

    if (!user) return;
    supabase.from('data_sources').delete().eq('id', sourceId).then();
  },

  syncLocalDataToCloud: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const localData = get().data.filter(item => item.isSynced === false);
    if (localData.length === 0) return;

    for (const file of localData) {
      if (file.type === 'document') {
        const { error } = await supabase.from('documents').upsert({
          id: file.id,
          user_id: user.id,
          title: file.title,
          content: file.content,
          is_starred: file.starred,
          is_deleted: file.is_deleted,
        });

        if (!error && file.version && file.version.length > 0) {
          for (const v of file.version) {
            if (v.isSynced === false) {
              await supabase.from('document_versions').upsert({
                id: v.versionId,
                doc_id: file.id,
                version_name: v.versionTitle,
                content_snapshot: v.versionContent,
              });
            }
          }
        }
        if (!error && file.source && file.source.length > 0) {
          for (const s of file.source) {
            if (s.isSynced === false) {
              await supabase.from('data_sources').upsert({
                id: s.sourceId,
                doc_id: file.id,
                source_name: s.sourceName,
                note: s.sourceContent,
                marked_text: s.markedText,
              });
            }
          }
        }
      } else if (file.type === 'diary') {
        let dDate = new Date().toISOString().split('T')[0];
        try {
           if (file.diary_date) dDate = file.diary_date;
           else if (file.date) dDate = new Date(file.date.replace(/\\./g, '-')).toISOString().split('T')[0];
        } catch(e) {}
        
        await supabase.from('diaries').upsert({
          id: file.id,
          user_id: user.id,
          title: file.title,
          content: file.content,
          weather: file.weather || null,
          mood: file.mood || null,
          diary_date: dDate,
          is_deleted: file.is_deleted,
        });
      }
    }

    // After uploading, mark as synced locally.
    set((state) => ({
      data: state.data.map(item => ({ 
        ...item, 
        isSynced: true, 
        version: (item.version || []).map(v => ({ ...v, isSynced: true })),
        source: (item.source || []).map(s => ({ ...s, isSynced: true }))
      }))
    }));
  },

}),
{
  name: 'file-storage',
  storage: createJSONStorage(() => AsyncStorage),
}
));
