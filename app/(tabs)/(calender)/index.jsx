import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, FlatList, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, FileText, Book, CheckSquare, Star, MoreVertical, X, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { useStyles } from '../../../styles';
import TopHeader from '../../../components/TopHeader';
import { useFileStore } from '../../../store/useFileStore';
import { useTaskStore } from '../../../store/useTaskStore';

export default function CalendarScreen() {
  const { layoutStyles, textStyles, colors } = useStyles();
  const styles = getStyles(colors);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('document'); // 'document', 'diary', 'task'

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  const [tempPickerYear, setTempPickerYear] = useState(year);
  const [tempPickerMonth, setTempPickerMonth] = useState(month);

  const { data: fileData } = useFileStore();
  const { tasks, taskCompletions } = useTaskStore();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const selectedDateStrDots = `${selectedDate.getFullYear()}.${String(selectedDate.getMonth() + 1).padStart(2, '0')}.${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedDateStrDashes = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const todayStrDashes = new Date().toISOString().split('T')[0];

  const filteredDocuments = fileData.filter(f => {
    if (f.type !== 'document') return false;
    const isEditedOnDate = f.edited_dates && f.edited_dates.includes(selectedDateStrDashes);
    const isCreatedOnDate = f.date && f.date.startsWith(selectedDateStrDots);
    return isEditedOnDate || isCreatedOnDate;
  });
  const filteredDiaries = fileData.filter(f => {
    if (f.type !== 'diary') return false;
    const isEditedOnDate = f.edited_dates && f.edited_dates.includes(selectedDateStrDashes);
    const isCreatedOnDate = f.diary_date === selectedDateStrDashes || (f.date && f.date.startsWith(selectedDateStrDots));
    return isEditedOnDate || isCreatedOnDate;
  });
  
  const filteredTasks = useMemo(() => {
    if (selectedDateStrDashes === todayStrDashes) {
      return tasks.filter(t => {
        const isCompletedToday = t.completed && t.completed_at && t.completed_at.startsWith(selectedDateStrDashes);
        const isCreatedToday = t.created_at && t.created_at.startsWith(selectedDateStrDashes);
        const isOfflineCreatedToday = !t.created_at;
        return isCompletedToday || isCreatedToday || isOfflineCreatedToday;
      });
    } else {
      const completions = (taskCompletions || []).filter(c => c.completedDate === selectedDateStrDashes);
      return completions.map(c => ({
        id: c.id,
        title: c.taskName,
        completed: true,
      }));
    }
  }, [selectedDateStrDashes, tasks, taskCompletions]);

  const completedTasksCount = filteredTasks.filter(t => t.completed).length;
  
  const showEncouragement = () => {
    const encouragements = ["做得很棒！", "繼續保持！", "太厲害了！", "努力有回報！"];
    const random = encouragements[Math.floor(Math.random() * encouragements.length)];
    Alert.alert("激勵時刻", random);
  };

  const renderCalendarDays = () => {
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.weekHeader}>
          {weekDays.map((day, idx) => (
            <Text key={idx} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {days.map((day, idx) => {
            const isSelected = day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
            return (
              <Pressable 
                key={idx} 
                style={[styles.dayCell, isSelected && styles.selectedDayCell]}
                onPress={() => day && setSelectedDate(new Date(year, month, day))}
              >
                {day ? <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text> : null}
              </Pressable>
            )
          })}
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={layoutStyles.root}>
      <ScrollView contentContainerStyle={layoutStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <TopHeader title="行事曆" />

        <View style={styles.monthSelector}>
          <Pressable onPress={handlePrevMonth} style={{ padding: 8 }}>
            <ChevronLeft size={32} color={colors.text} />
          </Pressable>
          <Pressable onPress={() => {
            setTempPickerYear(year);
            setTempPickerMonth(month);
            setIsMonthPickerVisible(true);
          }}>
            <Text style={[textStyles.h2, { textAlign: 'center' }]}>{year} 年 {month + 1} 月</Text>
          </Pressable>
          <Pressable onPress={handleNextMonth} style={{ padding: 8 }}>
            <ChevronRight size={32} color={colors.text} />
          </Pressable>
        </View>

        {renderCalendarDays()}

        <View style={styles.selectedDateSection}>
          <Text style={[textStyles.h3, { marginBottom: 16 }]}>
            {selectedDate.getFullYear()} 年 {selectedDate.getMonth() + 1} 月 {selectedDate.getDate()} 日
          </Text>

          <View style={styles.statsRow}>
            <Pressable style={styles.statCard} onPress={showEncouragement}>
              <View style={layoutStyles.rowCenter}>
                <FileText size={18} color={colors.text} />
                <Text style={styles.statLabel}>文件</Text>
              </View>
              <Text style={styles.statValue}>{filteredDocuments.length}</Text>
            </Pressable>
            <Pressable style={styles.statCard} onPress={showEncouragement}>
              <View style={layoutStyles.rowCenter}>
                <Book size={18} color={colors.text} />
                <Text style={styles.statLabel}>日記</Text>
              </View>
              <Text style={styles.statValue}>{filteredDiaries.length}</Text>
            </Pressable>
            <Pressable style={styles.statCard} onPress={showEncouragement}>
              <View style={layoutStyles.rowCenter}>
                <CheckSquare size={18} color={colors.text} />
                <Text style={styles.statLabel}>任務</Text>
              </View>
                <Text style={styles.statValue}>{completedTasksCount}/{Math.max(2, filteredTasks.length)}</Text>
            </Pressable>
          </View>

          <View style={styles.tabContainer}>
            <Pressable style={[styles.tabBtn, activeTab === 'document' && styles.tabBtnActive]} onPress={() => setActiveTab('document')}>
              <Text style={activeTab === 'document' ? styles.tabTextActive : styles.tabText}>文件</Text>
            </Pressable>
            <Pressable style={[styles.tabBtn, activeTab === 'diary' && styles.tabBtnActive]} onPress={() => setActiveTab('diary')}>
              <Text style={activeTab === 'diary' ? styles.tabTextActive : styles.tabText}>日記</Text>
            </Pressable>
            <Pressable style={[styles.tabBtn, activeTab === 'task' && styles.tabBtnActive]} onPress={() => setActiveTab('task')}>
              <Text style={activeTab === 'task' ? styles.tabTextActive : styles.tabText}>任務</Text>
            </Pressable>
          </View>

          <View style={styles.listContainer}>
            {activeTab === 'document' && filteredDocuments.map(doc => (
              <View key={doc.id} style={styles.listItem}>
                <View style={[styles.listIconBox, { backgroundColor: colors.container }]}>
                  <FileText size={20} color={colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[textStyles.body, { fontWeight: '700' }]}>{doc.title}</Text>
                  <Text style={[textStyles.subtitle, { fontSize: 12 }]}>{doc.date || doc.time}</Text>
                </View>
                <Star size={20} color={colors.text} style={{ marginRight: 12 }} />
                <MoreVertical size={20} color={colors.text} />
              </View>
            ))}
            {activeTab === 'diary' && filteredDiaries.map(diary => (
              <View key={diary.id} style={styles.listItem}>
                <View style={[styles.listIconBox, { backgroundColor: colors.secondary }]}>
                  <Book size={20} color={colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[textStyles.body, { fontWeight: '700' }]}>{diary.title}</Text>
                  <Text style={[textStyles.subtitle, { fontSize: 12 }]}>{diary.date || diary.time}</Text>
                </View>
                <Star size={20} color={colors.text} style={{ marginRight: 12 }} />
                <MoreVertical size={20} color={colors.text} />
              </View>
            ))}
            {activeTab === 'task' && filteredTasks.map(task => (
              <View key={task.id} style={styles.listItem}>
                <View style={[styles.taskCheckbox, task.completed && styles.taskCheckboxActive]}>
                  {task.completed && <CheckSquare size={14} color={colors.surface} strokeWidth={4} />}
                </View>
                <Text style={[textStyles.body, { flex: 1 }]}>{task.title}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Month Picker Modal */}
      <Modal visible={isMonthPickerVisible} transparent animationType="fade" onRequestClose={() => setIsMonthPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setIsMonthPickerVisible(false)} style={{ padding: 4 }}>
                <X size={24} color={colors.text} />
              </Pressable>
              <Text style={[textStyles.h3, { flex: 1, textAlign: 'center' }]}>篩選月份</Text>
              <Pressable onPress={() => {
                setCurrentDate(new Date(tempPickerYear, tempPickerMonth, 1));
                setIsMonthPickerVisible(false);
              }} style={{ padding: 4 }}>
                <Check size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.yearSelectorRow}>
              <Pressable onPress={() => setTempPickerYear(y => y - 1)} style={{ padding: 8 }}>
                <ChevronLeft size={24} color={colors.text} />
              </Pressable>
              <Text style={[textStyles.h3, { width: 80, textAlign: 'center' }]}>{tempPickerYear}</Text>
              <Pressable onPress={() => setTempPickerYear(y => y + 1)} style={{ padding: 8 }}>
                <ChevronRight size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.monthsGrid}>
              {[...Array(12).keys()].map((m) => (
                <Pressable
                  key={m}
                  style={[
                    styles.monthBtn,
                    tempPickerMonth === m && styles.monthBtnActive
                  ]}
                  onPress={() => setTempPickerMonth(m)}
                >
                  <Text style={[
                    styles.monthBtnText,
                    tempPickerMonth === m && styles.monthBtnTextActive
                  ]}>{m + 1}月</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  calendarContainer: {
    backgroundColor: colors.container,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: '#6b6058',
    borderRadius: 8,
    paddingVertical: 8,
    marginBottom: 12,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    color: '#FFF',
    fontWeight: 'bold',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  selectedDayCell: {
    backgroundColor: '#6b6058',
  },
  dayText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  selectedDateSection: {
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
    color: colors.text,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    color: colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.tertiary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: -1, // overlap border
    zIndex: 1,
    overflow: 'hidden',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: colors.container,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.inactiveText,
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  listContainer: {
    backgroundColor: colors.recentSection,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 16,
    minHeight: 200,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
  },
  listIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskCheckboxActive: {
    backgroundColor: colors.fab,
    borderColor: colors.fab,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    width: '85%',
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  yearSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 16,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthBtn: {
    width: '30%',
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  monthBtnActive: {
    backgroundColor: '#FFF4E0',
    borderColor: '#E8A317',
  },
  monthBtnText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  monthBtnTextActive: {
    fontWeight: 'bold',
  }
});
