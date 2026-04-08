import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Calendar } from 'lucide-react-native';
import { colors } from '../constants/token';
import { layoutStyles, textStyles } from '../styles';

export default function DiaryEditor() {
  const params = useLocalSearchParams();
  const { title } = params;

  return (
    <SafeAreaView style={layoutStyles.root}>
      <View style={[layoutStyles.rowBetween, styles.header]}>
        <Pressable onPress={() => router.back()} style={layoutStyles.iconButtonBg}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={textStyles.h3}>編輯日記</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.dateSelector}>
          <Calendar size={20} color={colors.secondary} />
          <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder="日記主題..."
          placeholderTextColor={colors.inactiveText}
          defaultValue={title || ''}
        />
        
        <TextInput
          style={[textStyles.body, styles.bodyInput]}
          placeholder="今天發生了什麼有趣的事呢..."
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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(149, 175, 152, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  titleInput: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  bodyInput: {
    flex: 1,
    lineHeight: 26,
  },
});
