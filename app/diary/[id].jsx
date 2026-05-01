import React, { useState, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { Check, MoreVertical, Sun, Cloud, CloudLightning, CloudRain, Wind, Smile, Meh, Frown, ChevronRight, X as XIcon } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { RichEditor, actions } from 'react-native-pell-rich-editor';
import { useStyles } from '../../styles';
import { useFileStore } from '../../store/useFileStore';
import EditorHeader from '../../components/editor/EditorHeader';
import EditorToolbar from '../../components/editor/EditorToolbar';
import ColorPickerModal from '../../components/editor/ColorPickerModal';
import LinkModal from '../../components/editor/LinkModal';
import RenameModal from '../../components/editor/RenameModal';
import EditorPopover from '../../components/editor/EditorPopover';

export default function DiaryEditor() {
  const { layoutStyles, textStyles, colors } = useStyles();
  const styles = getStyles(colors);
  const params = useLocalSearchParams();
  const { id } = params;
  const navigation = useNavigation();

  // TabBar patch removed as the editor is now a full stack screen

  const fileData = useFileStore(state => state.data.find(d => d.id === id));
  const updateFile = useFileStore(state => state.updateFile);
  const toggleStar = useFileStore(state => state.toggleStar);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'more' | null
  const [popoverPos, setPopoverPos] = useState(0);


  // Content state for Word Count
  const [content, setContent] = useState(fileData?.content || '');
  const richText = useRef(null);
  const [activeActions, setActiveActions] = useState([]);
  const [date, setDate] = useState(fileData?.date ? new Date(fileData.date.replace(/\./g, '-')) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedWeather, setSelectedWeather] = useState(fileData?.weather || null);
  const [selectedMood, setSelectedMood] = useState(fileData?.mood || null);

  const [isRenameModalVisible, setRenameModalVisible] = useState(false);

  const stripHtmlTags = (html) => html ? String(html).replace(/<[^>]*>?/gm, '') : '';
  const wordCount = stripHtmlTags(content).replace(/\s/g, '').length || 0;

  React.useEffect(() => {
    if (id) {
      const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
      updateFile(id, { content, weather: selectedWeather, mood: selectedMood, date: formattedDate });
    }
  }, [content, selectedWeather, selectedMood, date, id, updateFile]);

  React.useEffect(() => {
    const editor = richText.current;
    if (!editor?.registerToolbar) return;
    const timer = setTimeout(() => {
      try {
        editor.registerToolbar((items) => setActiveActions(items || []));
      } catch {
        // ignore if editor not ready
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleRenameConfirm = (updatedTitle) => {
    if (id && updatedTitle.trim() !== '') {
      updateFile(id, { title: updatedTitle.trim() });
    }
    setRenameModalVisible(false);
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        richText.current?.insertImage(uri, 'width: 100%; max-width: 300px; border-radius: 8px;');
      }
    } catch (err) {
      alert('選取圖片時發生錯誤');
      console.log('Image pick error:', err);
    }
  };

  const handleInsertLink = (title, url) => {
    richText.current?.insertLink(title, url);
    setActiveModal(null);
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

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
    richText.current?.blurContentEditor();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
          {/* Top Header */}
          <EditorHeader
            title={fileData?.title || ''}
            placeholder="未命名日記"
            titlePreviewChars={8}
            onBack={() => router.back()}
            onChangeTitle={(text) => {
              if (id) {
                updateFile(id, { title: text });
                setNewTitle(text);
              }
            }}
            actions={[
              {
                key: 'save',
                icon: <Check size={24} color={colors.text} />,
                onPress: handleSave,
              },
              {
                key: 'more',
                icon: <MoreVertical size={24} color={colors.text} />,
                active: activeModal === 'more',
                onPress: (e) => {
                  setPopoverPos(e.nativeEvent.pageY);
                  setActiveModal('more');
                },
              },
            ]}
          />

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
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
                    placeholderColor: colors.inactiveText,
                  }}
                />
              </View>
            </View>

            {/* Bottom Toolbar Box */}
            <EditorToolbar
              variant="diary"
              richTextRef={richText}
              activeActions={activeActions}
              onOpenTextColors={() => setActiveModal('colors')}
              onOpenBgColors={() => setActiveModal('bgColors')}
              onPickImage={handlePickImage}
              onOpenLink={() => setActiveModal('link')}
            />
          </KeyboardAvoidingView>
      </View>

      {/* Popover overlay */}
      <EditorPopover
        visible={activeModal === 'more'}
        popoverPos={popoverPos}
        wordCount={wordCount}
        type="diary"
        onClose={() => setActiveModal(null)}
        onRename={() => {
          setActiveModal(null);
          setRenameModalVisible(true);
        }}
      />

      <ColorPickerModal
        visible={activeModal === 'colors' || activeModal === 'bgColors'}
        title={activeModal === 'bgColors' ? '選擇背景顏色' : '選擇字體顏色'}
        onClose={() => setActiveModal(null)}
        onSelectColor={(color) => {
          if (activeModal === 'colors') {
            richText.current?.sendAction('foreColor', 'result', color);
          } else if (activeModal === 'bgColors') {
            richText.current?.sendAction('hiliteColor', 'result', color);
          }
        }}
      />

      {/* Link Modal */}
      <LinkModal
        visible={activeModal === 'link'}
        onClose={() => setActiveModal(null)}
        onInsert={handleInsertLink}
      />

      {/* Rename Modal */}
      <RenameModal
        visible={isRenameModalVisible}
        initialTitle={fileData?.title}
        onClose={() => setRenameModalVisible(false)}
        onConfirm={handleRenameConfirm}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
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
    backgroundColor: colors.recentSection,
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
    backgroundColor: colors.tertiary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dragPill: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolIcon: {
    padding: 8,
    marginHorizontal: 6,
  },
  popoverContainer: {
    position: 'absolute',
    right: 20,
    width: 170,
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    elevation: 6,
  },
  popoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
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
  linkBigCard: {
    padding: 10,
    width: '80%',
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkModalCard: {
    // width: '80%',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // elevation: 8,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.tertiary,
    alignItems: 'center',
  },
  linkBtnOk: {
    flex: 1,
    marginLeft: 8,
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  linkBtnTextC: {
    fontSize: 16,
    fontWeight: 'bold',
    // color: colors.text,
  },
  linkBtnTextS: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.errow,
  },
  renameInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: colors.text,
  },
  renameBtnConfirm: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FDF1E8',
    alignItems: 'center',
  },
  renameBtnCancel: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FCF8E8',
    alignItems: 'center',
  },
  renameBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  errorText: {
    color: colors.errow,
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
});
