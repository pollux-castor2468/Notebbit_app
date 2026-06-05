import React from 'react';
import { useFileStore } from '../store/useFileStore';
import { useAuthStore } from '../store/useAuthStore';
import { FileService } from '../services/fileService';
import * as Crypto from 'expo-crypto';

// Helper to format date
const formatDate = (dateObj) => {
  if (!dateObj) return '';
  const d = new Date(dateObj);
  if (isNaN(d)) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const stripHtmlTags = (html) => html ? String(html).replace(/<[^>]*>?/gm, '') : '';

const getDiffSnippet = (oldText, newText) => {
  if (!oldText) return newText.substring(0, 30).trim();
  if (!newText) return '';
  let i = 0;
  while (i < oldText.length && i < newText.length && oldText[i] === newText[i]) {
    i++;
  }
  return newText.substring(i, i + 30).trim() || newText.substring(Math.max(0, i - 15), i + 15).trim();
};


export const useFileActions = () => {

  const fetchFiles = async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const [docs, diaries, tagsData] = await Promise.all([
        FileService.fetchDocuments(user.id),
        FileService.fetchDiaries(user.id),
        FileService.fetchTags(user.id),
      ]);

      const mappedTags = (tagsData || []).map(t => ({
        id: t.id,
        name: t.name
      }));
      useFileStore.getState().setGlobalTags(mappedTags);

      const mappedDocs = (docs || []).map(doc => ({
        id: doc.id,
        title: doc.title,
        type: 'document',
        date: formatDate(doc.updated_at),
        starred: doc.is_starred,
        content: doc.content || '',
        edited_dates: doc.edited_dates || [],
        daily_snippets: doc.daily_snippets || {},
        is_deleted: doc.is_deleted || false,
        tags: (doc.tags || []).map(t => t.tag?.name).filter(Boolean),
        versionNumber: doc.version?.length || 0,
        sourceNumber: doc.source?.length || 0,
        version: (doc.version || []).map(v => ({
          versionId: v.id,
          versionTitle: v.version_name,
          versionDate: formatDate(v.created_at),
          versionContent: v.content_snapshot,
          isSynced: true,
        })).sort((a, b) => new Date(b.versionDate) - new Date(a.versionDate)),
        source: (doc.source || []).map(s => {
          let parsedMarkedText = [];
          try {
            if (s.marked_text) {
               if (s.marked_text.startsWith('[')) {
                 parsedMarkedText = JSON.parse(s.marked_text);
               } else {
                 parsedMarkedText = [s.marked_text];
               }
            }
          } catch(e) {
            parsedMarkedText = [s.marked_text];
          }
          return {
            sourceId: s.id,
            sourceName: s.source_name || '',
            sourceContent: s.note || '',
            markedText: parsedMarkedText,
            isSynced: true,
          };
        }),
        isSynced: true,
      }));

      const mappedDiaries = (diaries || []).map(diary => ({
        id: diary.id,
        title: diary.title,
        type: 'diary',
        date: formatDate(diary.updated_at),
        diary_date: diary.diary_date,
        weather: diary.weather,
        mood: diary.mood,
        starred: false,
        content: diary.content || '',
        edited_dates: diary.edited_dates || [],
        daily_snippets: diary.daily_snippets || {},
        is_deleted: diary.is_deleted || false,
        tags: [],
        versionNumber: 0,
        sourceNumber: 0,
        version: [],
        source: [],
        isSynced: true,
      }));

      const localData = useFileStore.getState().data.filter(item => item.isSynced === false);
      const allFiles = [...localData, ...mappedDocs, ...mappedDiaries].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      useFileStore.getState().setData(allFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const syncLocalDataToCloud = async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const data = useFileStore.getState().data;
    const localData = data.filter(item => item.isSynced === false);
    if (localData.length === 0) return;

    for (const file of localData) {
      if (file.type === 'document') {
        try {
          await FileService.upsertDocument({
            id: file.id,
            user_id: user.id,
            title: file.title,
            content: file.content,
            edited_dates: file.edited_dates || [],
            daily_snippets: file.daily_snippets || {},
            is_starred: file.starred,
            is_deleted: file.is_deleted,
          });

          const globalTags = useFileStore.getState().globalTags || [];
          const tagIds = (file.tags || []).map(tagName => {
            const found = globalTags.find(t => t.name === tagName);
            return found ? found.id : null;
          }).filter(Boolean);
          await FileService.updateDocumentTags(file.id, tagIds);

          if (file.version && file.version.length > 0) {
            for (const v of file.version) {
              if (v.isSynced === false) {
                await FileService.upsertDocumentVersion({
                  id: v.versionId,
                  doc_id: file.id,
                  version_name: v.versionTitle,
                  content_snapshot: v.versionContent,
                });
              }
            }
          }
          if (file.source && file.source.length > 0) {
            for (const s of file.source) {
              if (s.isSynced === false) {
                await FileService.upsertDataSource({
                  id: s.sourceId,
                  doc_id: file.id,
                  user_id: user.id,
                  source_name: s.sourceName,
                  note: s.sourceContent,
                  marked_text: JSON.stringify(s.markedText || []),
                });
              }
            }
          }
        } catch (e) { console.error('Sync doc error', e); }
      } else if (file.type === 'diary') {
        let dDate = new Date().toISOString().split('T')[0];
        try {
           if (file.diary_date) dDate = file.diary_date;
           else if (file.date) dDate = new Date(file.date.replace(/\./g, '-')).toISOString().split('T')[0];
        } catch(e) {}
        
        try {
          await FileService.upsertDiary({
            id: file.id,
            user_id: user.id,
            title: file.title,
            content: file.content,
            weather: file.weather || null,
            mood: file.mood || null,
            diary_date: dDate,
            edited_dates: file.edited_dates || [],
            daily_snippets: file.daily_snippets || {},
            is_deleted: file.is_deleted,
          });
        } catch (e) { console.error('Sync diary error', e); }
      }
    }

    useFileStore.getState().markAllAsSynced();
  };

  const createFile = (type, title = '未命名文件') => {
    const user = useAuthStore.getState().user;
    const newId = Crypto.randomUUID();
    const now = new Date();
    const isSynced = !!user;
    
    const newFile = {
      id: newId,
      title,
      type,
      date: formatDate(now),
      starred: false,
      content: '',
      edited_dates: [now.toISOString().split('T')[0]],
      daily_snippets: {},
      is_deleted: false,
      tags: [],
      versionNumber: 0,
      sourceNumber: 0,
      version: [],
      source: [],
      isSynced,
    };
    
    useFileStore.getState().addFile(newFile);

    if (user) {
      if (type === 'document') {
        FileService.insertDocument({
          id: newId,
          user_id: user.id,
          title,
          content: '',
          edited_dates: [now.toISOString().split('T')[0]],
          daily_snippets: {},
          is_starred: false,
          is_deleted: false,
        }).catch(e => console.error('Error inserting document:', e));
      } else if (type === 'diary') {
        FileService.insertDiary({
          id: newId,
          user_id: user.id,
          title,
          content: '',
          edited_dates: [now.toISOString().split('T')[0]],
          daily_snippets: {},
          diary_date: now.toISOString().split('T')[0],
          is_deleted: false,
        }).catch(e => console.error('Error inserting diary:', e));
      }
    }

    return newFile;
  };

  const updateFile = (id, updates) => {
    const data = useFileStore.getState().data;
    const file = data.find(f => f.id === id);
    if (!file) return;

    let isContentChanged = false;
    let isTitleChanged = false;

    if (updates.content !== undefined && updates.content !== file.content) isContentChanged = true;
    if (updates.title !== undefined && updates.title !== file.title) isTitleChanged = true;

    if ((file.type === 'document' || file.type === 'diary') && (isContentChanged || isTitleChanged)) {
      const todayStr = new Date().toISOString().split('T')[0];
      const currentEditedDates = file.edited_dates || [];
      const currentSnippets = file.daily_snippets || {};
      
      let snippet = '';
      if (isContentChanged) {
        const oldText = stripHtmlTags(file.content);
        const newText = stripHtmlTags(updates.content);
        if (oldText !== newText) {
          snippet = getDiffSnippet(oldText, newText);
        }
      }

      if (!currentEditedDates.includes(todayStr)) {
        updates.edited_dates = [...currentEditedDates, todayStr];
      }
      
      if (snippet) {
        updates.daily_snippets = { ...currentSnippets, [todayStr]: snippet };
      }
    }

    const user = useAuthStore.getState().user;
    useFileStore.getState().updateFileLocally(id, updates, !!user);

    if (!user) return;

    const updatedFile = useFileStore.getState().data.find(f => f.id === id);
    if (!updatedFile) return;

    const dbUpdates = {
      title: updates.title !== undefined ? updates.title : updatedFile.title,
      content: updates.content !== undefined ? updates.content : updatedFile.content,
      updated_at: new Date().toISOString(),
    };

    if (updatedFile.type === 'document') {
      if (updates.starred !== undefined) dbUpdates.is_starred = updates.starred;
      if (updates.is_deleted !== undefined) dbUpdates.is_deleted = updates.is_deleted;
      if (updates.edited_dates !== undefined) dbUpdates.edited_dates = updates.edited_dates;
      if (updates.daily_snippets !== undefined) dbUpdates.daily_snippets = updates.daily_snippets;
      FileService.updateDocument(id, dbUpdates).catch(e => console.error(e));

      if (updates.tags !== undefined) {
        const globalTags = useFileStore.getState().globalTags || [];
        const tagIds = updates.tags.map(tagName => {
          const found = globalTags.find(t => t.name === tagName);
          return found ? found.id : null;
        }).filter(Boolean);
        FileService.updateDocumentTags(id, tagIds).catch(e => console.error('Error updating doc tags:', e));
      }
    } else if (updatedFile.type === 'diary') {
      if (updates.weather !== undefined) dbUpdates.weather = updates.weather;
      if (updates.mood !== undefined) dbUpdates.mood = updates.mood;
      if (updates.is_deleted !== undefined) dbUpdates.is_deleted = updates.is_deleted;
      if (updates.edited_dates !== undefined) dbUpdates.edited_dates = updates.edited_dates;
      if (updates.daily_snippets !== undefined) dbUpdates.daily_snippets = updates.daily_snippets;
      FileService.updateDiary(id, dbUpdates).catch(e => console.error(e));
    }
  };

  const deleteItem = (id) => updateFile(id, { is_deleted: true });
  const restoreItem = (id) => updateFile(id, { is_deleted: false });

  const renameTag = (oldName, newName) => {
    const data = useFileStore.getState().data;
    const globalTags = useFileStore.getState().globalTags || [];
    const tag = globalTags.find(t => t.name === oldName);
    if (!tag) return;

    // Deduplicate tag name
    let uniqueName = newName.trim();
    let counter = 1;
    while (globalTags.some(t => t.name === uniqueName && t.id !== tag.id)) {
      uniqueName = `${newName.trim()}(${counter})`;
      counter++;
    }

    // Update globalTags in store
    const updatedGlobalTags = globalTags.map(t => t.id === tag.id ? { ...t, name: uniqueName } : t);
    useFileStore.getState().setGlobalTags(updatedGlobalTags);

    // Update documents tags list in store (only local update, database relies on tags table update)
    data.forEach(file => {
      if (file.type === 'document' && file.tags && file.tags.includes(oldName)) {
        const newTags = file.tags.map(t => t === oldName ? uniqueName : t);
        useFileStore.getState().updateFileLocally(file.id, { tags: newTags }, file.isSynced);
      }
    });

    const user = useAuthStore.getState().user;
    if (user) {
      FileService.updateTag(tag.id, { name: uniqueName }).catch(e => console.error(e));
    }
  };

  const deleteTag = (tagName) => {
    const data = useFileStore.getState().data;
    // Update documents tags list in store (only local update, database relies on Cascade Delete on tags table)
    data.forEach(file => {
      if (file.type === 'document' && file.tags && file.tags.includes(tagName)) {
        const newTags = file.tags.filter(t => t !== tagName);
        useFileStore.getState().updateFileLocally(file.id, { tags: newTags }, file.isSynced);
      }
    });
  };

  const deleteTagById = (id, tagName) => {
    const user = useAuthStore.getState().user;
    deleteTag(tagName);
    if (user) {
      FileService.deleteTagRecord(id).catch(e => console.error(e));
    }
  };

  const addNewTag = (name) => {
    const user = useAuthStore.getState().user;
    const newId = Crypto.randomUUID();
    
    // Deduplicate tag name
    const currentTags = useFileStore.getState().globalTags || [];
    let uniqueName = name.trim();
    let counter = 1;
    while (currentTags.some(t => t.name === uniqueName)) {
      uniqueName = `${name.trim()}(${counter})`;
      counter++;
    }

    const newTag = { id: newId, name: uniqueName };
    useFileStore.getState().setGlobalTags([...currentTags, newTag]);

    if (user) {
      FileService.insertTag({
        id: newId,
        user_id: user.id,
        name: uniqueName
      }).catch(e => console.error(e));
    }

    return uniqueName;
  };

  const permanentlyDeleteItem = (id) => {
    const user = useAuthStore.getState().user;
    const data = useFileStore.getState().data;
    const file = data.find(f => f.id === id);
    if (!file) return;
    
    useFileStore.getState().removeFileLocally(id);

    if (!user) return;

    if (file.type === 'document') {
      FileService.deleteDocument(id).catch(e => console.error(e));
    } else {
      FileService.deleteDiary(id).catch(e => console.error(e));
    }
  };

  const toggleStar = (id) => {
    const user = useAuthStore.getState().user;
    const data = useFileStore.getState().data;
    const file = data.find(f => f.id === id);
    if (!file) return;

    const newStarred = !file.starred;
    useFileStore.getState().updateFileLocally(id, { starred: newStarred }, !!user);

    if (!user) return;

    if (file.type === 'document') {
      FileService.updateDocument(id, { is_starred: newStarred }).catch(e => console.error(e));
    }
  };

  const saveVersion = (id, versionTitle) => {
    const user = useAuthStore.getState().user;
    const data = useFileStore.getState().data;
    const file = data.find(f => f.id === id);
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

    useFileStore.getState().addVersionLocally(id, newVersion, !!user);

    if (!user) return;

    FileService.insertDocumentVersion({
      id: versionId,
      doc_id: id,
      version_name: versionTitle,
      content_snapshot: file.content,
    }).catch(e => console.error(e));
  };

  const restoreVersion = (fileId, versionId) => {
    const data = useFileStore.getState().data;
    const file = data.find(f => f.id === fileId);
    if (!file) return;
    
    const v = (file.version || []).find(v => v.versionId === versionId);
    if (!v) return;

    updateFile(fileId, { content: v.versionContent });
  };

  const deleteVersion = (id, versionId) => {
    const user = useAuthStore.getState().user;
    useFileStore.getState().removeVersionLocally(id, versionId, !!user);

    if (!user) return;
    FileService.deleteDocumentVersion(versionId).catch(e => console.error(e));
  };

  const addSource = (id, markedText = '') => {
    const user = useAuthStore.getState().user;
    const data = useFileStore.getState().data;
    const file = data.find(f => f.id === id);
    if (!file || file.type !== 'document') return;

    const sourceId = Crypto.randomUUID();
    const newSource = {
      sourceId,
      sourceName: '',
      sourceContent: '',
      markedText: markedText ? [markedText] : [],
      isSynced: !!user,
    };

    useFileStore.getState().addSourceLocally(id, newSource, !!user);

    if (user) {
      FileService.insertDataSource({
        id: sourceId,
        doc_id: id,
        user_id: user.id,
        source_name: '',
        note: '',
        marked_text: JSON.stringify(markedText ? [markedText] : []),
      }).catch(e => console.error(e));
    }
    
    return sourceId;
  };

  const appendMarkedText = (fileId, sourceId, text) => {
    if (!text || text.trim() === '') return;
    const user = useAuthStore.getState().user;
    
    const data = useFileStore.getState().data;
    const file = data.find(f => f.id === fileId);
    if (!file) return;
    
    const source = (file.source || []).find(s => s.sourceId === sourceId);
    if (!source) return;

    useFileStore.getState().appendMarkedTextLocally(fileId, sourceId, text, !!user);

    if (!user) return;
    
    const currentMarkedText = Array.isArray(source.markedText) ? source.markedText : (source.markedText ? [source.markedText] : []);
    if (!currentMarkedText.includes(text)) {
      const newArray = [...currentMarkedText, text];
      FileService.updateDataSource(sourceId, { marked_text: JSON.stringify(newArray) }).catch(e => console.error(e));
    }
  };

  const updateSource = (fileId, sourceId, updates) => {
    const user = useAuthStore.getState().user;
    useFileStore.getState().updateSourceLocally(fileId, sourceId, updates, !!user);

    if (!user) return;
    
    const dbUpdates = {};
    if (updates.sourceName !== undefined) dbUpdates.source_name = updates.sourceName;
    if (updates.sourceContent !== undefined) dbUpdates.note = updates.sourceContent;
    
    if (Object.keys(dbUpdates).length > 0) {
      FileService.updateDataSource(sourceId, dbUpdates).catch(e => console.error(e));
    }
  };

  const deleteSource = (fileId, sourceId) => {
    const user = useAuthStore.getState().user;
    useFileStore.getState().removeSourceLocally(fileId, sourceId, !!user);

    if (!user) return;
    FileService.deleteDataSource(sourceId).catch(e => console.error(e));
  };

  return React.useMemo(() => ({
    fetchFiles,
    syncLocalDataToCloud,
    createFile,
    updateFile,
    deleteItem,
    restoreItem,
    renameTag,
    deleteTag: deleteTagById,
    addNewTag,
    permanentlyDeleteItem,
    toggleStar,
    saveVersion,
    restoreVersion,
    deleteVersion,
    addSource,
    appendMarkedText,
    updateSource,
    deleteSource,
  }), []);
};
