import React, { useMemo, useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, TextInput, Platform, TouchableOpacity } from 'react-native';
import { X as XIcon } from 'lucide-react-native';
import { useStyles } from '../../styles';

const DEFAULT_GRID_COLORS = [
  ['#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#000000'],
  ['#0047AB', '#311432', '#4B0082', '#8B0000', '#A0522D', '#B8860B', '#556B2F'],
  ['#00BFFF', '#4169E1', '#8A2BE2', '#C71585', '#FF4500', '#FFD700', '#9ACD32'],
  ['#87CEFA', '#DDA0DD', '#EE82EE', '#FFB6C1', '#FFA07A', '#FFFACD', '#98FB98'],
];

const DEFAULT_CIRCLE_COLORS = [
  ['#000000', '#007AFF', '#34C759', '#FFCC00', '#FF3B30'],
  ['#5AC8FA', '#AF52DE', '#5856D6', '#FF2D55', null], // null represents the plus button
];

export default function ColorPickerModal({
  visible,
  title = 'Colors',
  onClose,
  onSelectColor,
  gridColors = DEFAULT_GRID_COLORS,
  circleColors = DEFAULT_CIRCLE_COLORS,
}) {
  const { layoutStyles, colors } = useStyles();
  const styles = getStyles(colors);

  const [isHexMode, setIsHexMode] = useState(false);
  const [hexInput, setHexInput] = useState('');
  const [hexError, setHexError] = useState('');

  const reset = () => {
    setIsHexMode(false);
    setHexInput('');
    setHexError('');
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const applyHex = () => {
    const trimmedHex = hexInput.trim();
    if (!trimmedHex) {
      setHexError('請輸入格式。');
      return;
    }
    const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    if (!hexPattern.test(trimmedHex)) {
      setHexError('格式錯誤。請輸入例如 #FF0000');
      return;
    }
    onSelectColor?.(trimmedHex);
    handleClose();
  };

  const headerTitle = useMemo(() => (isHexMode ? '輸入 Hex 色碼' : title), [isHexMode, title]);

  return (
    <Modal
      visible={!!visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={handleClose}>
        <Pressable style={styles.popoverContainer} onPress={(e) => e.stopPropagation()}>
          
          {/* Top Drag Pill */}
          <View style={styles.dragPill} />
          
          {/* Header */}
          <View style={styles.colorHeader}>
            <Text style={styles.colorTitle}>{headerTitle}</Text>
            <Pressable style={styles.closeBtn} onPress={handleClose}>
              <XIcon size={18} color={colors.text} />
            </Pressable>
          </View>

          {isHexMode ? (
            <View>
              <TextInput
                style={styles.hexInput}
                placeholder="#000000"
                placeholderTextColor={colors.inactiveText}
                value={hexInput}
                onChangeText={(t) => {
                  setHexInput(t);
                  setHexError('');
                }}
                autoCapitalize="characters"
              />
              {hexError ? <Text style={styles.errorText}>{hexError}</Text> : null}
              <View style={layoutStyles.rowCenter}>
                <Pressable style={styles.actionBtnPrimary} onPress={applyHex}>
                  <Text style={styles.actionBtnText}>確認</Text>
                </Pressable>
                <Pressable
                  style={styles.actionBtnSecondary}
                  onPress={() => {
                    setIsHexMode(false);
                    setHexInput('');
                    setHexError('');
                  }}
                >
                  <Text style={[styles.actionBtnText, { color: colors.text }]}>返回</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              {/* Grid Colors */}
              <View style={styles.colorGridWrapper}>
                {gridColors.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.colorGridRow}>
                    {row.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[styles.colorGridSquare, { backgroundColor: color }]}
                        onPress={() => {
                          onSelectColor?.(color);
                          handleClose();
                        }}
                      />
                    ))}
                  </View>
                ))}
              </View>

              {/* Circle Colors */}
              <View style={styles.circleColorsContainer}>
                {circleColors.map((row, rIdx) => (
                  <View key={rIdx} style={styles.circleRow}>
                    {row.map((color) =>
                      color ? (
                        <TouchableOpacity
                          key={color}
                          style={[styles.circleColorBtn, { backgroundColor: color }]}
                          onPress={() => {
                            onSelectColor?.(color);
                            handleClose();
                          }}
                        />
                      ) : (
                        <TouchableOpacity
                          key="plus"
                          style={styles.plusColorBtn}
                          onPress={() => setIsHexMode(true)}
                        >
                          <Text style={styles.plusColorText}>+</Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Bottom Tooltip Arrow */}
          <View style={styles.bottomArrow} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'transparent',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    popoverContainer: {
      backgroundColor: colors.surface,
      width: 280,
      borderRadius: 24,
      padding: 20,
      marginBottom: 90, // Approx height of the bottom toolbar + margin
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 10,
      borderWidth: Platform.OS === 'android' ? 1 : 0,
      borderColor: colors.border,
    },
    bottomArrow: {
      position: 'absolute',
      bottom: -6,
      right: 70, // Roughly aligns with the 'A' button on the toolbar
      width: 16,
      height: 16,
      backgroundColor: colors.surface,
      transform: [{ rotate: '45deg' }],
      borderRadius: 2,
      // Provide some border for Android if needed
      borderBottomWidth: Platform.OS === 'android' ? 1 : 0,
      borderRightWidth: Platform.OS === 'android' ? 1 : 0,
      borderColor: colors.border,
    },
    dragPill: {
      width: 36,
      height: 4,
      backgroundColor: '#E5E7EB',
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 16,
    },
    colorHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingHorizontal: 4,
    },
    colorTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    closeBtn: {
      backgroundColor: '#F3F4F6',
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorGridWrapper: {
      marginBottom: 24,
      borderRadius: 12,
      overflow: 'hidden', // Clips the inner grid squares to form rounded corners
    },
    colorGridRow: {
      flexDirection: 'row',
    },
    colorGridSquare: {
      flex: 1,
      aspectRatio: 1,
    },
    circleColorsContainer: {
      gap: 16,
      paddingHorizontal: 4,
    },
    circleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    circleColorBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    plusColorBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    plusColorText: {
      fontSize: 24,
      fontWeight: '400',
      color: colors.text,
      lineHeight: 28,
    },
    hexInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      marginTop: 4,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    errorText: {
      color: colors.errow || '#FF3B30',
      fontSize: 14,
      marginTop: 8,
      marginLeft: 4,
    },
    actionBtnPrimary: {
      flex: 1,
      marginRight: 8,
      marginTop: 16,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: '#000',
      alignItems: 'center',
    },
    actionBtnSecondary: {
      flex: 1,
      marginLeft: 8,
      marginTop: 16,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
    },
    actionBtnText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FFF',
    },
  });
