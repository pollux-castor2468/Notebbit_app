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
import { colors } from '../../../constants/token';
import { layoutStyles, textStyles } from '../../../styles';
import TopHeader from '../../../components/TopHeader';

export default function Home() {

  const handleOpenLocalFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('Selected file:', file);
        // Navigate to document editor passing the file uri and name
        router.push({
          pathname: '/document-editor',
          params: { fileUri: file.uri, fileName: file.name, isLocal: 'true' }
        });
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert('錯誤', '無法開啟文件');
    }
  };

  const mockHistoryData = [
    { id: 1, title: '生態研究報告草稿', type: 'document', time: '今天 10:23' },
    { id: 2, title: '觀察日記：林間活動', type: 'diary', time: '昨天 15:40' },
    { id: 3, title: '未命名文件 1', type: 'document', time: '前天 09:15' },
  ];

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
            onPress={() => router.push('/document-editor')}
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
              onPress={() => router.push('/diary-editor')}
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
          <View style={layoutStyles.rowCenter}>
            <Clock size={16} color={colors.text} />
            <Text style={[textStyles.h3, { marginLeft: 8 }]}>歷史紀錄瀏覽</Text>
          </View>

          <View style={{ marginTop: 16 }}>
            {mockHistoryData.map(item => (
              <Pressable
                key={item.id}
                style={styles.historyItem}
                onPress={() => {
                  if (item.type === 'diary') {
                    router.push({ pathname: '/diary-editor', params: { title: item.title } });
                  } else {
                    router.push({ pathname: '/document-editor', params: { title: item.title } });
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
                  <Text style={[textStyles.subtitle, { fontSize: 12 }]}>{item.time} 編輯</Text>
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
    flex: 1,
    borderRadius: 28,
    marginRight: 16,
    padding: 24,
  },
  rightColumn: {
    flex: 0.8,
    justifyContent: 'space-between',
  },
  smallCard: {
    height: 86,
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  historySection: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    minHeight: 400,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
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