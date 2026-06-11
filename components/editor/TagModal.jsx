import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';
import { useStyles } from '../../styles';
import { useFileStore } from '../../store/useFileStore';
import { useFileActions } from '../../hooks/useFileActions';

export default function TagModal({ visible, fileId, onClose }) {
  const { colors } = useStyles();
  const styles = getStyles(colors);

  const data = useFileStore(state => state.data);
  const globalTags = useFileStore(state => state.globalTags || []);
  const fileData = data.find(d => d.id === fileId);
  const { updateFile, addNewTag } = useFileActions();

  const [selectedTags, setSelectedTags] = useState([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState('');

  // Extract all unique tags from global tags
  const allTags = useMemo(() => {
    return globalTags.map(t => t.name);
  }, [globalTags]);

  // Sync selected tags when modal opens
  useEffect(() => {
    if (visible && fileData) {
      setSelectedTags(fileData.tags || []);
    }
  }, [visible, fileData]);

  if (!visible) return null;

  const toggleTag = (tag) => {
    setSelectedTags(prev => {
      const newSelected = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag];
      updateFile(fileId, { tags: newSelected });
      return newSelected;
    });
  };

  const handleAddTag = () => {
    if (newTagText.trim()) {
      const tag = newTagText.trim();
      
      let finalTagName = tag;
      const allTagNames = globalTags.map(t => t.name);
      if (!allTagNames.includes(tag)) {
        finalTagName = addNewTag(tag);
      }

      const newSelected = selectedTags.includes(finalTagName) ? selectedTags : [...selectedTags, finalTagName];
      updateFile(fileId, { tags: newSelected });
      setSelectedTags(newSelected);
      setNewTagText('');
    }
    setIsAddingTag(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
          <View style={styles.subModalContentInner}>
            <Text style={styles.title}>設定標籤</Text>
            
            <ScrollView style={styles.tagList} showsVerticalScrollIndicator={false}>
              {allTags.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <Pressable key={tag} style={styles.tagItem} onPress={() => toggleTag(tag)}>
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <Check size={14} color="#000" />}
                    </View>
                    <Text style={styles.tagText}>{tag}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable style={styles.addBtn} onPress={() => setIsAddingTag(true)}>
              <Text style={styles.addBtnText}>+ 新增標籤</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>

      {/* Add Tag Sub-Modal */}
      {isAddingTag && (
        <Modal visible transparent animationType="fade">
          <Pressable style={styles.overlay} onPress={() => setIsAddingTag(false)}>
            <Pressable style={styles.subModalContent} onPress={e => e.stopPropagation()}>
              <View style={styles.subModalContentInner}>
                <Text style={styles.title}>新增標籤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="輸入文字..."
                  placeholderTextColor={colors.inactiveText}
                  value={newTagText}
                  onChangeText={setNewTagText}
                  autoFocus
                />
                <View style={styles.actionRow}>
                  <Pressable style={styles.cancelBtn} onPress={() => setIsAddingTag(false)}>
                    <Text style={styles.btnText}>取消</Text>
                  </Pressable>
                  <Pressable style={styles.confirmBtn} onPress={handleAddTag}>
                    <Text style={styles.btnText}>確認</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </Modal>
  );
}

const getStyles = (colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surfaceVariant,
    width: 250,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 5,
    maxHeight: '60%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  tagList: {
    marginBottom: 16,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxSelected: {
    backgroundColor: colors.tertiary,
  },
  tagText: {
    fontSize: 16,
    color: colors.text,
  },
  addBtn: {
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  subModalContent: {
    backgroundColor: colors.surfaceVariant,
    width: 280,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 5,
  },
  subModalContentInner: {
    backgroundColor: colors.surface,
    // width: '90%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
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
    marginRight: 6,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: colors.secondary, // Assuming secondary is a distinct color
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 6,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
