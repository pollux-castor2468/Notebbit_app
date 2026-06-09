import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Modal, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';
import { ChevronLeft, Info, Check, Plus, Trash2, Pencil, X } from 'lucide-react-native';
import { borderRadius } from '../../../constants/token';
import { useStyles } from '../../../styles';
import { useTaskStore } from '../../../store/useTaskStore';
import { useTaskActions } from '../../../hooks/useTaskActions';
import TopHeader from '../../../components/TopHeader';
import { getRequiredExp } from '../../../utils/leveling';

const RABBIT_IMAGES = {
  static: {
    1: require('../../../assets/img/static1.gif'),
    2: require('../../../assets/img/static2.gif'),
    3: require('../../../assets/img/static3.gif'),
    4: require('../../../assets/img/static4.gif'),
    5: require('../../../assets/img/static5.gif'),
    6: require('../../../assets/img/static6.gif'),
    7: require('../../../assets/img/static7.gif'),
    8: require('../../../assets/img/static8.gif'),
    9: require('../../../assets/img/static9.gif'),
    10: require('../../../assets/img/static10.gif'),
    11: require('../../../assets/img/static11.gif'),
    12: require('../../../assets/img/static12.gif'),
    13: require('../../../assets/img/static13.gif'),
    14: require('../../../assets/img/static14.gif'),
    15: require('../../../assets/img/static15.gif'),
    16: require('../../../assets/img/static16.gif'),
    17: require('../../../assets/img/static17.gif'),
    18: require('../../../assets/img/static18.gif'),
    19: require('../../../assets/img/static19.gif'),
    20: require('../../../assets/img/static20.gif'),
  },
  bounce: {
    1: require('../../../assets/img/bounce1.gif'),
    2: require('../../../assets/img/bounce2.gif'),
    3: require('../../../assets/img/bounce3.gif'),
    4: require('../../../assets/img/bounce4.gif'),
    5: require('../../../assets/img/bounce5.gif'),
    6: require('../../../assets/img/bounce6.gif'),
    7: require('../../../assets/img/bounce7.gif'),
    8: require('../../../assets/img/bounce8.gif'),
    9: require('../../../assets/img/bounce9.gif'),
    10: require('../../../assets/img/bounce10.gif'),
    11: require('../../../assets/img/bounce11.gif'),
    12: require('../../../assets/img/bounce12.gif'),
    13: require('../../../assets/img/bounce13.gif'),
    14: require('../../../assets/img/bounce14.gif'),
    15: require('../../../assets/img/bounce15.gif'),
    16: require('../../../assets/img/bounce16.gif'),
    17: require('../../../assets/img/bounce17.gif'),
    18: require('../../../assets/img/bounce18.gif'),
    19: require('../../../assets/img/bounce19.gif'),
    20: require('../../../assets/img/bounce20.gif'),
  }
};

export default function CustomTasks() {
  const { layoutStyles, textStyles, colors } = useStyles();
  const styles = getStyles(colors);
  const { tasks, level, exp } = useTaskStore();
  const { toggleTask, addTask, updateTask, fetchTasks } = useTaskActions();
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [rabbitState, setRabbitState] = useState('static');
  const navigation = useNavigation();
  
  useLayoutEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks();
    });
    return unsubscribe;
  }, [navigation]);

  const handleRabbitPress = () => {
    if (rabbitState === 'bounce') return;
    setRabbitState('bounce');
    setTimeout(() => {
      setRabbitState('static');
    }, 1000);
  };

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

  //計算完成的任務數量
  const completedCount = tasks.filter(t => t.completed).length;
  //至少顯示5(??不對吧)
  const totalCount = Math.max(2, tasks.length);

  const maxExpNext = getRequiredExp(level);
  const expProgress = `${Math.min(100, Math.max(0, (exp / maxExpNext) * 100))}%`;

  const safeLevel = Math.min(20, Math.max(1, level));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <TopHeader title="自訂任務" />

      {/* Top empty white space area as seen in screenshot */}
      <View style={styles.topEmptySpace}>
        {/* 上面的經驗進度條 */}
        <View style={[styles.topRowSection, { alignItems: 'center', justifyContent: 'space-between' }]}>
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
            {/* Lv. */}
            <View style={styles.levelText}>
              <Text style={styles.topLv}>Lv.</Text>
              <Text style={styles.topLv}>{level}</Text>
            </View>
            {/* 進度條 */}
            <View style={styles.topLvBar}>
              <View style={[styles.topLvBarInner, {width: expProgress}]}></View>
            </View>
            {/* 進度條數字 */}
            <View style={styles.levelText}>
              <Text style={styles.experienceText}>{exp}</Text>
              <Text style={styles.experienceText}>/</Text>
              <Text style={styles.experienceText}>{maxExpNext}</Text>
            </View>
          </View>
          <Pressable style={{ padding: 4 }} onPress={() => setInfoModalVisible(true)}>
            <View style={styles.infoIconWrapper}>
              <Info size={16} color={colors.border} strokeWidth={3} />
            </View>
          </Pressable>
        </View>
        {/* 兔子圖片 */}
        <Pressable style={styles.rabbit} onPress={handleRabbitPress}>
          <Image 
            source={RABBIT_IMAGES[rabbitState][safeLevel]} 
            style={{ width: 400, height: 220 }} 
            resizeMode="contain" 
          />
        </Pressable>
      </View>

      {/* Bottom Gray Section */}
      <View style={styles.bottomSection}>
        <FlatList
          data={tasks}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.titleBadge}>
              <Text style={styles.titleBadgeText}>
                自訂每日任務 (<Text style={styles.titleBadgeCountDim}>{completedCount}</Text> / {totalCount})
              </Text>
            </View>
          }
          renderItem={({ item: task }) => (
            <View style={styles.taskCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Pressable
                  onPress={() => {
                    if (!task.completed) {
                      toggleTask(task.id);
                    }
                  }}
                  disabled={task.completed}
                >
                  <View style={[styles.checkbox, task.completed && styles.checkboxActive]}>
                    {task.completed && <Check size={14} color={colors.text} strokeWidth={4} />}
                  </View>
                </Pressable>
                <Text style={styles.taskTitle}>{task.title}</Text>
              </View>

              <Pressable
                onPress={() => {
                  if (!task.completed) {
                    handleEditPress(task);
                  }
                }}
                style={{ padding: 4, opacity: task.completed ? 0.3 : 1 }}
                disabled={task.completed}
              >
                <Pencil size={18} color={colors.text} />
              </Pressable>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.addButtonContainer}>
              <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Plus size={16} color="#000" />
                <Text style={styles.addButtonText}>新增自訂任務</Text>
              </Pressable>
            </View>
          }
        />
      </View>

      {/* Add Task Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBigContent}>
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
                  <Text style={styles.modalBtnTextC}>取消</Text>
                </Pressable>
                <Pressable style={styles.modalBtnSubmit} onPress={handleAddTask}>
                  <Text style={styles.modalBtnTextS}>新增</Text>
                </Pressable>
              </View>
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
          <View style={styles.modalBigContent}>
            <View style={styles.modalContent}>
              <Text style={textStyles.h3}>重新定義任務目標</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="請輸入任務名稱"
                value={editTaskTitle}
                onChangeText={setEditTaskTitle}
                autoFocus
              />

              <View style={styles.modalActions}>
                <Pressable style={styles.modalBtnCancel} onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.modalBtnTextC}>取消</Text>
                </Pressable>
                <Pressable style={styles.modalBtnSubmit} onPress={handleUpdateTask}>
                  <Text style={styles.modalBtnTextS}>確認</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Info Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={infoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <Pressable style={styles.modalOverlayCenter} onPress={() => setInfoModalVisible(false)}>
          <Pressable style={styles.infoModalContent} onPress={e => e.stopPropagation()}>
            <View style={styles.infoModalContentInner}>
              <Pressable style={styles.infoCloseBtn} onPress={() => setInfoModalVisible(false)}>
                <X size={28} color={colors.text} />
              </Pressable>
              <Text style={styles.infoModalTitle}>自訂任務說明</Text>
              
              <View style={{ marginTop: 16 }}>
                <Text style={styles.infoModalText}>1. 為自己設立每日指標吧，點擊新增按鍵可以增加一個新任務。</Text>
                <Text style={styles.infoModalText}>2. 如果要更改任務目標可以點擊右邊的修改按鍵。</Text>
                <Text style={styles.infoModalText}>3. 完成後在左邊的勾選欄位打勾就能完成任務啦！</Text>
                <Text style={styles.infoModalText}>4. 每天完成的前五個任務可以獲得1點經驗值，快來給激動兔深升級吧！</Text>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  infoIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 50,
    backgroundColor: '#6C5E4F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topEmptySpace: {
    position: 'relative',
    flex: 0.4,
  },
  topRowSection: {
    flexDirection: 'row',
    height: 60,
    padding: 16,
    marginLeft: 16,
    marginRight: 16,
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  levelText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topLv: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  topLvBar: {
    position: 'relative',
    flex: 1,
    height: 20,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topLvBarInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '10%',
    backgroundColor: colors.container,
  },
  // experience: {
  //   flexDirection: 'row',
  //   marginLeft: 16,
  // },
  experienceText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  rabbit: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    flex: 0.6,
    backgroundColor: colors.surfaceVariant,
    borderTopWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    paddingTop: 24,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
    paddingBottom: 60, // 依建議增加底部邊距
    flexGrow: 1,
    // marginTop: 10,
  },
  titleBadge: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderColor: colors.border,
    borderWidth: 1,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
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
    // borderColor: colors.fab,
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
    backgroundColor: colors.container,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBigContent: {
    padding: 10,
    width: '80%',
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
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
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginRight: 8,
  },
  modalBtnSubmit: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalBtnTextS: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.errow,
  },
  modalBtnTextC: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  infoModalContent: {
    backgroundColor: colors.tertiary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surface,
    padding: 5,
    // paddingTop: 32,
    width: '100%',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // elevation: 8,
  },
  infoModalContentInner: {
    backgroundColor: colors.surface,
    // width: '90%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  infoCloseBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    // borderRadius: 12,
    // backgroundColor: colors.errow,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  infoModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  infoModalText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
});
