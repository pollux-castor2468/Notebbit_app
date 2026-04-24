import React, { useState, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { ChevronLeft, Check, MoreVertical, Sun, Cloud, CloudLightning, CloudRain, Wind, Smile, Meh, Frown, Bold, Underline, Baseline, PaintBucket, Image as ImageIcon, Link, ChevronRight, X as XIcon } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { RichEditor, actions } from 'react-native-pell-rich-editor';
import { useStyles } from '../../styles';
import { useFileStore } from '../../store/useFileStore';

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
  const [linkError, setLinkError] = useState('');

  // Hex Color Input State
  const [isHexMode, setIsHexMode] = useState(false);
  const [hexInput, setHexInput] = useState('');
  const [hexError, setHexError] = useState('');

  // Rename Modal State
  const [isRenameModalVisible, setRenameModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState(fileData?.title || '');

  const stripHtmlTags = (html) => html ? String(html).replace(/<[^>]*>?/gm, '') : '';
  const wordCount = stripHtmlTags(content).replace(/\s/g, '').length || 0;

  React.useEffect(() => {
    if (id) {
      const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
      updateFile(id, { content, weather: selectedWeather, mood: selectedMood, date: formattedDate });
    }
  }, [content, selectedWeather, selectedMood, date, id, updateFile]);

  React.useEffect(() => {
    if (fileData?.title) {
      setNewTitle(fileData.title);
    }
  }, [fileData?.title]);

  const handleRenameConfirm = () => {
    if (id && newTitle.trim() !== '') {
      updateFile(id, { title: newTitle.trim() });
    }
    setRenameModalVisible(false);
  };

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
    setIsHexMode(false);
    setHexInput('');
    setHexError('');
  };

  const handleApplyHex = () => {
    const trimmedHex = hexInput.trim();
    if (!trimmedHex) {
      setHexError('請輸入格式。');
      return;
    }
    const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    if (!hexPattern.test(trimmedHex)) {
      setHexError('格式錯誤。請輸入例如 #FF0000');
      return;
    }
    handleSelectColor(trimmedHex);
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

  const handleInsertLink = () => {
    const trimmedUrl = linkUrl.trim();
    if (!trimmedUrl) {
      setLinkError('網址不能為空');
      return;
    }
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(trimmedUrl)) {
      setLinkError('請輸入有效的網址 (例如 https://...)');
      return;
    }

    richText.current?.insertLink(linkTitle.trim() || trimmedUrl, trimmedUrl);
    setLinkUrl('');
    setLinkTitle('');
    setLinkError('');
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
      <TouchableWithoutFeedback onPress={handleDismissKeyboard} accessible={false}>
        <View style={{ flex: 1 }}>
          {/* Top Header */}
          <View style={styles.header}>
            <View style={[layoutStyles.rowCenter, { flex: 1, marginRight: 16 }]}>
              <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
                <ChevronLeft size={28} color={colors.text} />
              </Pressable>
              <TextInput
                style={[styles.headerTitle, { flex: 1, padding: 0 }]}
                value={fileData?.title || ''}
                placeholder="未命名日記"
                placeholderTextColor="#999"
                onChangeText={(text) => {
                  if (id) {
                    updateFile(id, { title: text });
                    setNewTitle(text);
                  }
                }}
              />
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
        </View>
      </TouchableWithoutFeedback>

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
                <Pressable style={styles.popoverBtn} onPress={() => {
                  setRenameModalVisible(true);
                }}>
                  <Text style={styles.popoverText}>重新命名日記</Text>
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
        onRequestClose={() => {
          setActiveModal(null);
          setIsHexMode(false);
          setHexError('');
        }}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => { setActiveModal(null); setIsHexMode(false); setHexError(''); }}>
          <Pressable style={styles.colorSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.colorHeader}>
              <Text style={styles.colorTitle}>{isHexMode ? '輸入 Hex 色碼' : 'Colors'}</Text>
              <Pressable style={styles.closeBtn} onPress={() => { setActiveModal(null); setIsHexMode(false); setHexError(''); }}>
                <XIcon size={24} color="#666" />
              </Pressable>
            </View>

            {isHexMode ? (
              <View style={styles.hexInputContainer}>
                <TextInput
                  style={styles.linkInput}
                  placeholder="#000000"
                  placeholderTextColor="#999"
                  value={hexInput}
                  onChangeText={setHexInput}
                  autoCapitalize="characters"
                />
                {hexError ? <Text style={styles.errorText}>{hexError}</Text> : null}
                <View style={layoutStyles.rowCenter}>
                  <Pressable style={styles.renameBtnConfirm} onPress={handleApplyHex}>
                    <Text style={styles.renameBtnText}>確認</Text>
                  </Pressable>
                  <Pressable style={styles.renameBtnCancel} onPress={() => { setIsHexMode(false); setHexInput(''); setHexError(''); }}>
                    <Text style={styles.renameBtnText}>返回</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
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
                          <TouchableOpacity key="plus" style={styles.plusColorBtn} onPress={() => setIsHexMode(true)}>
                            <Text style={styles.plusColorText}>+</Text>
                          </TouchableOpacity>
                        )
                      ))}
                    </View>
                  ))}
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Link Modal */}
      <Modal
        visible={activeModal === 'link'}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { setActiveModal(null); setLinkError(''); }}
      >
        <Pressable style={styles.modalBackdropCenter} onPress={() => { setActiveModal(null); setLinkError(''); }}>
          <View style={styles.linkBigCard}>
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
                style={[styles.linkInput, linkError ? { borderColor: colors.errow } : null]}
                placeholder="請輸入網址 https://..."
                placeholderTextColor="#999"
                value={linkUrl}
                onChangeText={(text) => {
                  setLinkUrl(text);
                  setLinkError(''); // reset error dynamically
                }}
                autoCapitalize="none"
                keyboardType="url"
              />
              {linkError ? <Text style={styles.errorText}>{linkError}</Text> : null}
              <View style={layoutStyles.rowCenter}>
                <Pressable style={styles.linkBtnCancel} onPress={() => { setActiveModal(null); setLinkError(''); }}>
                  <Text style={styles.linkBtnTextC}>取消</Text>
                </Pressable>
                <Pressable style={styles.linkBtnOk} onPress={handleInsertLink}>
                  <Text style={styles.linkBtnTextS}>確定</Text>
                </Pressable>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Rename Modal */}
      <Modal
        visible={isRenameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <Pressable style={styles.modalBackdropCenter} onPress={() => setRenameModalVisible(false)}>
          <View style={styles.linkBigCard}>
            <Pressable style={styles.linkModalCard} onPress={e => e.stopPropagation()}>
              <Text style={styles.colorTitle}>重新命名</Text>
              <TextInput
                style={styles.renameInput}
                placeholder="輸入文字..."
                placeholderTextColor="#999"
                value={newTitle}
                onChangeText={setNewTitle}
                autoFocus={true}
              />
              <View style={layoutStyles.rowCenter}>
                <Pressable style={styles.renameBtnConfirm} onPress={() => {
                  handleRenameConfirm();
                  setActiveModal(null);
                }}>
                  <Text style={styles.renameBtnText}>確認</Text>
                </Pressable>
                <Pressable style={styles.renameBtnCancel} onPress={() => {
                  setRenameModalVisible(false);
                  setActiveModal(null);
                }}>
                  <Text style={styles.renameBtnText}>取消</Text>
                </Pressable>
              </View>
            </Pressable>
          </View>
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
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 6 },
    // shadowOpacity: 0.12,
    // shadowRadius: 10,
    elevation: 6,
  },
  popoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
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
  hexInputContainer: {
    // padding added dynamically if needed
  },
  errorText: {
    color: colors.errow,
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
});
