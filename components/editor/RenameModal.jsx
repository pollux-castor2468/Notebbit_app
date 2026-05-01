import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal } from 'react-native';
import { useStyles } from '../../styles';

export default function RenameModal({ visible, initialTitle, onClose, onConfirm }) {
  const { textStyles, colors } = useStyles();
  const styles = getStyles(colors);

  const [newTitle, setNewTitle] = useState(initialTitle || '');

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setNewTitle(initialTitle || '');
    }
  }, [visible, initialTitle]);

  const handleConfirm = () => {
    onConfirm(newTitle);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.renameOverlay}>
        <View style={styles.modalBigContent}>
          <View style={styles.renameContent}>
            <Text style={textStyles.h3}>重新命名</Text>
            <TextInput
              style={styles.renameInput}
              placeholder="輸入文字..."
              placeholderTextColor={colors.inactiveText}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />
            <View style={styles.renameActions}>
              <Pressable style={styles.renameBtnCancel} onPress={onClose}>
                <Text style={styles.modalBtnTextC}>取消</Text>
              </Pressable>
              
              <Pressable style={styles.renameBtnSubmit} onPress={handleConfirm}>
                <Text style={styles.modalBtnTextC}>確認</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors) => StyleSheet.create({
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
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalBtnTextC: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});
