import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useStyles } from '../../styles';

export default function EditorPopover({ visible, popoverPos, wordCount, type = 'document', onClose, onRename }) {
  const { colors } = useStyles();
  const styles = getStyles(colors);

  const [popoverState, setPopoverState] = useState('menu'); // 'menu' | 'wordCount'

  useEffect(() => {
    if (visible) {
      setPopoverState('menu'); // reset to menu when opened
    }
  }, [visible]);

  if (!visible) return null;

  const renameText = type === 'diary' ? '重新命名日記' : '重新命名文件';

  return (
    <Pressable
      style={[StyleSheet.absoluteFill, { zIndex: 100, elevation: 10 }]}
      onPress={onClose}
    >
      <Pressable
        style={[styles.popoverContainer, { top: popoverPos > 0 ? popoverPos + 20 : 60 }]}
        onPress={e => e.stopPropagation()}
      >
        {popoverState === 'menu' ? (
          <>
            <Pressable style={styles.popoverBtn} onPress={() => setPopoverState('wordCount')}>
              <Text style={styles.popoverText}>字數統計</Text>
              <ChevronRight size={20} color={colors.text} />
            </Pressable>
            
            <Pressable
              style={[styles.popoverBtn, { marginBottom: 0 }]}
              onPress={() => {
                onClose();
                onRename();
              }}
            >
              <Text style={styles.popoverText}>{renameText}</Text>
            </Pressable>
          </>
        ) : (
          <View style={[styles.popoverBtn, { marginBottom: 0, justifyContent: 'center', paddingVertical: 32 }]}>
            <Text style={[styles.popoverText, { fontSize: 18 }]}>
              共    <Text style={{ color: colors.inactiveText }}>{wordCount}</Text>    字
            </Text>
          </View>
        )}
      </Pressable>
    </Pressable>
  );
}

const getStyles = (colors) => StyleSheet.create({
  popoverContainer: {
    position: 'absolute',
    right: 20,
    width: 170,
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    elevation: 6,
  },
  popoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  popoverText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
