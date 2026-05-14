import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, FileText, Edit, MoreVertical } from 'lucide-react-native';
import { router } from 'expo-router';
import { useStyles } from '../styles';
import { useFileStore } from '../store/useFileStore';

export default function TrashScreen() {
  const { colors, textStyles } = useStyles();
  const styles = getStyles(colors);

  const { data, restoreItem, permanentlyDeleteItem } = useFileStore();

  const [selectedItem, setSelectedItem] = useState(null);
  const [popoverPos, setPopoverPos] = useState(0);

  const deletedItems = data.filter(item => item.is_deleted);

  const handleRestore = () => {
    if (selectedItem) {
      restoreItem(selectedItem.id);
      setSelectedItem(null);
    }
  };

  const handlePermanentDelete = () => {
    if (selectedItem) {
      permanentlyDeleteItem(selectedItem.id);
      setSelectedItem(null);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={28} color={colors.text} />
        </Pressable>
        <Text style={[textStyles.h2, { flex: 1, textAlign: 'center', marginRight: 28 }]}>刪除暫存</Text>
      </View>

      <View style={styles.content}>
        <FlatList
          data={deletedItems}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={<Text style={styles.emptyText}>回收桶是空的</Text>}
          renderItem={({ item }) => {
            const isMenuOpen = selectedItem?.id === item.id;
            return (
              <View style={[styles.listItem, isMenuOpen && { borderColor: colors.text, zIndex: 100 }]}>
                <View style={[styles.iconBox, { backgroundColor: item.type === 'diary' ? colors.secondary : colors.container }]}>
                  {item.type === 'diary' ? (
                    <Edit size={24} color={colors.text} />
                  ) : (
                    <FileText size={24} color={colors.text} />
                  )}
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={[textStyles.body, { fontWeight: 'bold' }]}>{item.title}</Text>
                  <Text style={[textStyles.subtitle, { fontSize: 12, marginTop: 4 }]}>{item.date}</Text>
                </View>
                <Pressable
                  style={[styles.dotsBtn, isMenuOpen && styles.dotsBtnActive]}
                  onPress={(e) => {
                    setPopoverPos(e.nativeEvent.pageY);
                    setSelectedItem(item);
                  }}
                >
                  <MoreVertical size={20} color={colors.text} opacity={isMenuOpen ? 1 : 0.5} />
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
            <Pressable style={styles.modalBtn} onPress={handleRestore}>
              <Text style={styles.modalBtnText}>還原檔案</Text>
            </Pressable>
            
            <Pressable style={[styles.modalBtn, { marginBottom: 0 }]} onPress={handlePermanentDelete}>
              <Text style={[styles.modalBtnText, { color: colors.errow }]}>永久刪除檔案</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
  },
  backBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
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
});
