import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, FlatList, Alert, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, FileText, Book, CheckSquare, Star, MoreVertical, X, Check, Calendar, Clock, Edit } from 'lucide-react-native';
import { router } from 'expo-router';
import { useStyles } from '../../../styles';
import TopHeader from '../../../components/TopHeader';
import { useFileStore } from '../../../store/useFileStore';
import { useTaskStore } from '../../../store/useTaskStore';
import FileItem from '../../../components/FileItem';
import { useFileActionModals, FileActionModals } from '../../../components/FileActionModals';

export default function CalendarScreen() {
  const { layoutStyles, textStyles, colors } = useStyles();
  const styles = getStyles(colors);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('document'); // 'document', 'diary', 'task'
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly', 'timeline'
  const [statModal, setStatModal] = useState({ visible: false, type: null });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  const [tempPickerYear, setTempPickerYear] = useState(year);
  const [tempPickerMonth, setTempPickerMonth] = useState(month);

  const { data: fileData } = useFileStore();
  const { tasks, taskCompletions } = useTaskStore();

  const { openPopover, closePopover, modalProps } = useFileActionModals();

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

  const timelineData = useMemo(() => {
    const dataByDate = {};
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const todayDashes = new Date().toISOString().split('T')[0];

    const daysInM = new Date(y, m + 1, 0).getDate();
    for (let d = daysInM; d >= 1; d--) {
      const dateStrDots = `${y}.${String(m + 1).padStart(2, '0')}.${String(d).padStart(2, '0')}`;
      const dateStrDashes = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const displayDate = `${y} 年 ${String(m + 1).padStart(2, '0')} 月 ${String(d).padStart(2, '0')}日`;
      
      const dayItems = [];
      fileData.forEach(f => {
        if (f.type === 'document' || f.type === 'diary') {
          if ((f.edited_dates && f.edited_dates.includes(dateStrDashes)) || 
              (f.diary_date === dateStrDashes) || 
              (f.date && f.date.startsWith(dateStrDots))) {
            dayItems.push({ ...f, matchedDate: dateStrDashes });
          }
        }
      });
      
      if (dateStrDashes === todayDashes) {
        tasks.forEach(t => {
          const isCompletedToday = t.completed && t.completed_at && t.completed_at.startsWith(dateStrDashes);
          const isCreatedToday = t.created_at && t.created_at.startsWith(dateStrDashes);
          const isOfflineCreatedToday = !t.created_at;
          if (isCompletedToday || isCreatedToday || isOfflineCreatedToday) {
            dayItems.push({ ...t, type: 'task' });
          }
        });
      } else {
        (taskCompletions || []).forEach(c => {
           if (c.completedDate === dateStrDashes) {
             dayItems.push({ id: c.id, title: c.taskName, type: 'task', completed: true });
           }
        });
      }
      
      if (dayItems.length > 0) {
         dataByDate[displayDate] = dayItems;
      }
    }
    return Object.keys(dataByDate).sort((a,b) => b.localeCompare(a)).map(k => ({ title: k, data: dataByDate[k] }));
  }, [fileData, tasks, taskCompletions, currentDate]);

  const getDayStatus = (day) => {
    if (!day) return { doc: false, diary: false, task: false };
    
    const dateStrDots = `${year}.${String(month + 1).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
    const dateStrDashes = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const todayStrDashes = new Date().toISOString().split('T')[0];
    
    const hasDoc = fileData.some(f => {
      if (f.type !== 'document') return false;
      const isEdited = f.edited_dates && f.edited_dates.includes(dateStrDashes);
      const isCreated = f.date && f.date.startsWith(dateStrDots);
      return isEdited || isCreated;
    });
    
    const hasDiary = fileData.some(f => {
      if (f.type !== 'diary') return false;
      const isEdited = f.edited_dates && f.edited_dates.includes(dateStrDashes);
      const isCreated = f.diary_date === dateStrDashes || (f.date && f.date.startsWith(dateStrDots));
      return isEdited || isCreated;
    });
    
    let hasTask = false;
    if (dateStrDashes === todayStrDashes) {
      hasTask = tasks.some(t => {
        const isCompletedToday = t.completed && t.completed_at && t.completed_at.startsWith(dateStrDashes);
        const isCreatedToday = t.created_at && t.created_at.startsWith(dateStrDashes);
        const isOfflineCreatedToday = !t.created_at;
        return isCompletedToday || isCreatedToday || isOfflineCreatedToday;
      });
    } else {
      hasTask = (taskCompletions || []).some(c => c.completedDate === dateStrDashes);
    }
    
    return { doc: hasDoc, diary: hasDiary, task: hasTask };
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
            const status = getDayStatus(day);
            return (
              <Pressable 
                key={idx} 
                style={[styles.dayCell, isSelected && styles.selectedDayCell]}
                onPress={() => day && setSelectedDate(new Date(year, month, day))}
              >
                {day ? (
                  <>
                    <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text>
                    {!!(status.doc || status.diary || status.task) && (
                      <View style={styles.dotsContainer}>
                        {status.doc && <View style={[styles.dot, styles.dotDoc, isSelected && styles.dotBorderSelected]} />}
                        {status.diary && <View style={[styles.dot, styles.dotDiary, isSelected && styles.dotBorderSelected]} />}
                        {status.task && <View style={[styles.dot, styles.dotTask, isSelected && styles.dotBorderSelected]} />}
                      </View>
                    )}
                  </>
                ) : null}
              </Pressable>
            )
          })}
        </View>
      </View>
    )
  }

  const renderTimelineGroupTitle = (title) => (
    <View style={styles.timelineTitleContainer}>
      <View style={styles.timelineTitleLineContainer}>
        <View style={styles.timelineLineTitle} />
        <View style={styles.timelineTitleDot} />
      </View>
      <View style={styles.timelineBubble}>
        <View style={styles.timelineBubbleTail} />
        <Text style={styles.timelineTitleText}>{title}</Text>
      </View>
    </View>
  );
  const renderCalendarItem = (item) => {
    const isTask = item.type === 'task';
    const isDoc = item.type === 'document';
    const isDiary = item.type === 'diary';

    let iconBg = '#F3F4F6';
    let iconComp = null;
    if (isDoc) {
      iconBg = '#F9D9D9'; // Soft pink
      iconComp = <FileText size={22} color={colors.text} />;
    } else if (isDiary) {
      iconBg = '#FFF2CC'; // Soft yellow/beige
      iconComp = <Book size={22} color={colors.text} />;
    } else if (isTask) {
      iconBg = '#D1E8E2'; // Soft green
      iconComp = <CheckSquare size={22} color={colors.text} />;
    }

    const stripHtmlTags = (html) => html ? String(html).replace(/<[^>]*>?/gm, '') : '';
    
    let previewText = isTask ? '' : stripHtmlTags(item.content).substring(0, 30);
    
    // Try to extract snippet for the specific date
    const targetDate = item.matchedDate || selectedDateStrDashes;
    if (!isTask && item.daily_snippets && item.daily_snippets[targetDate]) {
      previewText = item.daily_snippets[targetDate];
    }

    return (
      <Pressable 
        key={item.id} 
        style={styles.calendarItemCard}
        onPress={() => {
           if (isDoc) router.push(`/document/${item.id}`);
           else if (isDiary) router.push(`/diary/${item.id}`);
        }}
      >
        <View style={[styles.calendarItemHeader, !previewText && { marginBottom: 0 }]}>
          <View style={[styles.calendarItemIconBox, { backgroundColor: iconBg }]}>
             {iconComp}
          </View>
          <View style={styles.calendarItemTitleRow}>
            <Text style={styles.calendarItemTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.calendarItemDate}>{item.date || '2026.04.04 11:46'}</Text>
          </View>
          {item.starred && <Star size={24} color="#4B5563" fill="#4B5563" />}
        </View>
        {!!previewText && <Text style={styles.calendarItemPreview} numberOfLines={1}>{previewText}...</Text>}
      </Pressable>
    );
  };

  const renderTimelineItem = (item, isVeryLast) => {
    return (
      <View style={styles.timelineItemContainer} key={item.id}>
        <View style={styles.timelineLineContainer}>
          <View style={[styles.timelineLineItem, isVeryLast && { bottom: '50%' }]} />
          <View style={styles.timelineDot} />
        </View>
        <View style={{ flex: 1, marginBottom: 16, marginLeft: 16 }}>
          {renderCalendarItem(item)}
        </View>
      </View>
    );
  };

  const renderStatModalContent = () => {
    switch (statModal.type) {
      case 'document':
        return (
          <>
            <Text style={styles.statModalTitle}>你在這天編輯了</Text>
            <View style={styles.statModalCountRow}>
              <Text style={styles.statModalNumber}>{filteredDocuments.length}</Text>
              <Text style={styles.statModalUnit}> 篇文件</Text>
            </View>
            <Image source={require('../../../assets/img/good_rabbit1.png')} style={styles.statModalImage} resizeMode="contain" />
          </>
        );
      case 'diary':
        return (
          <>
            <Text style={styles.statModalTitle}>你在這天編輯了</Text>
            <View style={styles.statModalCountRow}>
              <Text style={styles.statModalNumber}>{filteredDiaries.length}</Text>
              <Text style={styles.statModalUnit}> 篇日記</Text>
            </View>
            <Image source={require('../../../assets/img/good_rabbit2.png')} style={styles.statModalImage} resizeMode="contain" />
          </>
        );
      case 'task':
        return (
          <>
            <Text style={styles.statModalTitle}>你在這天完成了</Text>
            <View style={styles.statModalCountRow}>
              <Text style={styles.statModalNumber}>{completedTasksCount}</Text>
              <Text style={styles.statModalUnit}> 次任務</Text>
            </View>
            <Image source={require('../../../assets/img/good_rabbit3.png')} style={styles.statModalImage} resizeMode="contain" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={layoutStyles.root}>
      <ScrollView contentContainerStyle={layoutStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <TopHeader title="行事曆" />

        <View style={styles.topToggleContainer}>
          <Pressable 
            style={[styles.topToggleBtn, viewMode === 'monthly' && styles.topToggleBtnActive]}
            onPress={() => setViewMode('monthly')}
          >
            <Calendar size={16} color={viewMode === 'monthly' ? colors.text : colors.inactiveText} style={{marginRight: 8}} />
            <Text style={viewMode === 'monthly' ? styles.topToggleTextActive : styles.topToggleText}>月曆</Text>
          </Pressable>
          <Pressable 
            style={[styles.topToggleBtn, viewMode === 'timeline' && styles.topToggleBtnActive]}
            onPress={() => setViewMode('timeline')}
          >
            <Clock size={16} color={viewMode === 'timeline' ? colors.text : colors.inactiveText} style={{marginRight: 8}} />
            <Text style={viewMode === 'timeline' ? styles.topToggleTextActive : styles.topToggleText}>時間軸</Text>
          </Pressable>
        </View>

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

        {viewMode === 'monthly' ? (
          <>
            {renderCalendarDays()}

            <View style={styles.selectedDateSection}>
              <Text style={[textStyles.h3, { marginBottom: 16, marginLeft: 8 }]}>
                {selectedDate.getFullYear()} 年 {selectedDate.getMonth() + 1} 月 {selectedDate.getDate()} 日
              </Text>

              <View style={styles.statsRow}>
                <Pressable style={styles.statCard} onPress={() => setStatModal({ visible: true, type: 'document' })}>
                  <View style={layoutStyles.rowCenter}>
                    <FileText size={18} color={colors.text} />
                    <Text style={styles.statLabel}>文件</Text>
                  </View>
                  <Text style={styles.statValue}>{filteredDocuments.length}</Text>
                </Pressable>
                <Pressable style={styles.statCard} onPress={() => setStatModal({ visible: true, type: 'diary' })}>
                  <View style={layoutStyles.rowCenter}>
                    <Edit size={18} color={colors.text} />
                    <Text style={styles.statLabel}>日記</Text>
                  </View>
                  <Text style={styles.statValue}>{filteredDiaries.length}</Text>
                </Pressable>
                <Pressable style={styles.statCard} onPress={() => setStatModal({ visible: true, type: 'task' })}>
                  <View style={layoutStyles.rowCenter}>
                    <CheckSquare size={18} color={colors.text} />
                    <Text style={styles.statLabel}>任務</Text>
                  </View>
                  <Text style={styles.statValue}>{completedTasksCount}/{Math.max(5, filteredTasks.length)}</Text>
                </Pressable>
              </View>

              <View style={styles.tabContainerCustom}>
                <Pressable style={[styles.tabBtnCustom, { borderTopLeftRadius: 16 }, activeTab === 'document' ? styles.tabBtnCustomActive : styles.tabBtnCustomInactive]} onPress={() => setActiveTab('document')}>
                  <Text style={styles.tabTextCustom}>文件</Text>
                </Pressable>
                <Pressable style={[styles.tabBtnCustom, activeTab === 'diary' ? styles.tabBtnCustomActive : styles.tabBtnCustomInactive, { borderLeftWidth: 0 }]} onPress={() => setActiveTab('diary')}>
                  <Text style={styles.tabTextCustom}>日記</Text>
                </Pressable>
                <Pressable style={[styles.tabBtnCustom, { borderTopRightRadius: 16, borderLeftWidth: 0 }, activeTab === 'task' ? styles.tabBtnCustomActive : styles.tabBtnCustomInactive]} onPress={() => setActiveTab('task')}>
                  <Text style={styles.tabTextCustom}>任務</Text>
                </Pressable>
              </View>

              <View style={styles.listContainerCustom}>
                {activeTab === 'document' && filteredDocuments.map(doc => renderCalendarItem(doc))}
                {activeTab === 'diary' && filteredDiaries.map(diary => renderCalendarItem(diary))}
                {activeTab === 'task' && filteredTasks.map(task => renderCalendarItem(task))}
              </View>
            </View>
          </>
        ) : (
          <View style={{ paddingHorizontal: 16, paddingBottom: 40 }}>
            {timelineData.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 40, color: colors.inactiveText, fontSize: 16 }}>目前月份沒有任何紀錄。</Text>
            ) : (
              timelineData.map((group, groupIndex) => (
                <View key={group.title} style={styles.timelineGroup}>
                  {renderTimelineGroupTitle(group.title)}
                  {group.data.map((item, index) => renderTimelineItem(item, index === group.data.length - 1 && groupIndex === timelineData.length - 1))}
                </View>
              ))
            )}
          </View>
        )}

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

      {/* Stat Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={statModal.visible}
        onRequestClose={() => setStatModal({ visible: false, type: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statModalContainer}>
            <Pressable 
              style={styles.statModalCloseBtn} 
              onPress={() => setStatModal({ visible: false, type: null })}
            >
              <X size={24} color={colors.text} />
            </Pressable>
            {renderStatModalContent()}
          </View>
        </View>
      </Modal>

      <FileActionModals {...modalProps} />
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  topToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 4,
  },
  topToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  topToggleBtnActive: {
    backgroundColor: colors.recentHeader,
  },
  topToggleText: { fontSize: 14, color: colors.inactiveText, fontWeight: 'bold' },
  topToggleTextActive: { fontSize: 14, color: colors.text, fontWeight: 'bold' },
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
    marginHorizontal: 16,
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
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#6b6058',
    backgroundColor: 'transparent',
  },
  dotBorderSelected: {
    borderColor: '#FFF',
  },
  dotDoc: { backgroundColor: colors.container },
  dotDiary: { backgroundColor: colors.secondary },
  dotTask: { backgroundColor: colors.fab },
  selectedDateSection: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  tabContainerCustom: {
    flexDirection: 'row',
    zIndex: 2,
  },
  tabBtnCustom: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtnCustomActive: {
    backgroundColor: '#FFFDF5',
    borderBottomColor: '#FFFDF5',
    borderBottomWidth: 1,
  },
  tabBtnCustomInactive: {
    backgroundColor: '#FAD57B',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  tabTextCustom: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  listContainerCustom: {
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    minHeight: 200,
    marginTop: -1,
    zIndex: 1,
  },
  calendarItemCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  calendarItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarItemIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calendarItemTitleRow: {
    flex: 1,
    justifyContent: 'center',
  },
  calendarItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  calendarItemDate: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  calendarItemPreview: {
    fontSize: 14,
    color: '#6B7280',
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
  timelineGroup: { marginBottom: 0 },
  timelineTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  timelineTitleLineContainer: { width: 30, alignItems: 'center' },
  timelineLineTitle: { width: 2, backgroundColor: colors.border, position: 'absolute', top: '50%', bottom: -16 },
  timelineTitleDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#6b6058', backgroundColor: colors.surface, zIndex: 2 },
  timelineBubble: { backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginLeft: 16, position: 'relative', justifyContent: 'center' },
  timelineBubbleTail: { position: 'absolute', left: -6, top: '50%', marginTop: -6, width: 12, height: 12, backgroundColor: colors.surface, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: colors.border, transform: [{ rotate: '45deg' }] },
  timelineTitleText: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  timelineItemContainer: { flexDirection: 'row' },
  timelineLineContainer: { width: 30, alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#6b6058', marginTop: 35, zIndex: 2 },
  timelineLineItem: { width: 2, backgroundColor: colors.border, position: 'absolute', top: 0, bottom: -16 },
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
  },
  statModalContainer: {
    width: '75%',
    backgroundColor: '#FFFDF5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE2C2',
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statModalCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  statModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statModalCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  statModalNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  statModalUnit: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  statModalImage: {
    width: 200,
    height: 120,
  },
});
