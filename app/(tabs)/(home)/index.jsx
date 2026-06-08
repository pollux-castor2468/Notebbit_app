import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText,
  Book,
  FolderOpen,
  Clock,
} from 'lucide-react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import mammoth from 'mammoth/mammoth.browser.js';
import { toByteArray } from 'base64-js';
import { useStyles } from '../../../styles';
import TopHeader from '../../../components/TopHeader';
import { useFileStore } from '../../../store/useFileStore';
import { useFileActions } from '../../../hooks/useFileActions';
import { useTaskStore } from '../../../store/useTaskStore';
import FileItem from '../../../components/FileItem';
import { useFileActionModals, FileActionModals } from '../../../components/FileActionModals';

export default function Home() {
  const { layoutStyles, textStyles, colors } = useStyles();
  const styles = getStyles(colors);
  //使用全域變數儲存！
  const { data: historyData } = useFileStore();
  const { createFile, updateFile, toggleStar, deleteItem } = useFileActions();
  
  const { tasks } = useTaskStore();
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = Math.max(2, tasks.length);

  const { openPopover, closePopover, modalProps } = useFileActionModals();

  //開啟手機檔案(目標是可以開啟word檔！)
  const handleOpenLocalFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('Selected file:', file);

        let content = '';
        try {
          if (file.mimeType === 'text/plain' || file.name.endsWith('.txt')) {
            content = await FileSystem.readAsStringAsync(file.uri);
          } else if (
            file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.name.endsWith('.docx')
          ) {
            // Read as Base64
            const base64Data = await FileSystem.readAsStringAsync(file.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            // Convert to ArrayBuffer
            const uint8Array = toByteArray(base64Data);
            const arrayBuffer = uint8Array.buffer;

            // Use mammoth to convert to HTML
            const result = await mammoth.convertToHtml({ arrayBuffer });
            content = result.value; // The generated HTML
            if (result.messages.length > 0) {
              console.log('Mammoth messages:', result.messages);
            }
          } else {
            Alert.alert('提示', '目前僅支援 TXT 與 DOCX 檔案匯入，其他格式將以空白檔案開啟。');
          }
        } catch (e) {
          console.error('Error reading file:', e);
          Alert.alert('錯誤', '讀取檔案時發生錯誤，可能檔案格式不支援。');
        }

        const newDoc = createFile('document', file.name.replace(/\.[^/.]+$/, ""));  //會出現選擇的文件名稱
        if (!newDoc) {
          Alert.alert('錯誤', '請先登入以開啟文件');
          return;
        }
        if (content) {
          updateFile(newDoc.id, { content });
        }

        router.push(`/document/${newDoc.id}`);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert('錯誤', '無法開啟文件');
    }
  };

  //最近開啟
  const recentHistory = historyData.slice(0, 4); 
  //開啟新文件
  const handleCreateDocument = () => {
    const newFile = createFile('document', '未命名文件');
    if (!newFile) {
      Alert.alert('錯誤', '請先登入以建立文件');
      return;
    }
    router.push(`/document/${newFile.id}`);
  };
  //開啟新日記
  const handleCreateDiary = () => {
    const newFile = createFile('diary', '未命名日記');
    if (!newFile) {
      Alert.alert('錯誤', '請先登入以建立日記');
      return;
    }
    router.push(`/diary/${newFile.id}`);
  };

  return (
    <SafeAreaView style={layoutStyles.root}>
      <ScrollView contentContainerStyle={layoutStyles.scrollContent}>
        
        {/* Unified RWD Header */}
        <TopHeader />

        {/* Action Row */}
        <View style={styles.actionRow}>
          {/* Left large card */}
          <Pressable  //建立文件
            style={[styles.largeCard, { backgroundColor: colors.container }]}
            onPress={handleCreateDocument}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <FileText size={36} color={colors.text} />
              <Text style={[textStyles.h3, { marginTop: 16 }]}>建立文件</Text>
            </View>
          </Pressable>

          {/* Right column */}
          <View style={styles.rightColumn}>
            <Pressable  //建立日記
              style={[styles.smallCard, { backgroundColor: colors.secondary, marginBottom: 16 }]}
              onPress={handleCreateDiary}
            >
              <View style={layoutStyles.rowCenter}>
                <Book size={24} color={colors.onPrimary} style={{marginLeft: 15,}} />
                <Text style={[textStyles.h3, { marginLeft: 10, color: colors.onPrimary }]}>建立日記</Text>
              </View>
            </Pressable>

            <Pressable  //開啟手機檔案
              style={[styles.smallCard, { backgroundColor: colors.surfaceVariant }]}
              onPress={handleOpenLocalFile}
            >
              <View style={layoutStyles.rowCenter}>
                <FolderOpen size={24} color={colors.text} style={{marginLeft: 15,}} />
                <Text style={[textStyles.h3, { marginLeft: 10 }]}>開啟文件</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Today's Tasks Banner */}
        <Pressable 
          style={styles.taskBanner}
          onPress={() => router.push('/task')}
        >
          <View style={styles.taskBannerContent}>
            <Image 
              source={require('../../../assets/img/task_rabbit.png')} 
              style={styles.taskBannerImg} 
              resizeMode="contain" 
            />
            <View style={styles.taskBannerTextContainer}>
              <Text style={[textStyles.h3, { marginBottom: 8 }]}>今日任務</Text>
              <Text style={textStyles.h3}>{completedCount}/{totalCount}</Text>
            </View>
          </View>
        </Pressable>

        {/* History Area */}
        <View style={styles.historySection}>
          {/* 最近開啟頭 */}
          <View style={[layoutStyles.rowCenter, styles.historyHeader]}>
            <Clock size={20} color={colors.text} />
            <Text style={[textStyles.h3, { marginLeft: 8 }]}>最近開啟</Text>
          </View>
          <Image source={require('../../../assets/img/8.png')} style={styles.rabbit} resizeMode="contain" />
          {/* 最近開啟區 */}
          <View style={styles.historyBody}>
            {recentHistory.map(item => (
              <FileItem key={item.id} item={item} onOpenPopover={openPopover} />
            ))}
          </View>
        </View>
      </ScrollView>

      <FileActionModals {...modalProps} />
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    height: 165,
    marginBottom: 24,
    // marginTop: 0,
  },
  largeCard: {
    flex: 0.8,
    borderRadius: 20, //大的一律20，小的10
    marginRight: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rightColumn: {
    flex: 1.2,
    justifyContent: 'space-between',
  },
  smallCard: {
    height: 75,
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskBanner: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  taskBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 80,
  },
  taskBannerImg: {
    width: 130,
    height: 110,
    // marginRight: 40,
    position: 'absolute',
    top: -15,
    left: 50,
  },
  taskBannerTextContainer: {
    flexDirection: 'row',
    width: 110,
    justifyContent: 'space-around',
    // alignItems: 'center',
    // justifyContent: 'center',
    position: 'relative',
    left: 40,
    top: 5,
  },
  historySection: {
    backgroundColor: colors.recentSection,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 400,
    // maxHeight: 400,
    overflow: 'hidden',
    // overflow: 'scroll',
    // position: 'relative',
  },
  historyHeader: {
    backgroundColor: colors.recentHeader,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyBody: {
    padding: 16,
    // maxHeight: 100,
    // overflow: 'scroll',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    // backgroundColor: 'transparent',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    // backgroundColor: colors.container,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rabbit: {
    position: 'absolute',
    height: 70,
    top: 5,
    right: -85,
  }
});