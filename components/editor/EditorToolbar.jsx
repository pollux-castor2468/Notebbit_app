import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Text, Modal } from 'react-native';
import { Bold, Italic, Underline, Baseline, PaintBucket, Image as ImageIcon, Link, ChevronDown } from 'lucide-react-native';
import { actions } from 'react-native-pell-rich-editor';
import { useStyles } from '../../styles';

const FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Verdana', value: 'Verdana' },
];

// HTML execCommand('fontSize') usually supports 1-7.
// Common mapping (browser-dependent): 1=10px,2=13px,3=16px,4=18px,5=24px,6=32px,7=48px
const FONT_SIZES = [
  { label: '10', value: '1' },
  { label: '13', value: '2' },
  { label: '16', value: '3' },
  { label: '18', value: '4' },
  { label: '24', value: '5' },
  { label: '32', value: '6' },
  { label: '48', value: '7' },
];

export default function EditorToolbar({
  variant = 'diary', // 'diary' | 'document'
  richTextRef,
  onPickImage,
  onOpenTextColors,
  onOpenBgColors,
  onOpenLink,
  activeActions = [],
}) {
  const { colors } = useStyles();
  const styles = getStyles(colors);

  const isDocument = variant === 'document';
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[0].value);
  const [fontSize, setFontSize] = useState(FONT_SIZES[2].value); // '3' => 16px-ish
  const [fontModal, setFontModal] = useState(null); // 'family' | 'size' | null

  const hasAction = (actionName) => {
    if (!activeActions) return false;
    // Some versions report action keys like 'bold', some report full action constants.
    return activeActions.includes(actionName) || activeActions.includes(actionName.replace(/^set/, '').toLowerCase());
  };

  const boldActive = hasAction(actions.setBold) || hasAction('bold');
  const italicActive = hasAction(actions.setItalic) || hasAction('italic');
  const underlineActive = hasAction(actions.setUnderline) || hasAction('underline');

  const fontFamilyLabel = useMemo(
    () => FONT_FAMILIES.find(f => f.value === fontFamily)?.label ?? fontFamily,
    [fontFamily]
  );
  const fontSizeLabel = useMemo(
    () => FONT_SIZES.find(s => s.value === fontSize)?.label ?? fontSize,
    [fontSize]
  );

  const applyFontFamily = (family) => {
    setFontFamily(family);
    setFontModal(null);
    richTextRef?.current?.sendAction(actions.setFontName, 'result', family);
  };

  const applyFontSize = (size) => {
    setFontSize(size);
    setFontModal(null);
    richTextRef?.current?.sendAction(actions.setFontSize, 'result', size);
  };

  return (
    <View style={styles.bottomToolbar}>
      <View style={styles.dragPill} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarRow}>
        {isDocument && (
          <View style={styles.dropdownGroup}>
            <Pressable
              style={({ pressed }) => [styles.dropdownContainer, pressed ? styles.dropdownPressed : null]}
              onPress={() => setFontModal('family')}
            >
              <Text style={styles.dropdownText}>{fontFamilyLabel}</Text>
              <ChevronDown size={16} color={colors.text} style={{ marginLeft: 16 }} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.dropdownContainer, pressed ? styles.dropdownPressed : null]}
              onPress={() => setFontModal('size')}
            >
              <Text style={styles.dropdownText}>{fontSizeLabel}</Text>
              <ChevronDown size={16} color={colors.text} style={{ marginLeft: 8 }} />
            </Pressable>
          </View>
        )}

        <View style={isDocument ? styles.actionGroup : styles.actionGroupDiary}>
          <Pressable
            style={({ pressed }) => [
              styles.toolIcon,
              boldActive ? styles.toolIconActive : null,
              pressed ? styles.toolIconPressed : null,
            ]}
            onPress={() => richTextRef?.current?.sendAction(actions.setBold, 'result')}
          >
            <Bold size={isDocument ? 20 : 24} color={colors.text} />
          </Pressable>

          {isDocument ? (
            <Pressable
              style={({ pressed }) => [
                styles.toolIcon,
                italicActive ? styles.toolIconActive : null,
                pressed ? styles.toolIconPressed : null,
              ]}
              onPress={() => richTextRef?.current?.sendAction(actions.setItalic, 'result')}
            >
              <Italic size={20} color={colors.text} />
            </Pressable>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.toolIcon,
              underlineActive ? styles.toolIconActive : null,
              pressed ? styles.toolIconPressed : null,
            ]}
            onPress={() => richTextRef?.current?.sendAction(actions.setUnderline, 'result')}
          >
            <Underline size={isDocument ? 20 : 24} color={colors.text} />
          </Pressable>

          <Pressable style={({ pressed }) => [styles.toolIcon, pressed ? styles.toolIconPressed : null]} onPress={onOpenTextColors}>
            <Baseline size={isDocument ? 20 : 24} color={colors.text} />
          </Pressable>

          <Pressable style={({ pressed }) => [styles.toolIcon, pressed ? styles.toolIconPressed : null]} onPress={onOpenBgColors}>
            <PaintBucket size={isDocument ? 20 : 24} color={colors.text} />
          </Pressable>

          <Pressable style={({ pressed }) => [styles.toolIcon, pressed ? styles.toolIconPressed : null]} onPress={onPickImage}>
            <ImageIcon size={isDocument ? 20 : 24} color={colors.text} />
          </Pressable>

          <Pressable style={({ pressed }) => [styles.toolIcon, pressed ? styles.toolIconPressed : null]} onPress={onOpenLink}>
            <Link size={isDocument ? 20 : 24} color={colors.text} />
          </Pressable>
        </View>
      </ScrollView>

      {isDocument && (
        <Modal
          visible={!!fontModal}
          transparent
          animationType="fade"
          onRequestClose={() => setFontModal(null)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setFontModal(null)}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              {(fontModal === 'family' ? FONT_FAMILIES : FONT_SIZES).map((opt) => (
                <Pressable
                  key={`${fontModal}-${opt.value}`}
                  style={({ pressed }) => [styles.modalRow, pressed ? styles.modalRowPressed : null]}
                  onPress={() => (fontModal === 'family' ? applyFontFamily(opt.value) : applyFontSize(opt.value))}
                >
                  <Text style={styles.modalRowText}>{opt.label}</Text>
                </Pressable>
              ))}
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    bottomToolbar: {
      backgroundColor: colors.tertiary,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dragPill: {
      width: 80,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: 20,
    },
    toolbarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dropdownGroup: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dropdownContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 8,
    },
    dropdownPressed: {
      opacity: 0.75,
    },
    dropdownText: {
      fontSize: 14,
      color: colors.text,
    },
    actionGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 16,
    },
    actionGroupDiary: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    toolIcon: {
      padding: 8,
      marginHorizontal: 6,
      borderRadius: 10,
    },
    toolIconActive: {
      backgroundColor: colors.recentSection,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toolIconPressed: {
      opacity: 0.7,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalCard: {
      width: '100%',
      maxWidth: 360,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    modalRow: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalRowPressed: {
      backgroundColor: colors.recentSection,
    },
    modalRowText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
  });

