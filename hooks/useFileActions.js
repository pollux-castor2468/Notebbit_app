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

export const useFileActions = () => {

  const fetchFiles = async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const docs = await FileService.fetchDocuments(user.id);
      const diaries = await FileService.fetchDiaries(user.id);

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
            is_starred: file.starred,
            is_deleted: file.is_deleted,
          });

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
          is_starred: false,
          is_deleted: false,
        }).catch(e => console.error('Error inserting document:', e));
      } else if (type === 'diary') {
        FileService.insertDiary({
          id: newId,
          user_id: user.id,
          title,
          content: '',
          diary_date: now.toISOString().split('T')[0],
          is_deleted: false,
        }).catch(e => console.error('Error inserting diary:', e));
      }
    }

    return newFile;
  };

  const updateFile = (id, updates) => {
    const user = useAuthStore.getState().user;
    useFileStore.getState().updateFileLocally(id, updates, !!user);

    if (!user) return;

    const data = useFileStore.getState().data;
    const file = data.find(f => f.id === id);
    if (!file) return;

    const dbUpdates = {
      title: updates.title !== undefined ? updates.title : file.title,
      content: updates.content !== undefined ? updates.content : file.content,
      updated_at: new Date().toISOString(),
    };

    if (file.type === 'document') {
      if (updates.starred !== undefined) dbUpdates.is_starred = updates.starred;
      if (updates.is_deleted !== undefined) dbUpdates.is_deleted = updates.is_deleted;
      FileService.updateDocument(id, dbUpdates).catch(e => console.error(e));
    } else if (file.type === 'diary') {
      if (updates.weather !== undefined) dbUpdates.weather = updates.weather;
      if (updates.mood !== undefined) dbUpdates.mood = updates.mood;
      if (updates.is_deleted !== undefined) dbUpdates.is_deleted = updates.is_deleted;
      FileService.updateDiary(id, dbUpdates).catch(e => console.error(e));
    }
  };

  const deleteItem = (id) => updateFile(id, { is_deleted: true });
  const restoreItem = (id) => updateFile(id, { is_deleted: false });

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
