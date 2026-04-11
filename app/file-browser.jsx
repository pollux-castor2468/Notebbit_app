import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, FileText, Search, MoreVertical, Star } from 'lucide-react-native';
import { colors } from '../constants/token';
import { layoutStyles, textStyles } from '../styles';

export default function FileBrowser() {
  const params = useLocalSearchParams();
  const initialType = params.type || 'document';
  
  const [activeTab, setActiveTab] = useState(
    initialType === 'starred' ? 'starred' : (initialType === 'diary' ? 'diary' : 'document')
  );

  const [selectedItem, setSelectedItem] = useState(null);
  const [popoverPos, setPopoverPos] = useState(0); // Only tracking Y coord

  const [data, setData] = useState([
    { id: '1', title: '第一份研究報告', type: 'document', date: '2026.04.04 11:46', starred: true },
    { id: '2', title: '日常隨記 01', type: 'diary', date: '2026.04.03 20:12', starred: false },
    { id: '3', title: '神秘森林考察', type: 'document', date: '2026.04.02 09:30', starred: true },
    { id: '4', title: '筆記：React Native', type: 'document', date: '2026.04.01 14:05', starred: false },
    { id: '5', title: '心情日記', type: 'diary', date: '2026.03.28 22:55', starred: true },
  ]);

  let emptyMessage = '目前沒有任何資料。';

  const filteredData = data.filter(item => {
    if (activeTab === 'starred') return item.starred;
    return item.type === activeTab;
  });

  const handleDelete = () => {
    if (selectedItem) {
      setData(prev => prev.filter(item => item.id !== selectedItem.id));
      setSelectedItem(null);
    }
  };

  const handleRename = () => {
    setSelectedItem(null);
  };

  return (
    <SafeAreaView style={layoutStyles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ChevronLeft size={28} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => router.push('/search')} style={{ padding: 4 }}>
          <Search size={24} color={colors.text} />
        </Pressable>
      </View>

      {/* Pill Segmented Tabs */}
      <View style={styles.segmentedControl}>
        {['document', 'starred', 'diary'].map((tab) => (
          <Pressable 
            key={tab} 
            style={[styles.segmentItem, activeTab === tab && styles.segmentActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.segmentText, activeTab === tab && styles.segmentTextActive]}>
              {tab === 'document' ? '所有文件' : tab === 'starred' ? '星號文件' : '所有日記'}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList 
        data={filteredData}
        contentContainerStyle={styles.listContent}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>{emptyMessage}</Text>}
        renderItem={({ item }) => {
          const isMenuOpen = selectedItem?.id === item.id;
          return (
            <View style={{ zIndex: isMenuOpen ? 100 : 1 }}>
               <Pressable 
                 style={[styles.listItem, isMenuOpen && { borderColor: 'rgba(0,0,0,0.1)' }]}
                 onPress={() => {
                   if (item.type === 'diary') {
                      router.push({ pathname: '/diary-editor', params: { title: item.title } });
                   } else {
                      router.push({ pathname: '/document-editor', params: { title: item.title } });
                   }
                 }}
               >
                 <View style={styles.iconBox}>
                    <FileText size={24} color={colors.text} />
                 </View>

                 <View style={styles.itemTextContainer}>
                   <Text style={[textStyles.body, { fontWeight: '700' }]}>{item.title}</Text>
                   <Text style={[textStyles.subtitle, { marginTop: 4, color: 'rgba(101,68,69,0.5)', fontSize: 12 }]}>{item.date}</Text>
                 </View>

                 <Pressable 
                   style={{ padding: 4, marginRight: 8 }}
                   onPress={() => setData(prev => prev.map(d => d.id === item.id ? { ...d, starred: !d.starred } : d))}
                 >
                   <Star size={20} color={colors.text} fill={item.starred ? colors.text : "transparent"} opacity={item.starred ? 1 : 0.3} />
                 </Pressable>

                 {/* Dots trigger */}
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
            </View>
          );
        }}
      />

      {/* Floating Modal Popover */}
      <Modal transparent visible={!!selectedItem} animationType="fade" onRequestClose={() => setSelectedItem(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedItem(null)}>
          <Pressable 
            style={[styles.modalInnerContainer, { top: popoverPos > 0 ? popoverPos + 10 : '50%' }]} 
            onPress={e => e.stopPropagation()}
          >
            <Pressable style={styles.modalBtn} onPress={handleRename}>
              <Text style={styles.modalBtnText}>
                {selectedItem?.type === 'diary' ? '重新命名日記' : '重新命名文件'}
              </Text>
            </Pressable>
            
            <Pressable style={[styles.modalBtn, { marginBottom: 0 }]} onPress={handleDelete}>
              <Text style={[styles.modalBtnText, { color: '#C1272D' }]}>
                {selectedItem?.type === 'diary' ? '刪除日記' : '刪除文件'}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 62,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    padding: 6,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 16,
    color: colors.inactiveText,
  },
  segmentTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  iconBox: {
    width: 48,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E8F5FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemTextContainer: {
    flex: 1,
  },
  dotsBtn: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsBtnActive: {
    backgroundColor: '#EBEBEB', // Light gray background when active
  },
  modalOverlay: {
    flex: 1,
  },
  modalInnerContainer: {
    position: 'absolute',
    right: 28, // Docked to the right side where the dots naturally sit
    width: 160,
    backgroundColor: '#F3F3F3', // Light gray outer wrapper
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  modalBtn: {
    backgroundColor: '#FFFFFF', // White buttons
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 6,
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
