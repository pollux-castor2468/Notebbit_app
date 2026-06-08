import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Platform, TextInput } from 'react-native';
import { Plus, X, MoreVertical } from 'lucide-react-native';
import { useStyles } from '../../styles';
import { useFileStore } from '../../store/useFileStore';
import { useFileActions } from '../../hooks/useFileActions';

export default function VersionSheet({ visible, onClose, fileId }) {
  const { layoutStyles, colors } = useStyles();
  const styles = getStyles(colors);

  const fileData = useFileStore(state => state.data.find(d => d.id === fileId));
  const { saveVersion, restoreVersion, deleteVersion } = useFileActions();

  const versions = fileData?.version || [];

  const [popoverId, setPopoverId] = useState(null);
  const [popoverPos, setPopoverPos] = useState(0);

  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [newVersionTitle, setNewVersionTitle] = useState('');

  const [confirmRestoreId, setConfirmRestoreId] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'manual'

  if (!visible) return null;

  const handleAddVersion = () => {
    if (newVersionTitle.trim()) {
      saveVersion(fileId, newVersionTitle.trim());
      setNewVersionTitle('');
      setAddModalVisible(false);
    }
  };

  const executeRestore = () => {
    if (confirmRestoreId) {
      restoreVersion(fileId, confirmRestoreId);
      setConfirmRestoreId(null);
      onClose(); // maybe close sheet after restore
    }
  };

  const executeDelete = (vId) => {
    deleteVersion(fileId, vId);
    setPopoverId(null);
  };

  // 過濾版本
  const filteredVersions = versions.filter(v => {
    if (activeTab === 'all') return true;
    return v.versionTitle !== '自動儲存';
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.bottomSheetOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.bottomSheetContainer}>
          <View style={styles.sheetDragPill} />

          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>版本歷史</Text>
            <View style={layoutStyles.rowCenter}>
              <Pressable style={styles.bluePlusBtn} onPress={() => setAddModalVisible(true)}>
                <Plus size={24} color={colors.text} />
              </Pressable>
              <Pressable style={styles.closeBtn} onPress={onClose}>
                <X size={28} color={colors.text} />
              </Pressable>
            </View>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <Pressable 
              style={[styles.tabButton, activeTab === 'all' && styles.tabButtonActive, { borderRightWidth: 1, borderColor: colors.border }]} 
              onPress={() => setActiveTab('all')}
            >
              <Text style={styles.tabText}>所有版本</Text>
            </Pressable>
            <Pressable 
              style={[styles.tabButton, activeTab === 'manual' && styles.tabButtonActive]} 
              onPress={() => setActiveTab('manual')}
            >
              <Text style={styles.tabText}>手動儲存版本</Text>
            </Pressable>
          </View>

          <View style={styles.sheetSubheadPill}>
            <Text style={[styles.subheadText, { flex: 1.2 }]}>編號</Text>
            <Text style={[styles.subheadText, { flex: 2 }]}>版本名稱</Text>
            <Text style={[styles.subheadText, { flex: 1.5, textAlign: 'center' }]}>儲存日期</Text>
            <Text style={[styles.subheadText, { width: 40, textAlign: 'center' }]}>其他</Text>
          </View>

          <ScrollView style={{ flex: 1, marginTop: 5 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            {filteredVersions.map((v, index) => {
              const versionNum = filteredVersions.length - index; // just for display within filtered
              return (
                <View key={v.versionId} style={styles.sheetCard}>
                  <Text style={[styles.cardText, { flex: 1.2 }]} numberOfLines={1}>版本{versionNum}</Text>
                  <Text style={[styles.cardText, { flex: 2, fontWeight: '700' }]} numberOfLines={1}>{v.versionTitle}</Text>
                  <Text style={[styles.cardText, { flex: 1.5, textAlign: 'center', fontSize: 13 }]} numberOfLines={1}>{v.versionDate?.split(' ')[0]}</Text>
                  <Pressable
                    style={styles.moreBtn}
                    onPress={(e) => {
                      e.target.measure((x, y, width, height, pageX, pageY) => {
                        setPopoverPos(pageY);
                        setPopoverId(v.versionId);
                      });
                    }}
                  >
                    <MoreVertical size={20} color={colors.text} />
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Popover for item actions */}
      {popoverId && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setPopoverId(null)}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPopoverId(null)}>
            <Pressable
              style={[styles.popoverContainer, { top: popoverPos > 0 ? popoverPos - 20 : '50%' }]}
              onPress={e => e.stopPropagation()}
            >
              <Pressable style={styles.popoverItem} onPress={() => { setConfirmRestoreId(popoverId); setPopoverId(null); }}>
                <Text style={styles.popoverText}>回退版本</Text>
              </Pressable>
              <Pressable style={styles.popoverItemDelete} onPress={() => executeDelete(popoverId)}>
                <Text style={styles.popoverTextRed}>刪除版本</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Add Version Modal */}
      {isAddModalVisible && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalContentInner}>
                <Text style={styles.modalTitle}>新增版本名稱</Text>
                <TextInput
                  style={styles.input}
                  placeholder="輸入文字..."
                  placeholderTextColor={colors.inactiveText}
                  value={newVersionTitle}
                  onChangeText={setNewVersionTitle}
                  autoFocus
                />
                <View style={styles.actionRow}>
                  <Pressable style={styles.cancelBtn} onPress={() => setAddModalVisible(false)}>
                    <Text style={styles.btnText}>取消</Text>
                  </Pressable>
                  <Pressable style={styles.confirmBtn} onPress={handleAddVersion}>
                    <Text style={styles.btnText}>確認</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Confirm Restore Modal */}
      {confirmRestoreId && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentSmall}>
              <View style={styles.modalContentInner}>
                <Text style={[styles.modalTitle, { textAlign: 'center', marginBottom: 4 }]}>是否回退到此版本</Text>
                <Text style={[styles.modalTextRed, { textAlign: 'center', marginBottom: 20 }]}>*回退前記得儲存目前檔案！</Text>
                <View style={styles.actionRow}>
                  <Pressable style={[styles.cancelBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]} onPress={executeRestore}>
                    <Text style={[styles.btnText, { color: /*'#C1272D'*/ colors.errow }]}>確認</Text>
                  </Pressable>
                  <Pressable style={styles.confirmBtn} onPress={() => setConfirmRestoreId(null)}>
                    <Text style={styles.btnText}>取消</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}

const getStyles = (colors) => StyleSheet.create({
  bottomSheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)', // slightly dim
  },
  bottomSheetContainer: {
    backgroundColor: colors.recentSection,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    height: '65%',
    borderWidth: 2,
    borderColor: colors.border,
  },
  sheetDragPill: {
    width: 100,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  bluePlusBtn: {
    backgroundColor: '#F5C4C4', // Soft pinkish from screenshot
    width: 48,
    height: 48,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  closeBtn: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    height: 45,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    // backgroundColor: '#FDF8E8', // Slightly darker beige for inactive
    backgroundColor: colors.secondary,
  },
  tabButtonActive: {
    backgroundColor: colors.surface, // Active is solid surface
  },
  tabText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    // position: 'relative',
    // top: -5,
  },
  sheetSubheadPill: {
    flexDirection: 'row',
    backgroundColor: colors.recentHeader,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  subheadText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  sheetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardText: {
    fontSize: 15,
    color: colors.text,
  },
  moreBtn: {
    width: 40,
    alignItems: 'flex-end',
    padding: 8,
  },
  popoverContainer: {
    position: 'absolute',
    right: 32,
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    width: 140,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  popoverItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  popoverItemDelete: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  popoverText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  popoverTextRed: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C1272D',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surfaceVariant,
    width: 280,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 5,
  },
  modalContentInner: {
    backgroundColor: colors.surface,
    // width: '90%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  modalContentSmall: {
    backgroundColor: colors.surfaceVariant,
    width: 250,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  modalTextRed: {
    fontSize: 14,
    color: '#C1272D',
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.tertiary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
