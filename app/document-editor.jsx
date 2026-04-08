import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../constants/token';
import { layoutStyles, textStyles } from '../styles';

export default function DocumentEditor() {
  const params = useLocalSearchParams();
  const { title, fileUri, isLocal } = params;

  return (
    <SafeAreaView style={layoutStyles.root}>
      <View style={[layoutStyles.rowBetween, styles.header]}>
        <Pressable onPress={() => router.back()} style={layoutStyles.iconButtonBg}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={textStyles.h3}>
          {isLocal === 'true' ? '外部文件閱讀' : '編輯文件'}
        </Text>
        <View style={{ width: 44 }} /> {/* align right space */}
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="文件標題..."
          placeholderTextColor={colors.inactiveText}
          defaultValue={title || ''}
        />
        {fileUri && (
          <Text style={[textStyles.subtitle, { marginBottom: 16, fontStyle: 'italic' }]}>來源檔案: {fileUri}</Text>
        )}
        <TextInput
          style={[textStyles.body, styles.bodyInput]}
          placeholder="在這裡開始撰寫內容..."
          placeholderTextColor={'rgba(101, 68, 69, 0.4)'}
          multiline
          textAlignVertical="top"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  bodyInput: {
    flex: 1,
    lineHeight: 24,
  },
});
