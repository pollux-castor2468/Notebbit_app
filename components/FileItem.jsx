import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Book, FileText, Star, MoreVertical } from 'lucide-react-native';
import { router } from 'expo-router';
import { useStyles } from '../styles';
import { useFileActions } from '../hooks/useFileActions';

export default function FileItem({ item, onOpenPopover, style }) {
  const { layoutStyles, textStyles, colors } = useStyles();
  const styles = getStyles(colors);
  const { toggleStar } = useFileActions();

  const handlePress = () => {
    if (item.type === 'diary') {
      router.push(`/diary/${item.id}`);
    } else {
      router.push(`/document/${item.id}`);
    }
  };

  return (
    <Pressable style={[styles.historyItem, style]} onPress={handlePress}>
      <View style={[styles.historyIconBox, { backgroundColor: item.type === 'diary' ? colors.secondary : colors.container }]}>
        {item.type === 'diary' ? (
          <Book size={20} color={colors.text} />
        ) : (
          <FileText size={20} color={colors.text} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[textStyles.body, { fontWeight: '700', marginBottom: 4 }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[textStyles.subtitle, { fontSize: 12 }]}>
          {item.date || item.time} 編輯
        </Text>
      </View>
      
      <View style={layoutStyles.rowCenter}>
        {item.type === 'document' && (
          <Pressable
            style={{ padding: 8 }}
            onPress={(e) => {
              e.stopPropagation();
              toggleStar(item.id);
            }}
          >
            <Star size={20} color={colors.text} fill={item.starred ? colors.text : 'transparent'} />
          </Pressable>
        )}
        <Pressable
          style={{ padding: 8 }}
          onPress={(e) => {
            e.stopPropagation();
            const yPos = e.nativeEvent.pageY;
            if (onOpenPopover) {
              onOpenPopover(item, 35, yPos > 0 ? yPos - 15 : 60);
            }
          }}
        >
          <MoreVertical size={20} color={colors.text} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const getStyles = (colors) => StyleSheet.create({
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
