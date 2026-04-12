import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Info, Check, Plus } from 'lucide-react-native';
import { colors } from '../constants/token';
import { layoutStyles, textStyles } from '../styles';

export default function CustomTasks() {
  const [tasks, setTasks] = useState([
    { id: '1', title: '完成今天的日記', completed: true },
    { id: '2', title: '完成心得報告800字', completed: true },
    { id: '3', title: '完成app簡報', completed: false },
    { id: '4', title: '走10000步', completed: false },
  ]);

  const completedCount = tasks.filter(t => t.completed).length;
  // Let's assume total target is 5 as shown in the screenshot
  const totalCount = 5;

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={layoutStyles.rowBetween}>
        <Pressable onPress={() => router.back()} style={{ padding: 16 }}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[textStyles.h3, { flex: 1, textAlign: 'center' }]}>自訂任務</Text>
        <Pressable style={{ padding: 16 }}>
          <View style={styles.infoIconWrapper}>
            <Info size={16} color="#FFF" strokeWidth={3} />
          </View>
        </Pressable>
      </View>

      {/* Top empty white space area as seen in screenshot */}
      <View style={styles.topEmptySpace} />

      {/* Bottom Gray Section */}
      <View style={styles.bottomSection}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Title Badge representing category and progress */}
          <View style={styles.titleBadge}>
            <Text style={styles.titleBadgeText}>
              自訂每日任務 (<Text style={styles.titleBadgeCountDim}>{completedCount}</Text> / {totalCount})
            </Text>
          </View>

          {/* Tasks List */}
          {tasks.map(task => (
            <Pressable 
              key={task.id} 
              style={styles.taskCard} 
              onPress={() => toggleTask(task.id)}
            >
              <View style={[styles.checkbox, task.completed && styles.checkboxActive]}>
                {task.completed && <Check size={14} color="#FFF" strokeWidth={4} />}
              </View>
              <Text style={styles.taskTitle}>{task.title}</Text>
            </Pressable>
          ))}

          {/* Add Task Button */}
          <View style={styles.addButtonContainer}>
            <Pressable style={styles.addButton}>
              <Plus size={16} color="#000" />
              <Text style={styles.addButtonText}>新增自訂任務</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  infoIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5A5A5A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topEmptySpace: {
    height: '35%',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  titleBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  titleBadgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  titleBadgeCountDim: {
    color: '#A0A0A0',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CCC',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#6A52D0', // Purple selected color
    borderColor: '#6A52D0',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  addButtonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BDE0FE', // Light blue
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
});
