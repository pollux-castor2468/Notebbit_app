import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Platform, TextInput } from 'react-native';
import { Plus, X, MoreVertical } from 'lucide-react-native';
import { useStyles } from '../../styles';
import { useFileStore } from '../../store/useFileStore';

export default function DataSourceSheet({ visible, onClose, fileId }) {
  const { layoutStyles, colors } = useStyles();
  const styles = getStyles(colors);

  const fileData = useFileStore(state => state.data.find(d => d.id === fileId));
  const addSource = useFileStore(state => state.addSource);
  const updateSource = useFileStore(state => state.updateSource);
  const deleteSource = useFileStore(state => state.deleteSource);

  const sources = fileData?.source || [];

  const [popoverId, setPopoverId] = useState(null);
  const [popoverPos, setPopoverPos] = useState(0);

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editSourceId, setEditSourceId] = useState(null);
  const [editAIContent, setEditAIContent] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  if (!visible) return null;

  const handleAddSource = () => {
    addSource(fileId);
  };

  const handleOpenEdit = (source) => {
    setEditSourceId(source.sourceId);
    setEditAIContent(source.sourceName || '');
    setEditNoteContent(source.sourceContent || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (editSourceId) {
      updateSource(fileId, editSourceId, editNoteContent);
      setEditModalVisible(false);
    }
  };

  const executeDelete = () => {
    if (confirmDeleteId) {
      deleteSource(fileId, confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.bottomSheetOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.bottomSheetContainer}>
          <View style={styles.sheetDragPill} />

          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>資料來源</Text>
            <View style={layoutStyles.rowCenter}>
              <Pressable style={styles.bluePlusBtn} onPress={handleAddSource}>
                <Plus size={20} color={colors.text} />
              </Pressable>
              <Pressable style={styles.closeBtn} onPress={onClose}>
                <X size={24} color={colors.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.sheetSubheadPill}>
            <Text style={[styles.subheadText, { flex: 0.8 }]}>編號</Text>
            <Text style={[styles.subheadText, { flex: 3 }]}>資料名稱</Text>
            <Text style={[styles.subheadText, { width: 40, textAlign: 'center' }]}>其他</Text>
          </View>

          <ScrollView style={{ flex: 1, marginTop: 8 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            {sources.map((s, index) => {
              const num = sources.length - index;
              return (
                <View key={s.sourceId} style={styles.sheetCard}>
                  <Text style={[styles.cardText, { flex: 0.8 }]}>{num}</Text>
                  <Text style={[styles.cardText, { flex: 3 }]} numberOfLines={2}>
                    {s.sourceName || s.sourceContent || `資料${num}`}
                  </Text>
                  <Pressable
                    style={styles.moreBtn}
                    onPress={(e) => {
                      e.target.measure((x, y, width, height, pageX, pageY) => {
                        setPopoverPos(pageY);
                        setPopoverId(s.sourceId);
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
              <Pressable style={styles.popoverItem} onPress={() => {
                const source = sources.find(s => s.sourceId === popoverId);
                if (source) handleOpenEdit(source);
                setPopoverId(null);
              }}>
                <Text style={styles.popoverText}>編輯內容</Text>
              </Pressable>
              <Pressable style={styles.popoverItemDelete} onPress={() => { setConfirmDeleteId(popoverId); setPopoverId(null); }}>
                <Text style={styles.popoverTextRed}>刪除資料</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Edit Data Source Modal */}
      {isEditModalVisible && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>編輯資料</Text>
              
              <TextInput
                style={styles.input}
                placeholder="AI內容"
                placeholderTextColor={colors.inactiveText}
                value={editAIContent}
                onChangeText={setEditAIContent}
              />
              
              <TextInput
                style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                placeholder="資料來源詳細說明..."
                placeholderTextColor={colors.inactiveText}
                value={editNoteContent}
                onChangeText={setEditNoteContent}
                multiline
              />
              
              <View style={styles.actionRow}>
                <Pressable style={[styles.cancelBtn, { marginRight: 6 }]} onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.btnText}>取消</Text>
                </Pressable>
                <Pressable style={[styles.confirmBtn, { marginLeft: 6 }]} onPress={handleSaveEdit}>
                  <Text style={styles.btnText}>儲存</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentSmall}>
              <Text style={[styles.modalTitle, { textAlign: 'center', marginBottom: 24 }]}>是否刪除資料</Text>
              <View style={styles.actionRow}>
                <Pressable style={[styles.confirmBtn, { borderColor: '#C1272D', backgroundColor: '#FFF0F0', marginRight: 6, marginLeft: 0 }]} onPress={executeDelete}>
                  <Text style={[styles.btnText, { color: '#C1272D' }]}>刪除</Text>
                </Pressable>
                <Pressable style={[styles.cancelBtn, { marginLeft: 6, marginRight: 0 }]} onPress={() => setConfirmDeleteId(null)}>
                  <Text style={styles.btnText}>取消</Text>
                </Pressable>
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
    borderWidth: 1,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  closeBtn: {
    padding: 4,
  },
  sheetSubheadPill: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
    width: 320,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  modalContentSmall: {
    backgroundColor: colors.surface,
    width: 250,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.tertiary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
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
