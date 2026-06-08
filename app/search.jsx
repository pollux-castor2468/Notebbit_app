import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList, Keyboard, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, X, XCircle, ChevronDown, Check, Star, Pencil, FileText, Book } from 'lucide-react-native';
import { useStyles } from '../styles';
import { useFileStore } from '../store/useFileStore';

export default function SearchScreen() {
  const { colors, layoutStyles, textStyles } = useStyles();
  const styles = getStyles(colors);

  const [searchText, setSearchText] = useState('');
  const { data, globalTags } = useFileStore();
  const allTags = (globalTags || []).map(t => t.name);

  // Filter States
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedType, setAppliedType] = useState(null); // 'document', 'diary', null
  const [tempType, setTempType] = useState(null);

  const [appliedStarStatus, setAppliedStarStatus] = useState(null); // 'starred', 'unstarred', null
  const [tempStarStatus, setTempStarStatus] = useState(null);

  const [appliedSelectedTags, setAppliedSelectedTags] = useState([]);
  const [tempSelectedTags, setTempSelectedTags] = useState([]);

  // Multi-Filter Search Logic (AND matching for tags)
  const searchResults = data.filter(item => {
    // 1. Text Search Filter (Title or Content)
    if (searchText.trim() !== '') {
      const matchTitle = item.title && item.title.toLowerCase().includes(searchText.trim().toLowerCase());
      const matchContent = item.content && item.content.toLowerCase().includes(searchText.trim().toLowerCase());
      if (!matchTitle && !matchContent) return false;
    } else {
      // If search text is empty, show nothing unless some filter is active
      const hasAppliedFilters = appliedType || appliedStarStatus || appliedSelectedTags.length > 0;
      if (!hasAppliedFilters) return false;
    }

    // 2. Type Filter (文件/日記)
    if (appliedType && item.type !== appliedType) return false;

    // 3. Star Filter (星號)
    if (appliedType === 'document' || !appliedType) {
      if (appliedStarStatus === 'starred' && !item.starred) return false;
      if (appliedStarStatus === 'unstarred' && item.starred) return false;
    }

    // 4. Tag Filter (標籤 - AND logic)
    if (appliedSelectedTags.length > 0) {
      if (item.type !== 'document') return false; // Tags only apply to documents
      const hasAllTags = appliedSelectedTags.every(tag => (item.tags || []).includes(tag));
      if (!hasAllTags) return false;
    }

    return true;
  });

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
        <Text style={[textStyles.subtitle, { fontSize: 12 }]}>{item.date}</Text>
      </View>
    </Pressable>
  );

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <SafeAreaView style={layoutStyles.root}>
        {/* Search Header */}
        <View style={styles.header}>
          <View style={styles.searchBar}>
            <Search size={20} color={colors.inactiveText} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={colors.inactiveText}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
            
            {/* Tag Button / Down Chevron for filtering */}
            <Pressable onPress={() => {
              setTempType(appliedType);
              setTempStarStatus(appliedStarStatus);
              setTempSelectedTags([...appliedSelectedTags]);
              setFilterModalVisible(true);
            }} style={{ padding: 4, marginRight: 4 }}>
              <ChevronDown size={22} color={colors.text} />
            </Pressable>

            {/* Clear Button (Always rendered, dimmed/disabled when text is empty) */}
            <Pressable 
              onPress={() => setSearchText('')} 
              style={{ padding: 4, opacity: searchText.length > 0 ? 1 : 0.2 }}
              disabled={searchText.length === 0}
            >
              <XCircle size={20} color={colors.text} />
            </Pressable>
          </View>
          
          <Pressable onPress={() => router.back()} style={{ marginLeft: 16 }}>
            <Text style={[textStyles.body, { color: colors.errow, fontWeight: '600' }]}>取消</Text>
          </Pressable>
        </View>

        {/* Search Results Area */}
        <View style={[styles.content, searchResults.length > 0 && { justifyContent: 'flex-start', paddingTop: 16 }]}>
          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={item => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              style={{ width: '100%' }}
            />
          ) : (
            <Text style={styles.emptyText}>
              {searchText.trim() === '' && !(appliedType || appliedStarStatus || appliedSelectedTags.length > 0)
                ? '請輸入關鍵字或篩選標籤...'
                : '找不到符合的結果'}
            </Text>
          )}
        </View>

        {/* Advanced Filter Modal */}
        <Modal transparent visible={filterModalVisible} animationType="fade" onRequestClose={() => setFilterModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalContentInner}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Pressable onPress={() => setFilterModalVisible(false)} style={{ padding: 4 }}>
                    <X size={28} color={colors.text} />
                  </Pressable>
                  <Text style={[textStyles.h3, { flex: 1, textAlign: 'center' }]}>進階篩選</Text>
                  <Pressable onPress={() => {
                    setAppliedType(tempType);
                    setAppliedStarStatus(tempStarStatus);
                    setAppliedSelectedTags(tempSelectedTags);
                    setFilterModalVisible(false);
                  }} style={{ padding: 4 }}>
                    <Check size={28} color={colors.text} />
                  </Pressable>
                </View>
                
                {/* Type Section (文件/日記) */}
                <View style={styles.filterSection}>
                  <View style={styles.filterSectionHeader}>
                    <Text style={styles.filterSectionTitle}>文件/日記</Text>
                  </View>
                  <View style={styles.filterSectionBodyRow}>
                    <Pressable 
                      style={[styles.filterPill, tempType === 'document' && styles.filterPillActive]}
                      onPress={() => setTempType(t => t === 'document' ? null : 'document')}
                    >
                      <Text style={[styles.filterPillText, tempType === 'document' && styles.filterPillTextActive]}>文件</Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.filterPill, tempType === 'diary' && styles.filterPillActive]}
                      onPress={() => setTempType(t => t === 'diary' ? null : 'diary')}
                    >
                      <Text style={[styles.filterPillText, tempType === 'diary' && styles.filterPillTextActive]}>日記</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Star Status Section */}
                <View style={styles.filterSection}>
                  <View style={styles.filterSectionHeader}>
                    <Text style={styles.filterSectionTitle}>星號</Text>
                  </View>
                  <View style={styles.filterSectionBodyRow}>
                    <Pressable 
                      style={[styles.filterPill, tempStarStatus === 'unstarred' && styles.filterPillActive]}
                      onPress={() => setTempStarStatus(s => s === 'unstarred' ? null : 'unstarred')}
                    >
                      <Star size={24} color={colors.text} />
                    </Pressable>
                    <Pressable 
                      style={[styles.filterPill, tempStarStatus === 'starred' && styles.filterPillActive]}
                      onPress={() => setTempStarStatus(s => s === 'starred' ? null : 'starred')}
                    >
                      <Star size={24} color={colors.text} fill={colors.text} />
                    </Pressable>
                  </View>
                </View>

                {/* Tags Grid Section */}
                <View style={styles.filterSection}>
                  <View style={styles.filterSectionHeader}>
                    <Text style={styles.filterSectionTitle}>標籤</Text>
                    <Pressable onPress={() => {
                      setFilterModalVisible(false);
                      router.push('/tags-edit');
                    }}>
                      <Pencil size={24} color={colors.text} />
                    </Pressable>
                  </View>
                  {allTags.length > 0 ? (
                    <View style={styles.tagsGrid}>
                      {allTags.map(tag => (
                        <Pressable
                          key={tag}
                          style={[styles.filterPill, tempSelectedTags.includes(tag) && styles.filterPillActive]}
                          onPress={() => {
                            if (tempSelectedTags.includes(tag)) setTempSelectedTags(tempSelectedTags.filter(t => t !== tag));
                            else setTempSelectedTags([...tempSelectedTags, tag]);
                          }}
                        >
                          <Text style={[styles.filterPillText, tempSelectedTags.includes(tag) && styles.filterPillTextActive]}>{tag}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <Text style={{color: colors.inactiveText, fontSize: 14, marginTop: 8}}>尚無標籤，請點擊右上方圖示新增標籤。</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </Modal>
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
    fontSize: 16,
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
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: colors.surfaceVariant, 
    borderRadius: 20, 
    width: '85%', 
    padding: 5, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  modalContentInner: {
    backgroundColor: colors.surface,
    // width: '90%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  modalHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  filterSection: { 
    marginBottom: 10,
  },
  filterSectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border, 
    paddingBottom: 8, 
    marginBottom: 16 
  },
  filterSectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: colors.text 
  },
  filterSectionBodyRow: { 
    flexDirection: 'row' 
  },
  filterPill: { 
    minWidth: 70, 
    minHeightheight: 48, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 10, 
    borderWidth: 1,
    borderColor: colors.border, 
    backgroundColor: colors.surface, 
    marginRight: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 12,
    marginBottom: 12,
  },
  filterPillActive: { 
    backgroundColor: colors.recentHeader, 
    // borderColor: '#E8A317' 
  },
  filterPillText: { 
    fontSize: 16, 
    color: colors.text 
  },
  filterPillTextActive: { 
    fontWeight: 'bold' 
  },
  // filterIconBtn: { 
  //   width: 72, 
  //   height: 48, 
  //   borderRadius: 12, 
  //   borderWidth: 1, 
  //   borderColor: colors.border, 
  //   alignItems: 'center', 
  //   justifyContent: 'center', 
  //   backgroundColor: colors.surface, 
  //   marginRight: 16 
  // },
  // filterIconBtnActive: { 
  //   backgroundColor: '#FFF4E0', 
  //   borderColor: '#E8A317' 
  // },
  tagsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap' 
  },
  // tagFilterBtn: { 
  //   paddingHorizontal: 16, 
  //   paddingVertical: 10, 
  //   borderRadius: 12, 
  //   borderWidth: 1, 
  //   borderColor: colors.border, 
  //   backgroundColor: colors.surface, 
  //   marginRight: 12, 
  //   marginBottom: 12 
  // },
  // tagFilterBtnActive: { 
  //   backgroundColor: '#FFF4E0', 
  //   borderColor: '#E8A317' 
  // },
  // tagFilterText: { 
  //   fontSize: 16, 
  //   color: colors.text 
  // },
  // tagFilterTextActive: { 
  //   fontWeight: 'bold' 
  // },
});
