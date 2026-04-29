import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useStyles } from '../../styles';

/**
 * actions: Array<{
 *   key: string;
 *   icon: React.ReactNode;
 *   onPress?: () => void;
 *   active?: boolean;
 *   disabled?: boolean;
 *   hidden?: boolean;
 * }>
 */
export default function EditorHeader({
  title,
  placeholder,
  onBack,
  onChangeTitle,
  actions = [],
  leftIcon,
  titlePreviewChars,
  titlePreviewEllipsis = '…',
}) {
  const { layoutStyles, colors } = useStyles();
  const styles = getStyles(colors);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef(null);

  const previewTitle = useMemo(() => {
    const t = title ?? '';
    if (!titlePreviewChars || titlePreviewChars <= 0) return t;
    if (t.length <= titlePreviewChars) return t;
    return `${t.slice(0, titlePreviewChars)}${titlePreviewEllipsis}`;
  }, [title, titlePreviewChars, titlePreviewEllipsis]);

  return (
    <View style={styles.header}>
      <View style={[layoutStyles.rowCenter, { flex: 1, marginRight: 16 }]}>
        <Pressable onPress={onBack} style={{ marginRight: 16 }}>
          {leftIcon ?? <ChevronLeft size={28} color={colors.text} />}
        </Pressable>

        {titlePreviewChars ? (
          isEditingTitle ? (
            <TextInput
              ref={titleInputRef}
              style={[styles.headerTitle, { flex: 1, padding: 0 }]}
              value={title ?? ''}
              placeholder={placeholder}
              placeholderTextColor="#999"
              onChangeText={onChangeTitle}
              autoFocus
              onBlur={() => setIsEditingTitle(false)}
            />
          ) : (
            <Pressable
              style={{ flex: 1 }}
              onPress={() => {
                setIsEditingTitle(true);
                requestAnimationFrame(() => titleInputRef.current?.focus?.());
              }}
            >
              <Text numberOfLines={1} style={styles.headerTitle}>
                {previewTitle || placeholder || ''}
              </Text>
            </Pressable>
          )
        ) : (
          <TextInput
            style={[styles.headerTitle, { flex: 1, padding: 0 }]}
            value={title ?? ''}
            placeholder={placeholder}
            placeholderTextColor="#999"
            onChangeText={onChangeTitle}
          />
        )}
      </View>

      <View style={layoutStyles.rowCenter}>
        {actions
          .filter(a => !a?.hidden)
          .map(a => (
            <Pressable
              key={a.key}
              style={[
                styles.iconButton,
                a.active ? styles.iconButtonActive : null,
                a.disabled ? styles.iconButtonDisabled : null,
              ]}
              onPress={(e) => a.onPress?.(e)}
              disabled={a.disabled}
            >
              {a.icon}
            </Pressable>
          ))}
      </View>
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.text,
    },
    iconButton: {
      marginLeft: 12,
      padding: 6,
      borderRadius: 20,
    },
    iconButtonActive: {
      backgroundColor: colors.recentSection,
    },
    iconButtonDisabled: {
      opacity: 0.4,
    },
  });

