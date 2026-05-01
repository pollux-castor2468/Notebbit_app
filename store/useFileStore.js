import { create } from 'zustand';
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

export const useFileStore = create((set, get) => ({
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
      versionNumber: 0,
      sourceNumber: 0,
      version: [],
      source: [],
    }));

    // Merge and sort
    const allFiles = [...mappedDocs, ...mappedDiaries].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    set({ data: allFiles });
  },

  createFile: (type, title = '未命名文件') => {
    const user = useAuthStore.getState().user;
    if (!user) return null;

    const newId = Crypto.randomUUID();
    const now = new Date();
    
    const newFile = {
      id: newId,
      title,
      type,
      date: formatDate(now),
      starred: false,
      content: '',
      versionNumber: 0,
      sourceNumber: 0,
      version: [],
      source: [],
    };
    
    set((state) => ({ data: [newFile, ...state.data] }));

    // Sync to Supabase
    if (type === 'document') {
      supabase.from('documents').insert({
        id: newId,
        user_id: user.id,
        title,
        content: '',
        is_starred: false,
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
      }).then(({ error }) => {
        if (error) console.error('Error inserting diary:', error);
      });
    }

    return newFile;
  },

  updateFile: (id, updates) => {
    set((state) => ({
      data: state.data.map(item => item.id === id ? { ...item, ...updates } : item)
    }));

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
      supabase.from('documents').update(dbUpdates).eq('id', id).then();
    } else if (file.type === 'diary') {
      if (updates.weather !== undefined) dbUpdates.weather = updates.weather;
      if (updates.mood !== undefined) dbUpdates.mood = updates.mood;
      supabase.from('diaries').update(dbUpdates).eq('id', id).then();
    }
  },

  setData: (updater) => set((state) => ({ 
    data: typeof updater === 'function' ? updater(state.data) : updater 
  })),

  deleteItem: (id) => {
    const file = get().data.find(f => f.id === id);
    if (!file) return;
    
    set((state) => ({
      data: state.data.filter(item => item.id !== id)
    }));

    if (file.type === 'document') {
      supabase.from('documents').delete().eq('id', id).then();
    } else {
      supabase.from('diaries').delete().eq('id', id).then();
    }
  },

  toggleStar: (id) => {
    const file = get().data.find(f => f.id === id);
    if (!file) return;

    const newStarred = !file.starred;
    set((state) => ({
      data: state.data.map(item => item.id === id ? { ...item, starred: newStarred } : item)
    }));

    if (file.type === 'document') {
      supabase.from('documents').update({ is_starred: newStarred }).eq('id', id).then();
    }
  },

  saveVersion: (id, versionTitle) => {
    const file = get().data.find(f => f.id === id);
    if (!file || file.type !== 'document') return;

    const versionId = Crypto.randomUUID();
    const now = new Date();

    const newVersion = {
      versionId,
      versionTitle,
      versionDate: formatDate(now),
      versionContent: file.content,
    };

    set((state) => ({
      data: state.data.map(item => {
        if (item.id === id) {
          return {
            ...item,
            versionNumber: item.versionNumber + 1,
            version: [newVersion, ...(item.version || [])],
          };
        }
        return item;
      })
    }));

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
    set((state) => ({
      data: state.data.map(item => {
        if (item.id === id) {
          return {
            ...item,
            version: (item.version || []).filter(v => v.versionId !== versionId)
          };
        }
        return item;
      })
    }));

    supabase.from('document_versions').delete().eq('id', versionId).then();
  },

  addSource: (id) => {
    const file = get().data.find(f => f.id === id);
    if (!file || file.type !== 'document') return;

    const sourceId = Crypto.randomUUID();
    const newSource = {
      sourceId,
      sourceName: '',
      sourceContent: '',
    };

    set((state) => ({
      data: state.data.map(item => {
        if (item.id === id) {
          return {
            ...item,
            sourceNumber: item.sourceNumber + 1,
            source: [newSource, ...(item.source || [])],
          };
        }
        return item;
      })
    }));

    supabase.from('data_sources').insert({
      id: sourceId,
      doc_id: id,
      source_name: '',
      note: '',
    }).then();
  },

  updateSource: (fileId, sourceId, content) => {
    set((state) => ({
      data: state.data.map(item => {
        if (item.id === fileId) {
          return {
            ...item,
            source: (item.source || []).map(s =>
              s.sourceId === sourceId ? { ...s, sourceContent: content } : s
            )
          };
        }
        return item;
      })
    }));

    supabase.from('data_sources').update({ note: content }).eq('id', sourceId).then();
  },

  deleteSource: (fileId, sourceId) => {
    set((state) => ({
      data: state.data.map(item => {
        if (item.id === fileId) {
          return {
            ...item,
            source: (item.source || []).filter(s => s.sourceId !== sourceId)
          };
        }
        return item;
      })
    }));

    supabase.from('data_sources').delete().eq('id', sourceId).then();
  },

}));
