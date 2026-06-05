import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Paperclip, MoreVertical } from 'lucide-react-native';
import { router } from 'expo-router';
import { useStyles } from '../styles';
import { useFileStore } from '../store/useFileStore';
import { useFileActions } from '../hooks/useFileActions';

export default function TagsEditScreen() {
  const { colors, textStyles } = useStyles();
  const styles = getStyles(colors);

  const { globalTags, setGlobalTags } = useFileStore();
  const { renameTag, deleteTag, addNewTag } = useFileActions();

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTagData, setEditTagData] = useState(null);

  const handleOpenAddModal = () => {
    setActiveMenuId(null);
    setEditTagData({ id: null, name: '新標籤' });
    setEditModalVisible(true);
  };

  const handleOpenEditModal = (tag) => {
    setActiveMenuId(null);
    setEditTagData({ id: tag.id, name: tag.name });
    setEditModalVisible(true);
  };

  const handleDeleteTag = (id, name) => {
    setActiveMenuId(null);
    const newTags = (globalTags || []).filter(t => t.id !== id);
    setGlobalTags(newTags);
    deleteTag(id, name);
  };

  const handleConfirmEdit = () => {
    if (!editTagData) return;
    const { id, name } = editTagData;
    if (id) {
      const originalTag = (globalTags || []).find(t => t.id === id);
      if (originalTag && originalTag.name !== name) {
        renameTag(originalTag.name, name);
      }
    } else {
      addNewTag(name);
    }
    setEditModalVisible(false);
    setEditTagData(null);
  };

  return (
    <SafeAreaView style={styles.root}>
      <Pressable style={{flex: 1}} onPress={() => setActiveMenuId(null)}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color={colors.text} />
          </Pressable>
          <Text style={[textStyles.h2, { flex: 1, textAlign: 'center', marginRight: 44 }]}>標籤管理</Text>
        </View>

        <View style={styles.content}>
          <FlatList
            data={globalTags || []}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListFooterComponent={
              <View style={styles.addBtnContainer}>
                <Pressable style={styles.addPillBtn} onPress={handleOpenAddModal}>
                  <Text style={styles.addPillIcon}>＋</Text>
                  <Text style={styles.addPillText}>新增標籤</Text>
                </Pressable>
              </View>
            }
            renderItem={({ item }) => (
              <View style={{ position: 'relative', zIndex: activeMenuId === item.id ? 10 : 1 }}>
                <View style={styles.tagItem}>
                  <View style={[styles.iconBox, { backgroundColor: '#F3D299' }]}>
                    <Paperclip size={20} color={colors.text} />
                  </View>
                  <Text style={styles.tagText}>{item.name}</Text>
                  
                  <Pressable style={[styles.dotsBtn, activeMenuId === item.id && { backgroundColor: '#E0E0E0' }]} onPress={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === item.id ? null : item.id);
                  }}>
                    <MoreVertical size={20} color={colors.inactiveText} />
                  </Pressable>
                </View>
                
                {activeMenuId === item.id && (
                  <View style={styles.popupMenu}>
                    <Pressable style={styles.popupMenuItem} onPress={() => handleOpenEditModal(item)}>
                      <Text style={styles.popupMenuText}>修改標籤</Text>
                    </Pressable>
                    <View style={styles.popupDivider} />
                    <Pressable style={styles.popupMenuItem} onPress={() => handleDeleteTag(item.id, item.name)}>
                      <Text style={[styles.popupMenuText, { color: '#B3261E' }]}>刪除標籤</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          />
        </View>
      </Pressable>

      <Modal transparent visible={editModalVisible} animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setEditModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={[textStyles.h3, { marginBottom: 16 }]}>修改標籤內容</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.modalInput}
                value={editTagData?.name || ''}
                onChangeText={t => setEditTagData({ ...editTagData, name: t })}
                autoFocus
              />
            </View>
            <View style={styles.modalBtnRow}>
              <Pressable style={styles.modalBtnCancel} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalBtnCancelText}>取消</Text>
              </Pressable>
              <Pressable style={styles.modalBtnConfirm} onPress={handleConfirmEdit}>
                <Text style={styles.modalBtnConfirmText}>確認</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 60 },
  backBtn: { padding: 8 },
  content: { flex: 1, padding: 16 },
  tagItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceVariant || '#FDFBF7', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1, borderColor: colors.border },
  tagText: { flex: 1, fontSize: 16, color: colors.text, fontWeight: 'bold' },
  dotsBtn: { padding: 8, borderRadius: 20 },
  addBtnContainer: { alignItems: 'center', marginTop: 16 },
  addPillBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECAEA9', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: colors.border },
  addPillIcon: { fontSize: 18, color: colors.text, marginRight: 8, fontWeight: 'bold' },
  addPillText: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  popupMenu: { position: 'absolute', right: 12, top: 50, backgroundColor: '#FFF', borderWidth: 1, borderColor: colors.border, borderRadius: 12, width: 140, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  popupMenuItem: { paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  popupMenuText: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  popupDivider: { height: 1, backgroundColor: colors.border },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 300, backgroundColor: '#FFF', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.border },
  inputContainer: { backgroundColor: '#F0F0F0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 24 },
  modalInput: { fontSize: 16, color: colors.text, height: 40 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  modalBtnCancel: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, backgroundColor: '#FFF9E6', borderWidth: 1, borderColor: colors.border },
  modalBtnConfirm: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, backgroundColor: '#FFF1E6', borderWidth: 1, borderColor: colors.border },
  modalBtnCancelText: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  modalBtnConfirmText: { fontSize: 16, fontWeight: 'bold', color: colors.text }
});
