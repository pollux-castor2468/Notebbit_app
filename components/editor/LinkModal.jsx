import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal } from 'react-native';
import { X } from 'lucide-react-native';
import { useStyles } from '../../styles';

export default function LinkModal({ visible, onClose, onInsert }) {
  const { layoutStyles, textStyles, colors } = useStyles();
  const styles = getStyles(colors);

  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkError, setLinkError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setLinkUrl('');
      setLinkTitle('');
      setLinkError('');
    }
  }, [visible]);

  const handleInsert = () => {
    const trimmedUrl = linkUrl.trim();
    if (!trimmedUrl) {
      setLinkError('網址不能為空');
      return;
    }
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(trimmedUrl)) {
      setLinkError('請輸入有效的網址 (例如 https://...)');
      return;
    }

    onInsert(linkTitle.trim() || trimmedUrl, trimmedUrl);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={layoutStyles.rowBetween}>
            <Text style={textStyles.h3}>插入連結</Text>
            <Pressable onPress={onClose} style={{ padding: 4 }}>
              <X size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={[textStyles.body, { marginBottom: 8 }]}>顯示文字 (選填)</Text>
            <TextInput
              style={styles.linkInput}
              placeholder="在此輸入顯示的文字..."
              placeholderTextColor={colors.inactiveText}
              value={linkTitle}
              onChangeText={setLinkTitle}
            />

            <Text style={[textStyles.body, { marginBottom: 8 }]}>網址連結 (必填)</Text>
            <TextInput
              style={[styles.linkInput, linkError ? { borderColor: colors.errow } : null]}
              placeholder="https://..."
              placeholderTextColor={colors.inactiveText}
              value={linkUrl}
              onChangeText={(text) => {
                setLinkUrl(text);
                setLinkError('');
              }}
              autoCapitalize="none"
              keyboardType="url"
            />
            {linkError ? <Text style={styles.errorText}>{linkError}</Text> : null}
          </View>

          <Pressable style={styles.saveBtn} onPress={handleInsert}>
            <Text style={styles.saveBtnText}>確定</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  errorText: {
    color: colors.errow || '#FF3B30',
    fontSize: 12,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: colors.text, // adapt to theme (black in light mode)
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: colors.surface, // inverted color
    fontSize: 16,
    fontWeight: '600',
  },
});
