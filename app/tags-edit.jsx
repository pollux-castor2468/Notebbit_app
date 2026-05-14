import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, Plus, MoreVertical } from 'lucide-react-native';
import { router } from 'expo-router';
import { useStyles } from '../styles';

export default function TagsEditScreen() {
  const { colors, textStyles, layoutStyles } = useStyles();
  const styles = getStyles(colors);

  const [tags, setTags] = useState([
    { id: '1', name: '工作' },
    { id: '2', name: '生活' },
    { id: '3', name: '靈感' },
  ]);

  const handleAddTag = () => {
    const newTag = { id: Date.now().toString(), name: '新標籤' };
    setTags([...tags, newTag]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={28} color={colors.text} />
        </Pressable>
        <Text style={[textStyles.h2, { flex: 1, textAlign: 'center' }]}>標籤編輯</Text>
        <Pressable style={styles.backBtn}>
          <Search size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <FlatList
          data={tags}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.tagItem}>
              <View style={[styles.iconBox, { backgroundColor: colors.container }]}>
                 <Text style={{fontSize: 20}}>🏷️</Text>
              </View>
              <TextInput 
                style={styles.tagInput}
                value={item.name}
                onChangeText={(text) => setTags(tags.map(t => t.id === item.id ? { ...t, name: text } : t))}
              />
              <Pressable style={styles.dotsBtn}>
                <MoreVertical size={20} color={colors.inactiveText} />
              </Pressable>
            </View>
          )}
        />
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.addBtn} onPress={handleAddTag}>
          <Plus size={24} color={colors.surface} />
          <Text style={styles.addBtnText}>新增標籤</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
  },
  backBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tertiary,
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  dotsBtn: {
    padding: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: colors.text,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.surface,
    marginLeft: 8,
  },
});
