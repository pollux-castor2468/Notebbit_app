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
import { colors } from '../../../constants/token';
import { layoutStyles, textStyles } from '../../../styles';
import TopHeader from '../../../components/TopHeader';
import { useFileStore } from '../../../store/useFileStore';

export default function Home() {
  //使用全域變數儲存！
  const { data: historyData, createFile, updateFile } = useFileStore();
  //開啟手機檔案(目標是可以開啟world黨！)
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

        const newDoc = createFile('document', file.name.replace(/\.[^/.]+$/, ""));  //會出現選擇的文件名稱
        if (content) {
          updateFile(newDoc.id, { content });
        }

        router.push(`/(tabs)/(home)/document/${newDoc.id}`);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert('錯誤', '無法開啟文件');
    }
  };

  //最近開啟
  const recentHistory = historyData.slice(0, 3); // Show latest 5 -> 3
  //開啟新文件
  const handleCreateDocument = () => {
    const newFile = createFile('document', '未命名文件');
    router.push(`/(tabs)/(home)/document/${newFile.id}`);
  };
  //開啟新日記
  const handleCreateDiary = () => {
    const newFile = createFile('diary', '未命名日記');
    router.push(`/(tabs)/(home)/diary/${newFile.id}`);
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
                <Book size={24} color={colors.onPrimary} style={{marginLeft: 5,}} />
                <Text style={[textStyles.h3, { marginLeft: 5, color: colors.onPrimary }]}>建立日記</Text>
              </View>
            </Pressable>

            <Pressable  //開啟手機檔案
              style={[styles.smallCard, { backgroundColor: colors.surfaceVariant }]}
              onPress={handleOpenLocalFile}
            >
              <View style={layoutStyles.rowCenter}>
                <FolderOpen size={24} color={colors.text} style={{marginLeft: 5,}} />
                <Text style={[textStyles.h3, { marginLeft: 5 }]}>開啟文件</Text>
              </View>
            </Pressable>
          </View>
        </View>

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
              <Pressable
                key={item.id}
                style={styles.historyItem}
                onPress={() => {
                  if (item.type === 'diary') {
                    router.push(`/(tabs)/(home)/diary/${item.id}`);
                  } else {
                    router.push(`/(tabs)/(home)/document/${item.id}`);
                  }
                }}
              >
                {/* icon和背景顏色記得要切換 */}
                <View style={[styles.historyIconBox, 
                    {backgroundColor: item.type === 'diary' ? colors.secondary : colors.container,}]}>
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
  historySection: {
    backgroundColor: colors.recentSection,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 300,
    overflow: 'hidden',
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
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    // backgroundColor: 'transparent',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    // borderColor: colors.border,
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