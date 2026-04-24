import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, X, FileText, Book } from 'lucide-react-native';
import { useStyles } from '../styles';
import { useFileStore } from '../store/useFileStore';

export default function SearchScreen() {
  const { colors, layoutStyles, textStyles } = useStyles();
  const styles = getStyles(colors);
  const [searchText, setSearchText] = useState('');
  const { data } = useFileStore();

  const searchResults = searchText.trim() === ''
    ? []
    : data.filter(item => 
        item.title && item.title.toLowerCase().includes(searchText.trim().toLowerCase())
      );

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.listItem}
      onPress={() => {
        if (item.type === 'diary') {
          router.push(`/diary/${item.id}`);
        } else {
          router.push(`/document/${item.id}`);
        }
      }}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.type === 'diary' ? colors.secondary : colors.container }]}> 
        {item.type === 'diary' ? <Book size={20} color="#fff" /> : <FileText size={20} color="#fff" />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[textStyles.body, { fontWeight: '700', marginBottom: 4 }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[textStyles.subtitle, { fontSize: 12 }]}>{item.date || '建立於 ' + item.id}</Text>
      </View>
    </Pressable>
  );

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      {/* 點鍵盤外面可收回 */}
      <SafeAreaView style={layoutStyles.root}>
        <View style={styles.header}>
          <View style={styles.searchBar}>
            <Search size={22} color={colors.inactiveText} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={colors.inactiveText}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText('')} style={{ padding: 4 }}>
                <X size={20} color={colors.text} />
              </Pressable>
            )}
          </View>
          <Pressable onPress={() => router.back()} style={{ marginLeft: 16 }}>
            <Text style={[textStyles.body, { color: colors.container, fontWeight: '600' }]}>取消</Text>
          </Pressable>
        </View>

        <View style={[styles.content, searchResults.length > 0 && { justifyContent: 'flex-start', paddingTop: 16 }]}>
          {searchText.trim() === '' ? (
            <Text style={styles.emptyText}>請輸入關鍵字...</Text>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={item => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              style={{ width: '100%' }}
            />
          ) : (
            <Text style={styles.emptyText}>找不到結果</Text>
          )}
        </View>
      </SafeAreaView>
    </Pressable>
  );
}

const getStyles = (colors) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 62,
    borderBottomWidth: 0,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.recentSection,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 18,
    color: colors.inactiveText,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  }
});
