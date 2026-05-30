import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, ChevronRight, FileText, Search, MoreVertical, Star, Edit, Tag, Filter, X, Check, Calendar } from 'lucide-react-native';
import { useStyles } from '../styles';
import { useFileStore } from '../store/useFileStore';
import { useFileActions } from '../hooks/useFileActions';

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
  const [appliedStarStatus, setAppliedStarStatus] = useState(null); // 'starred', 'unstarred', null
  const [tempStarStatus, setTempStarStatus] = useState(null);
  
  const [appliedSelectedTags, setAppliedSelectedTags] = useState([]);
  const [tempSelectedTags, setTempSelectedTags] = useState([]);

  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  const [tempPickerYear, setTempPickerYear] = useState(new Date().getFullYear());
  const [tempPickerMonth, setTempPickerMonth] = useState(new Date().getMonth());
  const [appliedDateFilter, setAppliedDateFilter] = useState(null);

  const { data } = useFileStore();
  const { updateFile, deleteItem } = useFileActions();

  const allTags = Array.from(new Set(data.filter(d => d.type === 'document' && !d.is_deleted).flatMap(d => d.tags || [])));

  const filteredData = data.filter(item => {
    if (item.is_deleted) return false;
    if (item.type !== activeTab) return false;
    
    if (activeTab === 'document') {
      if (appliedStarStatus === 'starred' && !item.starred) return false;
      if (appliedStarStatus === 'unstarred' && item.starred) return false;
      
      if (appliedSelectedTags.length > 0) {
        const hasTag = appliedSelectedTags.some(tag => (item.tags || []).includes(tag));
        if (!hasTag) return false;
      }
    }
    
    if (activeTab === 'diary' && appliedDateFilter) {
      let year, month;
      if (item.diary_date) {
         const parts = item.diary_date.split('-');
         if (parts.length >= 2) {
             year = parseInt(parts[0], 10);
             month = parseInt(parts[1], 10) - 1;
         }
      } 
      if (year === undefined && item.date) {
         const parts = item.date.split(' ')[0].split('.');
         if (parts.length >= 2) {
             year = parseInt(parts[0], 10);
             month = parseInt(parts[1], 10) - 1;
         }
      }
      if (year !== appliedDateFilter.year || month !== appliedDateFilter.month) return false;
    }
    
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
      let year, month;
      if (item.diary_date) {
         const parts = item.diary_date.split('-');
         if (parts.length >= 2) {
             year = parts[0];
             month = parseInt(parts[1], 10);
         }
      } 
      if (!year && item.date) {
         const parts = item.date.split(' ')[0].split('.');
         if (parts.length >= 2) {
             year = parts[0];
             month = parseInt(parts[1], 10);
         }
      }
      const key = year && month ? `${year} 年 ${month} 月` : '未知時間';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.keys(groups).sort((a, b) => b.localeCompare(a)).map(key => ({ title: key, data: groups[key] }));
  };

  const renderTimelineGroupTitle = (title) => (
    <View style={styles.timelineTitleContainer}>
      <View style={styles.timelineTitleLineContainer}>
        <View style={styles.timelineLineTitle} />
        <View style={styles.timelineTitleDot} />
      </View>
      <View style={styles.timelineBubble}>
        <View style={styles.timelineBubbleTail} />
        <Text style={styles.timelineTitleText}>{title}</Text>
      </View>
    </View>
  );

  const renderTimelineItem = (item, isVeryLast) => (
    <View style={styles.timelineItemContainer} key={item.id}>
      <View style={styles.timelineLineContainer}>
        <View style={[styles.timelineLineItem, isVeryLast && { bottom: '50%' }]} />
        <View style={styles.timelineDot} />
      </View>
      <Pressable 
        style={[styles.listItem, { flex: 1, marginBottom: 16, marginLeft: 16 }]}
        onPress={() => router.push(`/diary/${item.id}`)}
      >
        <View style={[styles.iconBox, {backgroundColor: colors.secondary}]}>
            <Edit size={24} color={colors.text} />
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={[textStyles.body, { fontWeight: '700' }]}>{item.title}</Text>
          <Text style={[textStyles.subtitle, { marginTop: 4, fontSize: 12 }]}>{item.date || item.time}</Text>
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
            <Pressable style={styles.filterBtn} onPress={() => {
              setTempStarStatus(appliedStarStatus);
              setTempSelectedTags([...appliedSelectedTags]);
              setFilterModalVisible(true);
            }}>
              <Filter size={16} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={styles.filterBtnText}>進階篩選</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.filterBtn} onPress={() => {
              setTempPickerYear(appliedDateFilter ? appliedDateFilter.year : new Date().getFullYear());
              setTempPickerMonth(appliedDateFilter ? appliedDateFilter.month : new Date().getMonth());
              setIsMonthPickerVisible(true);
            }}>
              <Calendar size={16} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={styles.filterBtnText}>日期篩選</Text>
            </Pressable>
          )}
        </View>

        {activeTab === 'diary' ? (
          <FlatList
            data={groupDiaries()}
            keyExtractor={item => item.title}
            contentContainerStyle={styles.listContent}
            renderItem={({ item: group, index: groupIndex }) => (
              <View style={styles.timelineGroup}>
                {renderTimelineGroupTitle(group.title)}
                {group.data.map((item, index) => renderTimelineItem(item, index === group.data.length - 1 && groupIndex === groupDiaries().length - 1))}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setFilterModalVisible(false)} style={{ padding: 4 }}>
                <X size={24} color={colors.text} />
              </Pressable>
              <Text style={[textStyles.h3, { flex: 1, textAlign: 'center' }]}>篩選</Text>
              <Pressable onPress={() => {
                setAppliedStarStatus(tempStarStatus);
                setAppliedSelectedTags(tempSelectedTags);
                setFilterModalVisible(false);
              }} style={{ padding: 4 }}>
                <Check size={24} color={colors.text} />
              </Pressable>
            </View>
            
            <View style={styles.filterSection}>
              <View style={styles.filterSectionHeader}>
                <Text style={styles.filterSectionTitle}>星號</Text>
              </View>
              <View style={styles.filterSectionBodyRow}>
                <Pressable 
                  style={[styles.filterIconBtn, tempStarStatus === 'unstarred' && styles.filterIconBtnActive]}
                  onPress={() => setTempStarStatus(s => s === 'unstarred' ? null : 'unstarred')}
                >
                  <Star size={24} color={colors.text} />
                </Pressable>
                <Pressable 
                  style={[styles.filterIconBtn, tempStarStatus === 'starred' && styles.filterIconBtnActive]}
                  onPress={() => setTempStarStatus(s => s === 'starred' ? null : 'starred')}
                >
                  <Star size={24} color={colors.text} fill={colors.text} />
                </Pressable>
              </View>
            </View>

            <View style={styles.filterSection}>
              <View style={styles.filterSectionHeader}>
                <Text style={styles.filterSectionTitle}>標籤</Text>
                <Pressable onPress={() => {
                  setFilterModalVisible(false);
                  router.push('/tags-edit');
                }}>
                  <Edit size={16} color={colors.text} />
                </Pressable>
              </View>
              {allTags.length > 0 ? (
                <View style={styles.tagsGrid}>
                  {allTags.map(tag => (
                    <Pressable
                      key={tag}
                      style={[styles.tagFilterBtn, tempSelectedTags.includes(tag) && styles.tagFilterBtnActive]}
                      onPress={() => {
                        if (tempSelectedTags.includes(tag)) setTempSelectedTags(tempSelectedTags.filter(t => t !== tag));
                        else setTempSelectedTags([...tempSelectedTags, tag]);
                      }}
                    >
                      <Text style={[styles.tagFilterText, tempSelectedTags.includes(tag) && styles.tagFilterTextActive]}>{tag}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={{color: colors.inactiveText, fontSize: 14, marginTop: 8}}>尚無標籤，請點擊右上方圖示新增標籤。</Text>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Month Picker Modal */}
      <Modal visible={isMonthPickerVisible} transparent animationType="fade" onRequestClose={() => setIsMonthPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setIsMonthPickerVisible(false)} style={{ padding: 4 }}>
                <X size={24} color={colors.text} />
              </Pressable>
              <Text style={[textStyles.h3, { flex: 1, textAlign: 'center' }]}>篩選月份</Text>
              <Pressable onPress={() => {
                if (tempPickerMonth !== null) {
                  setAppliedDateFilter({ year: tempPickerYear, month: tempPickerMonth });
                } else {
                  setAppliedDateFilter(null); // Clear filter
                }
                setIsMonthPickerVisible(false);
              }} style={{ padding: 4 }}>
                <Check size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.yearSelectorRow}>
              <Pressable onPress={() => setTempPickerYear(y => y - 1)} style={{ padding: 8 }}>
                <ChevronLeft size={24} color={colors.text} />
              </Pressable>
              <Text style={[textStyles.h3, { width: 80, textAlign: 'center' }]}>{tempPickerYear}</Text>
              <Pressable onPress={() => setTempPickerYear(y => y + 1)} style={{ padding: 8 }}>
                <ChevronRight size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.monthsGrid}>
              {[...Array(12).keys()].map((m) => (
                <Pressable
                  key={m}
                  style={[
                    styles.monthBtn,
                    tempPickerMonth === m && styles.monthBtnActive
                  ]}
                  onPress={() => {
                    if (tempPickerMonth === m) setTempPickerMonth(null);
                    else setTempPickerMonth(m);
                  }}
                >
                  <Text style={[
                    styles.monthBtnText,
                    tempPickerMonth === m && styles.monthBtnTextActive
                  ]}>{m + 1}月</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
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
  timelineGroup: { marginBottom: 0 },
  timelineTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  timelineTitleLineContainer: { width: 30, alignItems: 'center' },
  timelineLineTitle: { width: 2, backgroundColor: colors.border, position: 'absolute', top: '50%', bottom: -16 },
  timelineTitleDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#6b6058', backgroundColor: colors.surface, zIndex: 2 },
  timelineBubble: { backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginLeft: 16, position: 'relative', justifyContent: 'center' },
  timelineBubbleTail: { position: 'absolute', left: -6, top: '50%', marginTop: -6, width: 12, height: 12, backgroundColor: colors.surface, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: colors.border, transform: [{ rotate: '45deg' }] },
  timelineTitleText: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  timelineItemContainer: { flexDirection: 'row' },
  timelineLineContainer: { width: 30, alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#6b6058', marginTop: 35, zIndex: 2 },
  timelineLineItem: { width: 2, backgroundColor: colors.border, position: 'absolute', top: 0, bottom: -16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: colors.surface, borderRadius: 16, width: '85%', padding: 20, borderWidth: 1, borderColor: colors.border },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  yearSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24, gap: 16 },
  monthsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  monthBtn: { width: '30%', paddingVertical: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  monthBtnActive: { backgroundColor: '#FFF4E0', borderColor: '#E8A317' },
  monthBtnText: { fontSize: 16, color: colors.text, fontWeight: '500' },
  monthBtnTextActive: { fontWeight: 'bold' },
  filterModalContent: { position: 'absolute', top: 160, right: 30, width: 220, backgroundColor: colors.surfaceVariant, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  filterSection: { marginBottom: 24 },
  filterSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.text, paddingBottom: 8, marginBottom: 16 },
  filterSectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  filterSectionBodyRow: { flexDirection: 'row' },
  filterIconBtn: { width: 72, height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, marginRight: 16 },
  filterIconBtnActive: { backgroundColor: '#FFF4E0', borderColor: '#E8A317' },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  tagFilterBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginRight: 12, marginBottom: 12 },
  tagFilterBtnActive: { backgroundColor: '#FFF4E0', borderColor: '#E8A317' },
  tagFilterText: { fontSize: 16, color: colors.text },
  tagFilterTextActive: { fontWeight: 'bold' },
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
