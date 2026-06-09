import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { useStyles } from '../styles';

export default function FileItemPopover({ visible, type, popoverPos, onClose, onRename, onSetTag, onDelete }) {
  const { colors } = useStyles();
  const styles = getStyles(colors);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.popoverContainer, { top: popoverPos.y, right: popoverPos.x }]}
          onPress={e => e.stopPropagation()}
        >
          <Pressable style={styles.btn} onPress={() => { onClose(); onRename(); }}>
            <Text style={styles.btnText}>{type === 'diary' ? '重新命名日記' : '重新命名文件'}</Text>
          </Pressable>

          {type === 'document' && (
            <Pressable style={styles.btn} onPress={() => { onClose(); onSetTag && onSetTag(); }}>
              <Text style={styles.btnText}>設定標籤</Text>
            </Pressable>
          )}

          <Pressable style={[styles.btn, { marginBottom: 0 }]} onPress={() => { onClose(); onDelete(); }}>
            <Text style={[styles.btnText, { color: colors.errow }]}>{type === 'diary' ? '刪除日記' : '刪除文件'}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const getStyles = (colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  popoverContainer: {
    position: 'absolute',
    width: 155,
    backgroundColor: colors.tertiary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  btn: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
