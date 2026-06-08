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

    let iconBg = colors.tertiary;
    let iconComp = null;
    if (isDoc) {
      iconBg = colors.container; // Soft pink
      iconComp = <FileText size={22} color={colors.text} />;
    } else if (isDiary) {
      iconBg = colors.secondary; // Soft yellow/beige
      iconComp = <Book size={22} color={colors.text} />;
    } else if (isTask) {
      iconBg = colors.tertiary; // Soft green
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
          {item.starred && <Star size={24} color={colors.text} fill={colors.text} />}
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
            <View style={styles.statModalImgRow}>
              <Image source={require('../../../assets/img/good_rabbit1.png')} style={styles.statModalImageLeft} resizeMode="contain" />
              <Text style={styles.statModalImageText}>好棒</Text>
              <Image source={require('../../../assets/img/good_rabbit1.png')} style={styles.statModalImageRight} resizeMode="contain" />
            </View>
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
            <View style={styles.statModalImgRow}>
              <Image source={require('../../../assets/img/good_rabbit2.png')} style={styles.statModalImageLeft} resizeMode="contain" />
              <Text style={styles.statModalImageText}>好棒</Text>
              <Image source={require('../../../assets/img/good_rabbit2.png')} style={styles.statModalImageRight} resizeMode="contain" />
            </View>
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
            <View style={styles.statModalImgRow}>
              <Image source={require('../../../assets/img/good_rabbit3.png')} style={styles.statModalImageLeft} resizeMode="contain" />
              <Text style={styles.statModalImageText}>好棒</Text>
              <Image source={require('../../../assets/img/good_rabbit3.png')} style={styles.statModalImageRight} resizeMode="contain" />
            </View>
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
                <Pressable style={[styles.tabBtnCustom, /*{ borderTopLeftRadius: 16},*/ activeTab === 'document' ? styles.tabBtnCustomActive : styles.tabBtnCustomInactive]} onPress={() => setActiveTab('document')}>
                  <Text style={styles.tabTextCustom}>文件</Text>
                </Pressable>
                <Pressable style={[styles.tabBtnCustom, activeTab === 'diary' ? styles.tabBtnCustomActive : styles.tabBtnCustomInactive]} onPress={() => setActiveTab('diary')}>
                  <Text style={styles.tabTextCustom}>日記</Text>
                </Pressable>
                <Pressable style={[styles.tabBtnCustom, /*{ borderTopRightRadius: 16},*/ activeTab === 'task' ? styles.tabBtnCustomActive : styles.tabBtnCustomInactive]} onPress={() => setActiveTab('task')}>
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
            <View style={styles.modalContentInner}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setIsMonthPickerVisible(false)} style={{ padding: 4 }}>
                  <X size={28} color={colors.text} />
                </Pressable>
                <Text style={[textStyles.h3, { flex: 1, textAlign: 'center' }]}>篩選月份</Text>
                <Pressable onPress={() => {
                  setCurrentDate(new Date(tempPickerYear, tempPickerMonth, 1));
                  setIsMonthPickerVisible(false);
                }} style={{ padding: 4 }}>
                  <Check size={28} color={colors.text} />
                </Pressable>
              </View>

              <View style={styles.yearSelectorRow}>
                <Pressable onPress={() => setTempPickerYear(y => y - 1)} style={{ paddingRight: 30 }}>
                  <ChevronLeft size={28} color={colors.text} />
                </Pressable>
                <Text style={[textStyles.h3, { width: 80, textAlign: 'center' }]}>{tempPickerYear}</Text>
                <Pressable onPress={() => setTempPickerYear(y => y + 1)} style={{ paddingLeft: 30 }}>
                  <ChevronRight size={28} color={colors.text} />
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
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setStatModal({ visible: false, type: null })} />
          <View style={styles.statModalContainer}>
            <View style={styles.statModalContainerInner}>
              <Pressable 
                style={styles.statModalCloseBtn} 
                onPress={() => setStatModal({ visible: false, type: null })}
              >
                <X size={28} color={colors.text} />
              </Pressable>
              {renderStatModalContent()}
            </View>
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 16,
    marginBottom: 10,
    height: 40,
    // padding: 4,
    overflow: 'hidden',
  },
  topToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    // borderTopRightRadius: 20,
    // borderBottomRightRadius: 20,
  },
  topToggleBtnActive: {
    backgroundColor: colors.secondary,
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
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingBottom: 5,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    // borderRadius: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    color: colors.white,
    fontWeight: 'bold',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '12%',
    height: 40,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    // borderWidth: 1,
    // borderColor: colors.border,
    margin: '1.1%',
    paddingVertical: 10,
    // backgroundColor: colors.surface,
  },
  selectedDayCell: {
    backgroundColor: colors.border,
  },
  dayText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    position: 'relative',
    bottom: 5,
  },
  selectedDayText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  dotsContainer: {
    // flexDirection: 'row',
    // marginTop: 2,
    // gap: 3,
    position: 'relative',
    bottom: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  dotBorderSelected: {
    borderColor: colors.white,
  },
  //給點點固定位置才看得出是什麼咚咚，點太小看不出顏色啦
  dotDoc: { backgroundColor: colors.container, position: 'absolute', right: '15%', },
  dotDiary: { backgroundColor: colors.secondary, position: 'absolute', right: -3, },
  dotTask: { backgroundColor: colors.fab, position: 'absolute', left: '15%', },
  selectedDateSection: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  tabContainerCustom: {
    flexDirection: 'row',
    zIndex: 2,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    backgroundColor: colors.recentHeader,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderColor: colors.border,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tabBtnCustom: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnCustomActive: {
    backgroundColor: colors.secondary,
  },
  // tabBtnCustomInactive: {
  //   backgroundColor: colors.recentHeader,
  //   // borderBottomColor: colors.border,
  //   // borderBottomWidth: 1,
  // },
  tabTextCustom: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  listContainerCustom: {
    backgroundColor: colors.recentSection,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    color: colors.onPrimary,
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
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 5,
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
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    width: '85%',
    padding: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalContentInner: {
    backgroundColor: colors.surface,
    // width: '90%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
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
    marginBottom: 16,
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
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  monthBtnActive: {
    backgroundColor: colors.secondary,
    // borderColor: '#E8A317',
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
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 5,
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // elevation: 5,
  },
  statModalContainerInner: {
    backgroundColor: colors.surface,
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  statModalCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 10,
  },
  statModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    position: 'relative',
    top: 5,
    left: 10,
  },
  statModalCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
    position: 'relative',
    top: 5,
    left: 120,
  },
  statModalNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  statModalUnit: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  statModalImgRow: {
    // flexDirection: 'row',
    // justifyContent: 'space-around',
    position: 'relative',
    height: 80,
  },
  // statModalImage: {
  //   width: 200,
  //   height: 120,
  // },
  statModalImageLeft: {
    width: 200,
    height: 120,
    position: 'absolute',
    left: -50,
    top: -20,
  },
  statModalImageRight: {
    width: 200,
    height: 120,
    transform: [{scaleX: -1}],  //左右翻轉
    position: 'absolute',
    right: -50,
    top: -20,
  },
  statModalImageText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    position: 'relative',
    top: 15,
    left: '42%',
  }
});
