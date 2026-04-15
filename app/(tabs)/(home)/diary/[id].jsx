import React, { useState, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { ChevronLeft, Check, MoreVertical, Sun, Cloud, CloudLightning, CloudRain, Wind, Smile, Meh, Frown, Bold, Underline, Baseline, PaintBucket, Image as ImageIcon, Link, ChevronRight, X as XIcon } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { RichEditor, actions } from 'react-native-pell-rich-editor';
import { colors } from '../../../../constants/token';
import { layoutStyles, textStyles } from '../../../../styles';
import { useFileStore } from '../../../../store/useFileStore';

export default function DiaryEditor() {
  const params = useLocalSearchParams();
  const { id } = params;
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 15,
          right: 15,
          height: 80,
          backgroundColor: '#F4E4D5',
          borderRadius: 40,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: 8,
          paddingTop: 8,
          borderWidth: 1,
          borderColor: '#E0D0C0',
        }
      });
    };
  }, [navigation]);

  const fileData = useFileStore(state => state.data.find(d => d.id === id));
  const updateFile = useFileStore(state => state.updateFile);
  const toggleStar = useFileStore(state => state.toggleStar);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'more' | null
  const [popoverPos, setPopoverPos] = useState(0);
  const [popoverState, setPopoverState] = useState('menu'); // 'menu' | 'wordCount'

  // Content state for Word Count
  const [content, setContent] = useState(fileData?.content || '');
  const richText = useRef(null);
  const [date, setDate] = useState(fileData?.date ? new Date(fileData.date.replace(/\./g, '-')) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedWeather, setSelectedWeather] = useState(fileData?.weather || null);
  const [selectedMood, setSelectedMood] = useState(fileData?.mood || null);
  
  // Link Modal State
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const wordCount = content.replace(/\s/g, '').length || 7; // fallback to 7 if empty to match Figma mock

  React.useEffect(() => {
    if (id) {
      const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
      updateFile(id, { content, weather: selectedWeather, mood: selectedMood, date: formattedDate });
    }
  }, [content, selectedWeather, selectedMood, date, id, updateFile]);

  const gridColors = [
    ['#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#000000'],
    ['#0047AB', '#311432', '#4B0082', '#8B0000', '#A0522D', '#B8860B', '#556B2F'],
    ['#00BFFF', '#4169E1', '#8A2BE2', '#C71585', '#FF4500', '#FFD700', '#9ACD32'],
    ['#87CEFA', '#DDA0DD', '#EE82EE', '#FFB6C1', '#FFA07A', '#FFFACD', '#98FB98'],
  ];
  const circleColors = [
    ['#000000', '#007AFF', '#34C759', '#FFCC00', '#FF3B30'],
    ['#5AC8FA', '#AF52DE', '#5856D6', '#FF2D55', null], // null represents the plus button
  ];

  const handleSelectColor = (color) => {
    if (activeModal === 'colors') {
      richText.current?.sendAction('foreColor', 'result', color); 
    } else if (activeModal === 'bgColors') {
      richText.current?.sendAction('hiliteColor', 'result', color);
    }
    setActiveModal(null);
  };

  const handlePickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'image/*' });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        richText.current?.insertImage(uri, 'width: 100%; max-width: 300px; border-radius: 8px;');
      }
    } catch (err) {
      console.log('Image pick error:', err);
    }
  };

  const handleInsertLink = () => {
    if (linkUrl) {
      richText.current?.insertLink(linkTitle || linkUrl, linkUrl);
      setLinkUrl('');
      setLinkTitle('');
      setActiveModal(null);
    }
  };

  const handleSave = () => {
    router.push('/(tabs)/(home)');
  };

  const showDatepicker = () => {
    try {
      if (Platform.OS === 'android') {
        if (!DateTimePickerAndroid || !DateTimePickerAndroid.open) {
          alert('原生 DatePicker 模組未能載入，請重新編譯 App (Dev Client)。');
          return;
        }
        DateTimePickerAndroid.open({
          value: date,
          mode: 'date',
          display: 'default',
          onChange: (event, selectedDate) => {
            if (event.type === 'set' && selectedDate) {
              setDate(selectedDate);
            }
          },
        });
      } else {
        setShowDatePicker(true);
      }
    } catch (error) {
      alert('無法開啟日曆：' + error.message);
    }
  };

  return (
    <SafeAreaView style={layoutStyles.root}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={[layoutStyles.rowCenter, { flex: 1, marginRight: 16 }]}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
            <ChevronLeft size={28} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
            {fileData?.title || '未命名日記'}
          </Text>
        </View>
        <View style={layoutStyles.rowCenter}>
          <Pressable style={styles.iconButton} onPress={handleSave}>
            <Check size={24} color={colors.text} />
          </Pressable>
          <Pressable
            style={[styles.iconButton, activeModal === 'more' ? styles.dotsBtnActive : null]}
            onPress={(e) => {
              setPopoverPos(e.nativeEvent.pageY);
              setPopoverState('menu');
              setActiveModal('more');
            }}
          >
            <MoreVertical size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>

          {/* Metadata Section */}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>日期：</Text>
            {Platform.OS === 'web' ? (
              React.createElement('input', {
                type: 'date',
                value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
                onChange: (e) => {
                  const newDate = new Date(e.target.value);
                  if (!isNaN(newDate)) setDate(newDate);
                },
                style: {
                  border: 'none',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  color: colors.text,
                }
              })
            ) : (
              <>
                <Pressable 
                  key="date-pressable-fixed"
                  onPress={showDatepicker}
                  style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8 }}
                >
                  <Text style={[styles.metaText, { padding: 0 }]} pointerEvents="none">
                    {`${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`}
                  </Text>
                </Pressable>
                {Platform.OS === 'ios' && showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (event.type === 'set' && selectedDate) {
                        setDate(selectedDate);
                      }
                    }}
                  />
                )}
              </>
            )}
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>天氣：</Text>
            <View style={layoutStyles.rowCenter}>
              <TouchableOpacity onPress={() => setSelectedWeather('sun')} style={{ opacity: selectedWeather === 'sun' || !selectedWeather ? 1 : 0.3 }}>
                <Sun size={24} color="#FACC15" style={styles.metaIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedWeather('cloud')} style={{ opacity: selectedWeather === 'cloud' || !selectedWeather ? 1 : 0.3 }}>
                <Cloud size={24} color="#9CA3AF" style={styles.metaIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedWeather('lightning')} style={{ opacity: selectedWeather === 'lightning' || !selectedWeather ? 1 : 0.3 }}>
                <CloudLightning size={24} color="#D1D5DB" style={styles.metaIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedWeather('rain')} style={{ opacity: selectedWeather === 'rain' || !selectedWeather ? 1 : 0.3 }}>
                <CloudRain size={24} color="#3B82F6" style={styles.metaIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedWeather('wind')} style={{ opacity: selectedWeather === 'wind' || !selectedWeather ? 1 : 0.3 }}>
                <Wind size={24} color="#14B8A6" style={styles.metaIcon} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>心情：</Text>
            <View style={layoutStyles.rowCenter}>
              <TouchableOpacity onPress={() => setSelectedMood('great')} style={{ opacity: selectedMood === 'great' || !selectedMood ? 1 : 0.3 }}>
                <Smile size={24} color="#22C55E" style={styles.metaIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedMood('good')} style={{ opacity: selectedMood === 'good' || !selectedMood ? 1 : 0.3 }}>
                <Smile size={24} color="#84CC16" style={styles.metaIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedMood('normal')} style={{ opacity: selectedMood === 'normal' || !selectedMood ? 1 : 0.3 }}>
                <Meh size={24} color="#EAB308" style={styles.metaIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedMood('bad')} style={{ opacity: selectedMood === 'bad' || !selectedMood ? 1 : 0.3 }}>
                <Frown size={24} color="#F97316" style={styles.metaIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedMood('awful')} style={{ opacity: selectedMood === 'awful' || !selectedMood ? 1 : 0.3 }}>
                <Frown size={24} color="#EF4444" style={styles.metaIcon} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.bodyInput, { overflow: 'hidden' }]}>
            <RichEditor
              ref={richText}
              style={{ flex: 1 }}
              placeholder="輸入內容..."
              initialContentHTML={content}
              onChange={setContent}
              editorStyle={{
                backgroundColor: 'transparent',
                color: colors.text,
                placeholderColor: 'rgba(101, 68, 69, 0.4)',
              }}
            />
          </View>
        </View>
        </TouchableWithoutFeedback>

        {/* Bottom Toolbar Box */}
        <View style={styles.bottomToolbar}>
          <View style={styles.dragPill} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarRow}>
            <Pressable style={styles.toolIcon} onPress={() => richText.current?.sendAction(actions.setBold, 'result')}><Bold size={24} color={colors.text} /></Pressable>
            <Pressable style={styles.toolIcon} onPress={() => richText.current?.sendAction(actions.setUnderline, 'result')}><Underline size={24} color={colors.text} /></Pressable>
            <Pressable style={styles.toolIcon} onPress={() => { setActiveModal('colors'); }}><Baseline size={24} color={colors.text} /></Pressable>
            <Pressable style={styles.toolIcon} onPress={() => { setActiveModal('bgColors'); }}><PaintBucket size={24} color={colors.text} /></Pressable>
            <Pressable style={styles.toolIcon} onPress={handlePickImage}><ImageIcon size={24} color={colors.text} /></Pressable>
            <Pressable style={styles.toolIcon} onPress={() => { setActiveModal('link'); }}><Link size={24} color={colors.text} /></Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Popover overlay */}
      {activeModal === 'more' && (
        <Pressable 
          style={[StyleSheet.absoluteFill, { zIndex: 100, elevation: 10 }]} 
          onPress={() => setActiveModal(null)}
        >
          <Pressable
            style={[styles.popoverContainer, { top: popoverPos > 0 ? popoverPos + 20 : 60 }]}
            onPress={e => e.stopPropagation()}
          >
            {popoverState === 'menu' ? (
              <>
                <Pressable style={styles.popoverBtn} onPress={() => setPopoverState('wordCount')}>
                  <Text style={styles.popoverText}>字數統計</Text>
                  <ChevronRight size={20} color={colors.text} />
                </Pressable>
              </>
            ) : (
              <View style={[styles.popoverBtn, { marginBottom: 0, justifyContent: 'center', paddingVertical: 32 }]}>
                <Text style={[styles.popoverText, { fontSize: 18 }]}>
                  共    <Text style={{ color: '#9CA3AF' }}>{wordCount}</Text>    字
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      )}

      {/* Colors Modal */}
      <Modal
        visible={activeModal === 'colors' || activeModal === 'bgColors'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)}>
          <Pressable style={styles.colorSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.colorHeader}>
              <Text style={styles.colorTitle}>Colors</Text>
              <Pressable style={styles.closeBtn} onPress={() => setActiveModal(null)}>
                <XIcon size={24} color="#666" />
              </Pressable>
            </View>

            <View style={styles.colorGridWrapper}>
              {gridColors.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.colorGridRow}>
                  {row.map((color, colIndex) => {
                    const isTopLeft = rowIndex === 0 && colIndex === 0;
                    const isTopRight = rowIndex === 0 && colIndex === 6;
                    const isBottomLeft = rowIndex === 3 && colIndex === 0;
                    const isBottomRight = rowIndex === 3 && colIndex === 6;
                    return (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorGridSquare,
                          { backgroundColor: color },
                          isTopLeft && { borderTopLeftRadius: 16 },
                          isTopRight && { borderTopRightRadius: 16 },
                          isBottomLeft && { borderBottomLeftRadius: 16 },
                          isBottomRight && { borderBottomRightRadius: 16 },
                        ]}
                        onPress={() => handleSelectColor(color)}
                      />
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={styles.circleColorsContainer}>
              {circleColors.map((row, rIdx) => (
                <View key={rIdx} style={styles.circleRow}>
                  {row.map((color, cIdx) => (
                    color ? (
                      <TouchableOpacity
                        key={color}
                        style={[styles.circleColorBtn, { backgroundColor: color }]}
                        onPress={() => handleSelectColor(color)}
                      />
                    ) : (
                      <TouchableOpacity key="plus" style={styles.plusColorBtn}>
                        <Text style={styles.plusColorText}>+</Text>
                      </TouchableOpacity>
                    )
                  ))}
                </View>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Link Modal */}
      <Modal
        visible={activeModal === 'link'}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <Pressable style={styles.modalBackdropCenter} onPress={() => setActiveModal(null)}>
          <Pressable style={styles.linkModalCard} onPress={e => e.stopPropagation()}>
            <Text style={styles.colorTitle}>插入連結</Text>
            <TextInput
              style={styles.linkInput}
              placeholder="連結標題 (選填)"
              placeholderTextColor="#999"
              value={linkTitle}
              onChangeText={setLinkTitle}
            />
            <TextInput
              style={styles.linkInput}
              placeholder="請輸入網址 https://..."
              placeholderTextColor="#999"
              value={linkUrl}
              onChangeText={setLinkUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
            <View style={layoutStyles.rowCenter}>
              <Pressable style={styles.linkBtnCancel} onPress={() => setActiveModal(null)}>
                <Text style={styles.linkBtnText}>取消</Text>
              </Pressable>
              <Pressable style={styles.linkBtnOk} onPress={handleInsertLink}>
                <Text style={[styles.linkBtnText, { color: '#fff' }]}>確定</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  iconButton: {
    marginLeft: 12,
    padding: 6,
    borderRadius: 20,
  },
  dotsBtnActive: {
    backgroundColor: '#EBEBEB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaLabel: {
    fontSize: 16,
    color: colors.text,
    width: 70,
  },
  metaText: {
    fontSize: 16,
    color: colors.text,
  },
  metaIcon: {
    marginRight: 16,
  },
  bodyInput: {
    flex: 1,
    lineHeight: 28,
    marginTop: 16,
  },
  bottomToolbar: {
    backgroundColor: '#EBEBEB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
  },
  dragPill: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ADADAD',
    alignSelf: 'center',
    marginBottom: 20,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  toolIcon: {
    padding: 8,
    marginHorizontal: 6,
  },
  popoverContainer: {
    position: 'absolute',
    right: 20,
    width: 170,
    backgroundColor: '#F3F3F3',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  popoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  popoverText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  colorSheet: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  colorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  colorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeBtn: {
    backgroundColor: '#E5E5E5',
    padding: 8,
    borderRadius: 20,
  },
  colorGridWrapper: {
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  colorGridRow: {
    flexDirection: 'row',
  },
  colorGridSquare: {
    flex: 1,
    aspectRatio: 1,
  },
  circleColorsContainer: {
    gap: 16,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  circleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleColorBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  plusColorBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusColorText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#000',
    lineHeight: 32,
  },
  modalBackdropCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkModalCard: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  linkInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  linkBtnCancel: {
    flex: 1,
    marginRight: 8,
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
  },
  linkBtnOk: {
    flex: 1,
    marginLeft: 8,
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary || '#666',
    alignItems: 'center',
  },
  linkBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});
