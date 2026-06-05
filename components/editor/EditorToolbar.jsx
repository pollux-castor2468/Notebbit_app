import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Text, Modal } from 'react-native';
import { Bold, Italic, Underline, Baseline, PaintBucket, Image as ImageIcon, Link, ChevronDown, Edit2, CheckSquare, AlignLeft, AlignCenter, AlignRight } from 'lucide-react-native';
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
  { label: '16', value: '3' },
  { label: '18', value: '4' },
  { label: '24', value: '5' },
  { label: '32', value: '6' },
  { label: '48', value: '7' },
];

const ALIGN_OPTIONS = [
  { label: '靠左對齊', value: 'justifyLeft', Icon: AlignLeft },
  { label: '置中對齊', value: 'justifyCenter', Icon: AlignCenter },
  { label: '靠右對齊', value: 'justifyRight', Icon: AlignRight },
];

export default function EditorToolbar({
  variant = 'diary', // 'diary' | 'document'
  richTextRef,
  onPickImage,
  onOpenTextColors,
  onOpenBgColors,
  onOpenLink,
  onAddSource,
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
  const checkListActive = hasAction(actions.checkboxList) || hasAction('checkboxList');

  const alignCenterActive = hasAction(actions.alignCenter) || hasAction('justifyCenter');
  const alignRightActive = hasAction(actions.alignRight) || hasAction('justifyRight');

  let CurrentAlignIcon = AlignLeft;
  if (alignCenterActive) CurrentAlignIcon = AlignCenter;
  else if (alignRightActive) CurrentAlignIcon = AlignRight;

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
    richTextRef?.current?.injectJavascript(`
      (function() {
        var editor = document.getElementById('editor') || document.querySelector('[contenteditable="true"]');
        if (!editor) return;
        
        editor.style.fontFamily = '${family}';
        
        var sel = window.getSelection();
        var originalRanges = [];
        for (var i = 0; i < sel.rangeCount; i++) {
          originalRanges.push(sel.getRangeAt(i));
        }
        
        if (originalRanges.length === 0) {
          var range = document.createRange();
          range.selectNodeContents(editor);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          document.execCommand('selectAll', false, null);
        }
        
        document.execCommand('fontName', false, '${family}');
        
        sel.removeAllRanges();
        if (originalRanges.length > 0) {
          for (var i = 0; i < originalRanges.length; i++) {
            sel.addRange(originalRanges[i]);
          }
        } else {
          var endRange = document.createRange();
          endRange.selectNodeContents(editor);
          endRange.collapse(false);
          sel.addRange(endRange);
        }
        
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      })();
      true;
    `);
  };

  const applyFontSize = (size) => {
    setFontSize(size);
    setFontModal(null);
    richTextRef?.current?.injectJavascript(`
      (function() {
        var editor = document.getElementById('editor') || document.querySelector('[contenteditable="true"]');
        if (!editor) return;
        
        var sizeMap = { '3': '16px', '4': '18px', '5': '24px', '6': '32px', '7': '48px' };
        if (sizeMap['${size}']) {
          editor.style.fontSize = sizeMap['${size}'];
        }
        
        var sel = window.getSelection();
        var originalRanges = [];
        for (var i = 0; i < sel.rangeCount; i++) {
          originalRanges.push(sel.getRangeAt(i));
        }
        
        if (originalRanges.length === 0) {
          var range = document.createRange();
          range.selectNodeContents(editor);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          document.execCommand('selectAll', false, null);
        }
        
        document.execCommand('fontSize', false, '${size}');
        
        sel.removeAllRanges();
        if (originalRanges.length > 0) {
          for (var i = 0; i < originalRanges.length; i++) {
            sel.addRange(originalRanges[i]);
          }
        } else {
          var endRange = document.createRange();
          endRange.selectNodeContents(editor);
          endRange.collapse(false);
          sel.addRange(endRange);
        }
        
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      })();
      true;
    `);
  };

  const applyAlignment = (command) => {
    setFontModal(null);
    richTextRef?.current?.injectJavascript(`
      (function() {
        var editor = document.getElementById('editor') || document.querySelector('[contenteditable="true"]');
        if (!editor) return;
        
        var sel = window.getSelection();
        var originalRanges = [];
        for (var i = 0; i < sel.rangeCount; i++) {
          originalRanges.push(sel.getRangeAt(i));
        }
        
        if (originalRanges.length === 0) {
          var range = document.createRange();
          range.selectNodeContents(editor);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          document.execCommand('selectAll', false, null);
        }
        
        document.execCommand('${command}', false, null);
        
        sel.removeAllRanges();
        if (originalRanges.length > 0) {
          for (var i = 0; i < originalRanges.length; i++) {
            sel.addRange(originalRanges[i]);
          }
        } else {
          var endRange = document.createRange();
          endRange.selectNodeContents(editor);
          endRange.collapse(false);
          sel.addRange(endRange);
        }
        
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      })();
      true;
    `);
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
            <Pressable
              style={({ pressed }) => [styles.dropdownContainer, pressed ? styles.dropdownPressed : null]}
              onPress={() => setFontModal('align')}
            >
              <CurrentAlignIcon size={16} color={colors.text} />
              <ChevronDown size={16} color={colors.text} style={{ marginLeft: 4 }} />
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

          {isDocument && (
            <Pressable
              style={({ pressed }) => [
                styles.toolIcon,
                checkListActive ? styles.toolIconActive : null,
                pressed ? styles.toolIconPressed : null,
              ]}
              onPress={() => richTextRef?.current?.sendAction(actions.checkboxList, 'result')}
            >
              <CheckSquare size={20} color={colors.text} />
            </Pressable>
          )}

          <Pressable style={({ pressed }) => [styles.toolIcon, pressed ? styles.toolIconPressed : null]} onPress={onPickImage}>
            <ImageIcon size={isDocument ? 20 : 24} color={colors.text} />
          </Pressable>

          <Pressable style={({ pressed }) => [styles.toolIcon, pressed ? styles.toolIconPressed : null]} onPress={onOpenLink}>
            <Link size={isDocument ? 20 : 24} color={colors.text} />
          </Pressable>

          {isDocument && (
            <Pressable style={({ pressed }) => [styles.toolIcon, pressed ? styles.toolIconPressed : null]} onPress={onAddSource}>
              <Edit2 size={20} color={colors.text} />
            </Pressable>
          )}
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
              {(fontModal === 'family' ? FONT_FAMILIES : fontModal === 'size' ? FONT_SIZES : ALIGN_OPTIONS).map((opt) => (
                <Pressable
                  key={`${fontModal}-${opt.value}`}
                  style={({ pressed }) => [styles.modalRow, pressed ? styles.modalRowPressed : null]}
                  onPress={() => {
                    if (fontModal === 'family') applyFontFamily(opt.value);
                    else if (fontModal === 'size') applyFontSize(opt.value);
                    else if (fontModal === 'align') applyAlignment(opt.value);
                  }}
                >
                  {fontModal === 'align' && opt.Icon ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <opt.Icon size={20} color={colors.text} style={{ marginRight: 12 }} />
                      <Text style={styles.modalRowText}>{opt.label}</Text>
                    </View>
                  ) : (
                    <Text style={styles.modalRowText}>{opt.label}</Text>
                  )}
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

