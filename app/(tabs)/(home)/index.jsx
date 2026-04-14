import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
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
import { colors } from '../../../constants/token';
import { layoutStyles, textStyles } from '../../../styles';
import TopHeader from '../../../components/TopHeader';
import { useFileStore } from '../../../store/useFileStore';

export default function Home() {

  const { data: historyData, createFile, updateFile } = useFileStore();

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
        if (file.mimeType === 'text/plain' || file.name.endsWith('.txt')) {
          try {
            content = await FileSystem.readAsStringAsync(file.uri);
          } catch (e) {
            console.error('Error reading txt file:', e);
            Alert.alert('提示', '目前僅支援純文字檔 (TXT) 內容匯入，其他格式將以空白檔案開啟。');
          }
        } else {
          Alert.alert('提示', '目前僅支援純文字檔 (TXT) 內容匯入，其他格式將以空白檔案開啟。');
        }

        const newDoc = createFile('document', file.name.replace(/\.[^/.]+$/, ""));
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

  const recentHistory = historyData.slice(0, 5); // Show latest 5

  const handleCreateDocument = () => {
    const newFile = createFile('document', '未命名文件');
    router.push(`/document/${newFile.id}`);
  };

  const handleCreateDiary = () => {
    const newFile = createFile('diary', '未命名日記');
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
          <Pressable
            style={[styles.largeCard, { backgroundColor: colors.container }]}
            onPress={handleCreateDocument}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <FileText size={48} color={colors.text} />
              <Text style={[textStyles.h2, { marginTop: 16 }]}>建立文件</Text>
            </View>
          </Pressable>

          {/* Right column */}
          <View style={styles.rightColumn}>
            <Pressable
              style={[styles.smallCard, { backgroundColor: colors.secondary, marginBottom: 16 }]}
              onPress={handleCreateDiary}
            >
              <View style={layoutStyles.rowCenter}>
                <Book size={24} color={colors.onPrimary} />
                <Text style={[textStyles.h3, { marginLeft: 12, color: colors.onPrimary }]}>建立日記</Text>
              </View>
            </Pressable>

            <Pressable
              style={[styles.smallCard, { backgroundColor: colors.surfaceVariant }]}
              onPress={handleOpenLocalFile}
            >
              <View style={layoutStyles.rowCenter}>
                <FolderOpen size={24} color={colors.text} />
                <Text style={[textStyles.h3, { marginLeft: 12 }]}>開啟文件</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* History Area */}
        <View style={styles.historySection}>
          <View style={[layoutStyles.rowCenter, styles.historyHeader]}>
            <Clock size={16} color={colors.text} />
            <Text style={[textStyles.h3, { marginLeft: 8 }]}>最近開啟</Text>
          </View>

          <View style={styles.historyBody}>
            {recentHistory.map(item => (
              <Pressable
                key={item.id}
                style={styles.historyItem}
                onPress={() => {
                  if (item.type === 'diary') {
                    router.push(`/diary/${item.id}`);
                  } else {
                    router.push(`/document/${item.id}`);
                  }
                }}
              >
                <View style={styles.historyIconBox}>
                  {item.type === 'diary' ? (
                    <Book size={20} color={colors.text} />
                  ) : (
                    <FileText size={20} color={colors.text} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[textStyles.body, { fontWeight: '700', marginBottom: 4 }]}>{item.title}</Text>
                  <Text style={[textStyles.subtitle, { fontSize: 12 }]}>{item.date || item.time} 編輯</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    height: 190,
    marginBottom: 24,
  },
  largeCard: {
    flex: 0.9,
    borderRadius: 28,
    marginRight: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rightColumn: {
    flex: 1.1,
    justifyContent: 'space-between',
  },
  smallCard: {
    height: 86,
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  historySection: {
    backgroundColor: colors.recentSection,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 400,
    overflow: 'hidden',
  },
  historyHeader: {
    backgroundColor: colors.recentHeader,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyBody: {
    padding: 24,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 20,
  },
  historyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});