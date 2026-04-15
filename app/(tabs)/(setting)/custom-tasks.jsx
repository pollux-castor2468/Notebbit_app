import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';
import { ChevronLeft, Info, Check, Plus, Trash2, Pencil } from 'lucide-react-native';
import { colors } from '../../../constants/token';
import { layoutStyles, textStyles } from '../../../styles';
import { useTaskStore } from '../../../store/useTaskStore';

export default function CustomTasks() {
  const { tasks, toggleTask, addTask, deleteTask, updateTask } = useTaskStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const navigation = useNavigation();
  
  //讓下面的tab區看不見
  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          position: 'absolute',
            bottom: 35,  //調整這個可以逾留出下面空間嗎?
            height: 80,
            width: '95%',
            marginLeft: 8,
            backgroundColor: colors.recentSection, // 淺黃背景
            borderRadius: 40,
            borderTopWidth: 1, // Need border top
            elevation: 0,
            shadowOpacity: 0,
            paddingBottom: 8, // Adjust label spacing
            paddingTop: 8,
            borderWidth: 1,
            borderColor: colors.border,
        }
      });
    };
  }, [navigation]);

  //新增一個自訂任務
  const handleAddTask = () => {
    //確保不是空字串?
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle('');
      setModalVisible(false);
    }
  };
  //修改任務內容
  const handleEditPress = (task) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditModalVisible(true);
  };
  const handleUpdateTask = () => {
    if (editTaskTitle.trim()) {
      updateTask(editingTaskId, editTaskTitle.trim());
      setEditModalVisible(false);
      setEditingTaskId(null);
      setEditTaskTitle('');
    }
  };

  //計算完成的任務數量?
  const completedCount = tasks.filter(t => t.completed).length;
  //至少顯示5(??不對吧)
  const totalCount = Math.max(5, tasks.length);

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
            <View key={task.id} style={styles.taskCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Pressable 
                  // style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                  onPress={() => toggleTask(task.id)}
                >
                  <View style={[styles.checkbox, task.completed && styles.checkboxActive]}>
                    {task.completed && <Check size={14} color="#FFF" strokeWidth={4} />}
                  </View>
                </Pressable>
                <Text style={styles.taskTitle}>{task.title}</Text>
              </View>
              {/* 把刪除改成重新定義任務(跳出重新命名modal) */}
              {/* <Pressable onPress={() => deleteTask(task.id)} style={{ padding: 4 }}>
                <Trash2 size={18} color={colors.inactiveText || '#999'} />
              </Pressable> */}
              <Pressable onPress={() => handleEditPress(task)} style={{ padding: 4 }}>
                <Pencil size={18} color={colors.inactiveText || '#999'} />
              </Pressable>
            </View>
          ))}

          {/* Add Task Button */}
          <View style={styles.addButtonContainer}>
            <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Plus size={16} color="#000" />
              <Text style={styles.addButtonText}>新增自訂任務</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {/* Add Task Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={textStyles.h3}>新增任務</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="請輸入任務名稱"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalBtnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnText}>取消</Text>
              </Pressable>
              <Pressable style={styles.modalBtnSubmit} onPress={handleAddTask}>
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>新增</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* 修改任務目標的視窗，其實應該和新增視窗差不多 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={textStyles.h3}>編輯任務</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="請輸入任務名稱"
              value={editTaskTitle}
              onChangeText={setEditTaskTitle}
              autoFocus
            />

            <View style={styles.modalActions}>
              {/* 取消 */}
              <Pressable
                style={styles.modalBtnCancel}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>取消</Text>
              </Pressable>
              {/* 確認 */}
              <Pressable
                style={styles.modalBtnSubmit}
                onPress={handleUpdateTask}
              >
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>確認</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  infoIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topEmptySpace: {
    height: '35%',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: colors.recentSection,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  titleBadge: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  titleBadgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  titleBadgeCountDim: {
    color: colors.inactiveText,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.fab,
    borderColor: colors.fab,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  addButtonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  modalBtnSubmit: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.fab,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});
