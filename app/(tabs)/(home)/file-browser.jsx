import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { ChevronLeft, FileText, Search, MoreVertical, Star, Book } from 'lucide-react-native';
import { colors } from '../../../constants/token';
import { layoutStyles, textStyles } from '../../../styles';
import { useFileStore } from '../../../store/useFileStore';

export default function FileBrowser() {
  //這一頁是所有文件/星號文件/所有日記頁...嗎???
  //啊啊啊為什麼這個會在(home)的資料夾裡啊(抓狂
  //讓下面的tab區看不見(跑錯地方啦先偷偷藏起來
  // const navigation = useNavigation();
  // useLayoutEffect(() => {
  //   navigation.getParent()?.setOptions({
  //     tabBarStyle: { display: 'none' }
  //   });
  //   return () => {
  //     //恢復tab的樣式?(總之先把原本的樣式直接搬過來
  //     navigation.getParent()?.setOptions({
  //       tabBarStyle: {
  //         position: 'absolute',
  //           bottom: 35,  //調整這個可以逾留出下面空間嗎?
  //           height: 80,
  //           width: '95%',
  //           marginLeft: 8,
  //           backgroundColor: colors.recentSection, // 淺黃背景
  //           borderRadius: 40,
  //           borderTopWidth: 1, // Need border top
  //           elevation: 0,
  //           shadowOpacity: 0,
  //           paddingBottom: 8, // Adjust label spacing
  //           paddingTop: 8,
  //           borderWidth: 1,
  //           borderColor: colors.border,
  //       }
  //     });
  //   };
  // }, [navigation]);
  
  const params = useLocalSearchParams();
  const initialType = params.type || 'document';
  
  const [activeTab, setActiveTab] = useState(
    initialType === 'starred' ? 'starred' : (initialType === 'diary' ? 'diary' : 'document')
  );

  const [selectedItem, setSelectedItem] = useState(null);
  const [popoverPos, setPopoverPos] = useState(0);

  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const { data, setData, updateFile } = useFileStore();

  let emptyMessage = '目前沒有任何資料。';

  const filteredData = data.filter(item => {
    if (activeTab === 'starred') return item.starred;
    return item.type === activeTab;
  });

  //刪除檔案功能
  const handleDelete = () => {
    if (selectedItem) {
      setData(prev => prev.filter(item => item.id !== selectedItem.id));
      setSelectedItem(null);
    }
  };
  //重新命名?
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
      <View style={styles.allFileSection}>
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
                        router.push(`/(tabs)/(home)/diary/${item.id}`);
                    } else {
                        router.push(`/(tabs)/(home)/document/${item.id}`);
                    }
                  }}
                >
                  {/* icon和背景顏色記得要切換 */}
                  <View style={[styles.iconBox, {backgroundColor: item.type === 'diary' ? colors.secondary : colors.container,}]}>
                      {item.type === 'diary' ? (
                        <Book size={24} color={colors.text} />
                      ) : (
                        <FileText size={24} color={colors.text} />
                      )}
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
      </View>

      {/* Floating Modal Popover */}
      <Modal transparent visible={!!selectedItem} animationType="fade" onRequestClose={() => setSelectedItem(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedItem(null)}>
          <Pressable 
            style={[styles.modalInnerContainer, { top: popoverPos > 0 ? popoverPos + 10 : '50%' }]} 
            onPress={e => e.stopPropagation()}
          >
            <Pressable style={styles.modalBtn} onPress={handleRenameClick}>
              <Text style={styles.modalBtnText}>
                {selectedItem?.type === 'diary' ? '重新命名日記' : '重新命名文件'}
              </Text>
            </Pressable>
            
            <Pressable style={[styles.modalBtn, { marginBottom: 0 }]} onPress={handleDelete}>
              <Text style={[styles.modalBtnText, { color: colors.errow }]}>
                {selectedItem?.type === 'diary' ? '刪除日記' : '刪除文件'}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Rename Dialog Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={renameModalVisible}
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={styles.renameOverlay}>
          <View style={styles.modalBigContent}>
            <View style={styles.renameContent}>
              <Text style={textStyles.h3}>重新命名</Text>
              <TextInput
                style={styles.renameInput}
                value={newTitle}
                onChangeText={setNewTitle}
                autoFocus
              />
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 62,
  },
  allFileSection: {
    flex: 1,
    margin: 16,
    marginTop: 0,
    marginBottom: 90,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.recentHeader,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 6,
    // margin: 1,
    // marginTop: 8,
    marginBottom: 16,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentActive: {
    backgroundColor: colors.secondary,
    // padding: 5,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    // elevation: 2,
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
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 48,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    // backgroundColor: colors.tertiary,
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
    backgroundColor: colors.recentSection,
  },
  modalOverlay: {
    flex: 1,
  },
  modalInnerContainer: {
    position: 'absolute',
    right: 28,
    width: 160,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 8 },
    // shadowOpacity: 0.12,
    // shadowRadius: 16,
    // elevation: 6,
  },
  modalBtn: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 6,
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  renameOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBigContent: {
    padding: 10,
    width: '80%',
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  renameContent: {
    // width: '80%',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
  },
  renameInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  renameActions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  renameBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginRight: 8,
  },
  renameBtnSubmit: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalBtnTextS: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.errow,
  },
  modalBtnTextC: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
