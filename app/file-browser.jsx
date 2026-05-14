import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, FileText, Search, MoreVertical, Star, Edit, Tag, Filter } from 'lucide-react-native';
import { useStyles } from '../styles';
import { useFileStore } from '../store/useFileStore';

export default function FileBrowser() {
  const { layoutStyles, textStyles, colors } = useStyles();
  const styles = getStyles(colors);
  
  const params = useLocalSearchParams();
  const initialType = params.type || 'document';
  
  const [activeTab, setActiveTab] = useState(
    initialType === 'diary' ? 'diary' : 'document'
  );

  const [selectedItem, setSelectedItem] = useState(null);
  const [popoverPos, setPopoverPos] = useState(0);

  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  const { data, updateFile, deleteItem } = useFileStore();

  const filteredData = data.filter(item => {
    if (item.is_deleted) return false;
    if (item.type !== activeTab) return false;
    if (activeTab === 'document' && showStarredOnly && !item.starred) return false;
    return true;
  });

  const handleDelete = () => {
    if (selectedItem) {
      deleteItem(selectedItem.id);
      setSelectedItem(null);
    }
  };

  const handleRenameClick = () => {
    setItemToRename(selectedItem);
    setNewTitle(selectedItem.title);
    setRenameModalVisible(true);
    setSelectedItem(null);
  };

  const submitRename = () => {
    if (newTitle.trim() && itemToRename) {
      updateFile(itemToRename.id, { title: newTitle.trim() });
    }
    setRenameModalVisible(false);
    setItemToRename(null);
  };

  // Group Diaries for Timeline
  const groupDiaries = () => {
    const groups = {};
    filteredData.forEach(item => {
      const d = new Date(item.date.replace(/\./g, '/')); // Simple parse
      const key = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.keys(groups).map(key => ({ title: key, data: groups[key] }));
  };

  const renderTimelineItem = (item, isLast) => (
    <View style={styles.timelineItemContainer} key={item.id}>
      <View style={styles.timelineLineContainer}>
        <View style={styles.timelineDot} />
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      <Pressable 
        style={[styles.listItem, { flex: 1, marginBottom: 16 }]}
        onPress={() => router.push(`/diary/${item.id}`)}
      >
        <View style={[styles.iconBox, {backgroundColor: colors.secondary}]}>
            <Edit size={24} color={colors.text} />
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={[textStyles.body, { fontWeight: '700' }]}>{item.title}</Text>
          <Text style={[textStyles.subtitle, { marginTop: 4, fontSize: 12 }]}>{item.date}</Text>
        </View>
        <Pressable 
          style={styles.dotsBtn}
          onPress={(e) => {
            setPopoverPos(e.nativeEvent.pageY);
            setSelectedItem(item);
          }}
        >
          <MoreVertical size={20} color={colors.text} opacity={0.5} />
        </Pressable>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ChevronLeft size={28} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => router.push('/search')} style={{ padding: 4 }}>
          <Search size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.allFileSection}>
        <View style={styles.segmentedControl}>
          {['document', 'diary'].map((tab) => (
            <Pressable 
              key={tab} 
              style={[styles.segmentItem, activeTab === tab && styles.segmentActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.segmentText, activeTab === tab && styles.segmentTextActive]}>
                {tab === 'document' ? '所有文件' : '所有日記'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.filterHeader}>
          <Text style={styles.totalText}>共 {filteredData.length} 篇</Text>
          {activeTab === 'document' ? (
            <Pressable style={styles.filterBtn} onPress={() => setFilterModalVisible(true)}>
              <Filter size={16} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={styles.filterBtnText}>進階篩選</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.filterBtn}>
              <Text style={styles.filterBtnText}>日期篩選</Text>
            </Pressable>
          )}
        </View>

        {activeTab === 'diary' ? (
          <FlatList
            data={groupDiaries()}
            keyExtractor={item => item.title}
            contentContainerStyle={styles.listContent}
            renderItem={({ item: group }) => (
              <View style={styles.timelineGroup}>
                <Text style={styles.timelineTitle}>{group.title}</Text>
                {group.data.map((item, index) => renderTimelineItem(item, index === group.data.length - 1))}
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>目前沒有任何資料。</Text>}
          />
        ) : (
          <FlatList 
            data={filteredData}
            contentContainerStyle={styles.listContent}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={styles.emptyText}>目前沒有任何資料。</Text>}
            renderItem={({ item }) => {
              const isMenuOpen = selectedItem?.id === item.id;
              return (
                <Pressable 
                  style={[styles.listItem, isMenuOpen && { borderColor: 'rgba(0,0,0,0.1)' }]}
                  onPress={() => router.push(`/document/${item.id}`)}
                >
                  <View style={[styles.iconBox, {backgroundColor: colors.container}]}>
                      <FileText size={24} color={colors.text} />
                  </View>
                  <View style={styles.itemTextContainer}>
                    <Text style={[textStyles.body, { fontWeight: '700' }]}>{item.title}</Text>
                    <Text style={[textStyles.subtitle, { marginTop: 4, fontSize: 12 }]}>{item.date}</Text>
                  </View>
                  <Pressable 
                    style={{ padding: 4, marginRight: 8 }}
                    onPress={() => updateFile(item.id, { starred: !item.starred })}
                  >
                    <Star size={20} color={colors.text} fill={item.starred ? colors.text : "transparent"} opacity={item.starred ? 1 : 0.3} />
                  </Pressable>
                  <Pressable 
                    style={[styles.dotsBtn, isMenuOpen && styles.dotsBtnActive]}
                    onPress={(e) => {
                      setPopoverPos(e.nativeEvent.pageY);
                      setSelectedItem(item);
                    }}
                  >
                    <MoreVertical size={20} color={colors.text} opacity={isMenuOpen ? 1 : 0.5} />
                  </Pressable>
                </Pressable>
              );
            }}
          />
        )}
      </View>

      {/* Advanced Filter Modal */}
      <Modal transparent visible={filterModalVisible} animationType="fade" onRequestClose={() => setFilterModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
          <Pressable style={styles.filterModalContent} onPress={e => e.stopPropagation()}>
            <Text style={[textStyles.h3, { marginBottom: 16 }]}>進階篩選</Text>
            
            <Pressable 
              style={styles.filterRow}
              onPress={() => setShowStarredOnly(!showStarredOnly)}
            >
              <Text style={styles.filterRowText}>星號文件</Text>
              <View style={[styles.checkbox, showStarredOnly && styles.checkboxActive]} />
            </Pressable>

            <View style={styles.filterDivider} />
            
            <View style={styles.filterRow}>
              <Text style={styles.filterRowText}>標籤</Text>
              <Pressable style={styles.tagEditBtn} onPress={() => {
                setFilterModalVisible(false);
                router.push('/tags-edit');
              }}>
                <Tag size={16} color={colors.inactiveText} />
                <Text style={styles.tagEditBtnText}>標籤編輯</Text>
              </Pressable>
            </View>
            <Text style={{color: colors.inactiveText, fontSize: 12, marginTop: 8}}>尚無標籤，請先新增標籤。</Text>
            
          </Pressable>
        </Pressable>
      </Modal>

      {/* Popover and Rename Modals are same as before */}
      <Modal transparent visible={!!selectedItem} animationType="fade" onRequestClose={() => setSelectedItem(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedItem(null)}>
          <Pressable 
            style={[styles.modalInnerContainer, { top: popoverPos > 0 ? popoverPos + 10 : '50%' }]} 
            onPress={e => e.stopPropagation()}
          >
            <Pressable style={styles.modalBtn} onPress={handleRenameClick}>
              <Text style={styles.modalBtnText}>重新命名</Text>
            </Pressable>
            
            <Pressable style={[styles.modalBtn, { marginBottom: 0 }]} onPress={handleDelete}>
              <Text style={[styles.modalBtnText, { color: colors.errow }]}>移至暫存</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Rename Dialog Modal */}
      <Modal animationType="fade" transparent={true} visible={renameModalVisible} onRequestClose={() => setRenameModalVisible(false)}>
        <View style={styles.renameOverlay}>
          <View style={styles.modalBigContent}>
            <View style={styles.renameContent}>
              <Text style={textStyles.h3}>重新命名</Text>
              <TextInput style={styles.renameInput} value={newTitle} onChangeText={setNewTitle} autoFocus />
              <View style={styles.renameActions}>
                <Pressable style={styles.renameBtnCancel} onPress={() => setRenameModalVisible(false)}>
                  <Text style={styles.modalBtnTextC}>取消</Text>
                </Pressable>
                <Pressable style={styles.renameBtnSubmit} onPress={submitRename}>
                  <Text style={styles.modalBtnTextS}>確認</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, height: 62 },
  allFileSection: { flex: 1, margin: 16, marginTop: 0, marginBottom: 90, borderWidth: 1, borderColor: colors.border, borderRadius: 20 },
  segmentedControl: { flexDirection: 'row', backgroundColor: colors.recentHeader, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 6, marginBottom: 0 },
  segmentItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  segmentActive: { backgroundColor: colors.secondary },
  segmentText: { fontSize: 16, color: colors.inactiveText },
  segmentTextActive: { color: colors.text, fontWeight: '700' },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 12 },
  totalText: { fontSize: 14, color: colors.inactiveText, fontWeight: 'bold' },
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  filterBtnText: { fontSize: 14, color: colors.text, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  emptyText: { textAlign: 'center', marginTop: 40, color: colors.inactiveText, fontSize: 16 },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  iconBox: { width: 48, height: 52, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  itemTextContainer: { flex: 1 },
  dotsBtn: { padding: 8, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  dotsBtnActive: { backgroundColor: colors.recentSection },
  timelineGroup: { marginBottom: 24 },
  timelineTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16, marginLeft: 16 },
  timelineItemContainer: { flexDirection: 'row' },
  timelineLineContainer: { width: 30, alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.secondary, borderWidth: 2, borderColor: colors.text, zIndex: 2 },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: -6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  filterModalContent: { position: 'absolute', top: 160, right: 30, width: 220, backgroundColor: colors.surfaceVariant, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterRowText: { fontSize: 16, color: colors.text, fontWeight: 'bold' },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: colors.text },
  checkboxActive: { backgroundColor: colors.text },
  filterDivider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  tagEditBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.container, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  tagEditBtnText: { fontSize: 12, color: colors.inactiveText, marginLeft: 4, fontWeight: 'bold' },
  modalInnerContainer: { position: 'absolute', right: 28, width: 160, backgroundColor: colors.surfaceVariant, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: colors.border },
  modalBtn: { backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingVertical: 14, alignItems: 'center', marginBottom: 6 },
  modalBtnText: { fontSize: 16, fontWeight: '600', color: colors.text },
  renameOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBigContent: { padding: 10, width: '80%', backgroundColor: colors.tertiary, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  renameContent: { backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 24 },
  renameInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, marginTop: 16, fontSize: 16, color: colors.text },
  renameActions: { flexDirection: 'row', marginTop: 24 },
  renameBtnCancel: { flex: 1, paddingVertical: 12, backgroundColor: colors.tertiary, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginRight: 8 },
  renameBtnSubmit: { flex: 1, paddingVertical: 12, backgroundColor: colors.secondary, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginLeft: 8 },
  modalBtnTextS: { fontSize: 16, fontWeight: 'bold', color: colors.errow },
  modalBtnTextC: { fontSize: 16, fontWeight: 'bold' },
});
