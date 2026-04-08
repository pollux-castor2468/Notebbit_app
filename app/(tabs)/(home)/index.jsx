import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Search,
  FileText,
  Book,
  FolderOpen,
  Clock,
  Rabbit,
  FileDown
} from 'lucide-react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '../../../constants/token';
import { layoutStyles, textStyles, cardStyles } from '../../../styles';

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
        
        {/* Header */}
        <View style={layoutStyles.header}>
          <View style={[layoutStyles.rowCenter, { flex: 1 }]}>
            <View style={styles.brandBox}>
              <Rabbit size={28} color={colors.text} />
            </View>
            <Text style={[textStyles.h3, { marginLeft: 12 }]}>MyWorkspace</Text>
          </View>
          <Pressable style={layoutStyles.iconButtonBg}>
            <Search size={24} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.spacer} />

        {/* Primary Actions Row 1 */}
        <Pressable style={styles.primaryActionCard} onPress={handleOpenLocalFile}>
          <FileDown size={32} color={colors.onPrimary} />
          <View style={styles.actionTextContainer}>
            <Text style={[textStyles.h2, { marginTop: 16 }]}>開啟手機文件</Text>
            <Text style={[textStyles.subtitle, { marginTop: 4 }]}>匯入 TXT 或 Word 檔案</Text>
          </View>
        </Pressable>

        {/* Action Row 2 */}
        <View style={styles.twoColumnRow}>
          <Pressable 
            style={[styles.secondaryCard, { backgroundColor: colors.tertiary, marginRight: 12 }]} 
            onPress={() => router.push('/document-editor')}
          >
            <FileText size={28} color={colors.onPrimary} />
            <Text style={[textStyles.h3, { color: colors.onPrimary }]}>建立新文件</Text>
          </Pressable>

          <Pressable 
            style={[styles.secondaryCard, { backgroundColor: colors.secondary }]} 
            onPress={() => router.push('/diary-editor')}
          >
            <Book size={28} color={colors.onPrimary} />
            <Text style={[textStyles.h3, { color: colors.onPrimary }]}>建立新日記</Text>
          </Pressable>
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
                  if(item.type === 'diary') {
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
  brandBox: {
    width: 52,
    height: 52,
    borderRadius: 24,
    backgroundColor: colors.container,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.text,
  },
  spacer: {
    height: 24,
  },
  primaryActionCard: {
    borderRadius: 28,
    backgroundColor: colors.container, 
    borderWidth: 1,
    borderColor: 'rgba(101, 68, 69, 0.2)',
    padding: 24,
    justifyContent: 'space-between',
    minHeight: 140,
    marginBottom: 20,
  },
  twoColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  secondaryCard: {
    flex: 1,
    minHeight: 130,
    borderRadius: 28,
    padding: 20,
    justifyContent: 'space-between',
  },
  historySection: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
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