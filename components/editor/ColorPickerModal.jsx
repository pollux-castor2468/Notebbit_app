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
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={handleClose}>
        <Pressable style={styles.colorSheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.colorHeader}>
            <Text style={styles.colorTitle}>{headerTitle}</Text>
            <Pressable style={styles.closeBtn} onPress={handleClose}>
              <XIcon size={24} color="#666" />
            </Pressable>
          </View>

          {isHexMode ? (
            <View>
              <TextInput
                style={styles.hexInput}
                placeholder="#000000"
                placeholderTextColor="#999"
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
                  <Text style={styles.actionBtnText}>返回</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.colorGridWrapper}>
                {gridColors.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.colorGridRow}>
                    {row.map((color, colIndex) => {
                      const isTopLeft = rowIndex === 0 && colIndex === 0;
                      const isTopRight = rowIndex === 0 && colIndex === row.length - 1;
                      const isBottomLeft = rowIndex === gridColors.length - 1 && colIndex === 0;
                      const isBottomRight = rowIndex === gridColors.length - 1 && colIndex === row.length - 1;
                      return (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorGridSquare,
                            { backgroundColor: color },
                            isTopLeft && { borderTopLeftRadius: 16 },
                            isTopRight && { borderTopRightRadius: 16 },
                            isBottomLeft && { borderBottomLeftRadius: 16 },
                            isBottomRight && { borderBottomRightRadius: 16 },
                          ]}
                          onPress={() => {
                            onSelectColor?.(color);
                            handleClose();
                          }}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>

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
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'flex-end',
    },
    colorSheet: {
      backgroundColor: '#F5F5F5',
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 24,
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    colorHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    colorTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeBtn: {
      backgroundColor: '#E5E5E5',
      padding: 8,
      borderRadius: 20,
    },
    colorGridWrapper: {
      marginBottom: 30,
      backgroundColor: 'transparent',
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
      paddingHorizontal: 8,
      marginBottom: 20,
    },
    circleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    circleColorBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    plusColorBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#E5E5E5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    plusColorText: {
      fontSize: 28,
      fontWeight: '300',
      color: '#000',
      lineHeight: 32,
    },
    hexInput: {
      borderWidth: 1,
      borderColor: '#E5E5E5',
      borderRadius: 8,
      padding: 12,
      marginTop: 4,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    errorText: {
      color: colors.errow,
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
      backgroundColor: '#FDF1E8',
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
      backgroundColor: '#FCF8E8',
      alignItems: 'center',
    },
    actionBtnText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
  });

