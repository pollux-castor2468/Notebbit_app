import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Platform } from 'react-native';

// const customStorage = {
//   getItem: (name) => {
//     if (Platform.OS === 'web') return localStorage.getItem(name);
//     return AsyncStorage.getItem(name);
//   },
//   setItem: (name, value) => {
//     if (Platform.OS === 'web') return localStorage.setItem(name, value);
//     return AsyncStorage.setItem(name, value);
//   },
//   removeItem: (name) => {
//     if (Platform.OS === 'web') return localStorage.removeItem(name);
//     return AsyncStorage.removeItem(name);
//   },
// };

export const useFileStore = create(
  (set) => ({
      //所有文件內容
      data: [
        { id: '1', title: '第一份研究報告', type: 'document', 
          date: '2026.04.04 11:46', starred: true,
          content: '1、2、3',
          versionNumber: 2, //紀錄版本數量，用來設定id，每新增一個就+1
          sourceNumber: 1, //紀錄資料來源數量，用來設定id，每新增一個就+1
          version: [  //版本控制：每個版本要有id、版本名稱、儲存版本日期、版本內容(儲存版本時的檔案內容)
            {
              versionId: '2', versionTitle: '版本二', versionDate:'2026.04.03 15:25',
              versionContent: '1、2',
            },
            {
              versionId: '1', versionTitle: '版本一', versionDate: '2026.04.02 20:12',
              versionContent: '1',
            },
          ],
          source: [  //資料來源紀錄：每個紀錄要有id、標題、內容、內容段落位置(這個不知道要怎麼做...)
            {
              sourceId: '1', sourceContent: '關於這份研究的參考網址...',
            },
          ],
        },
        { id: '2', title: '日常隨記 01', type: 'diary', 
          date: '2026.04.03 20:12', starred: false,
          content: '',
          versionNumber: 0, //要記得日記沒有版本紀錄!
          sourceNumber: 0, //日記也沒有版本紀錄!
          version: [],  //要記得日記沒有版本紀錄!
          source: [],   //日記也沒有版本紀錄!
        },
        { id: '3', title: '神秘森林考察', type: 'document', 
          date: '2026.04.02 09:30', starred: true,
          content: '',
          versionNumber: 1, //紀錄版本數量，用來設定id，每新增一個就+1
          sourceNumber: 1, //紀錄資料來源數量，用來設定id，每新增一個就+1
          version: [
            {
              versionId: '1', versionTitle: '版本一', versionDate: '2026.04.01 08:52',
              versionContent: '',
            },
          ],
          source: [
            {
              sourceId: '1', sourceContent: '關於這份考察的參考網址...',
            },
          ],
        },
        { id: '4', title: '筆記：React Native', type: 'document', 
          date: '2026.04.01 14:05', starred: false,
          content: '',
          versionNumber: 0, //紀錄版本數量，用來設定id，每新增一個就+1
          sourceNumber: 0, //紀錄資料來源數量，用來設定id，每新增一個就+1
          version: [], //還沒有版本的話要寫成空陣列還是null?
          source: [],  //還沒有版本的話要寫成空陣列還是null?
        },
        { id: '5', title: '心情日記', type: 'diary', 
          date: '2026.03.28 22:55', starred: true,
          content: '',
          versionNumber: 0, //要記得日記沒有版本紀錄!
          sourceNumber: 0, //日記也沒有版本紀錄!
          version: [],
          source: [],
        },
      ],
      //新增檔案
      createFile: (type, title = '未命名文件') => {
        const newId = String(Date.now());
        const date = new Date();
        const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        // const newVersion = (type === 'diary' ? null : []);  //如果是日記就不需要版本和資料來源，是文件就給空陣列?
        const newFile = {
          id: newId,
          title,
          type,
          date: formattedDate,
          starred: false,
          content: '',
          versionNumber: 0,
          sourceNumber: 0,
          version: [],
          source: [],
        };
        set((state) => ({ data: [newFile, ...state.data] }));
        return newFile;
      },
      //更新檔案
      updateFile: (id, updates) => set((state) => ({
        data: state.data.map(item => item.id === id ? { ...item, ...updates } : item)
      })),
      //修改檔案名稱(好像可以寫在更新檔案裡
      // updateTitle: (id, newTitle) => set((state) => ({
      //   data: state.data.map(item => item.id === id ? { ...item, title: newTitle } : item)
      // })),
      //允許整個覆蓋data?(也許是更新用的?
      setData: (updater) => set((state) => ({ 
        data: typeof updater === 'function' ? updater(state.data) : updater 
      })),
      //刪除檔案
      deleteItem: (id) => set((state) => ({
        data: state.data.filter(item => item.id !== id)
      })),
      //星號文件功能
      toggleStar: (id) => set((state) => ({
        data: state.data.map(item => item.id === id ? { ...item, starred: !item.starred } : item)
      })),
      //手動儲存版本(按下儲存後會將整個內容存下來
      // saveVersion: (id, versionData) => set((state) => ({
      //   data: state.data.map(item => {
      //     if (item.id === id) {
      //       const versions = item.version || [];
      //       return { ...item, version: [versionData, ...versions] };
      //     }
      //     return item;
      //   })
      // })),
      // deleteVersion: (id, versionId) => set((state) => ({
      //   data: state.data.map(item => {
      //     if (item.id === id) {
      //        const versions = item.version || [];
      //        return { ...item, version: versions.filter(v => v.id !== versionId) };
      //     }
      //     return item;
      //   })
      // })),
      saveVersion: (id, versionTitle) => set((state) => ({
        data: state.data.map(item => {
          if (item.id === id) {

            const date = new Date();
            const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            
            const newVersionId = String(item.versionNumber + 1);

            const newVersion = {
              versionId: newVersionId,
              versionTitle, //之後不能改）
              versionDate: formattedDate,
              versionContent: item.content, //儲存當下內容
            };

            return {
              ...item,
              versionNumber: item.versionNumber + 1, //版本+1
              version: [newVersion, ...(item.version || [])],
            };
          }
          return item;
        })
      })),
      //還原版本
      restoreVersion: (fileId, versionId) => set((state) => ({
        data: state.data.map(item => {
          if (item.id === fileId) {
            const v = (item.version || []).find(v => v.versionId === versionId);
            if (!v) return item;

            return {
              ...item,
              content: v.versionContent
            };
          }
          return item;
        })
      })),
      //刪除版本
      deleteVersion: (id, versionId) => set((state) => ({
        data: state.data.map(item => {
          if (item.id === id) {
            return {
              ...item,
              version: (item.version || []).filter(v => v.versionId !== versionId)
            };
          }
          return item;
        })
      })),
      //新增資料來源
      addSource: (id) => set((state) => ({
        data: state.data.map(item => {
          if (item.id === id) {
            const newSourceId = String(item.sourceNumber + 1);
            const newSource = {
              sourceId: newSourceId,
              sourceContent: '',
            };

            return {
              ...item,
              sourceNumber: item.sourceNumber + 1,
              source: [newSource, ...(item.source || [])],
            };
          }
          return item;
        })
      })),
      //更新資料來源
      updateSource: (fileId, sourceId, content) => set((state) => ({
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
      })),
      //刪除資料來源
      deleteSource: (fileId, sourceId) => set((state) => ({
        data: state.data.map(item => {
          if (item.id === fileId) {
            return {
              ...item,
              source: (item.source || []).filter(s => s.sourceId !== sourceId)
            };
          }
          return item;
        })
      })),
    }
  )
);
