import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, FileText, Book, Star } from 'lucide-react-native';
import { colors } from '../constants/token';
import { layoutStyles, textStyles } from '../styles';

export default function FileBrowser() {
  const params = useLocalSearchParams();
  const { type } = params; // 'document', 'diary', 'starred'

  let pageTitle = '所有文件';
  let emptyMessage = '目前沒有任何文件。';

  if (type === 'diary') {
    pageTitle = '所有日記';
    emptyMessage = '目前沒有任何日記。';
  } else if (type === 'starred') {
    pageTitle = '標記星號文件';
    emptyMessage = '目前沒有任何標記星號的檔案。';
  }

  // Placeholder static data
  const data = [
    { id: '1', title: '生態觀察報告.txt', type: 'document', date: '2026-04-01' },
    { id: '2', title: '森林散步筆記', type: 'diary', date: '2026-04-05' },
    { id: '3', title: '重要會議紀錄', type: 'document', date: '2026-04-06' },
    { id: '4', title: '旅行計畫清單', type: 'diary', date: '2026-04-08' },
  ].filter(item => {
    if (type === 'starred') return item.id === '3';
    return type === 'diary' ? item.type === 'diary' : item.type === 'document';
  });

  const getIcon = (itemType) => {
     if (type === 'starred') return <Star size={24} color={colors.canva} />;
     if (itemType === 'diary') return <Book size={24} color={colors.secondary} />;
     return <FileText size={24} color={colors.text} />;
  }

  return (
    <SafeAreaView style={layoutStyles.root}>
      <View style={[layoutStyles.rowBetween, styles.header]}>
        <Pressable onPress={() => router.back()} style={layoutStyles.iconButtonBg}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={textStyles.h3}>{pageTitle}</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList 
        data={data}
        contentContainerStyle={styles.listContent}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>{emptyMessage}</Text>}
        renderItem={({ item }) => (
          <Pressable 
            style={styles.listItem}
            onPress={() => {
              if (item.type === 'diary') {
                 router.push({ pathname: '/diary-editor', params: { title: item.title } });
              } else {
                 router.push({ pathname: '/document-editor', params: { title: item.title } });
              }
            }}
          >
            <View style={styles.iconBox}>
              {getIcon(item.type)}
            </View>
            <View style={styles.itemTextContainer}>
              <Text style={[textStyles.body, { fontWeight: '700' }]}>{item.title}</Text>
              <Text style={[textStyles.subtitle, { marginTop: 4 }]}>{item.date}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listContent: {
    padding: 24,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.inactiveText,
    fontSize: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemTextContainer: {
    flex: 1,
  },
});
