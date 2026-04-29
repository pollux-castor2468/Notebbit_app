import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, Modal, ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { Edit2, Clock, Star, MoreVertical, X, Plus, ChevronRight } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { RichEditor, actions } from 'react-native-pell-rich-editor';
import { useStyles } from '../../styles';
import { useFileStore } from '../../store/useFileStore';
import EditorHeader from '../../components/editor/EditorHeader';
import EditorToolbar from '../../components/editor/EditorToolbar';
import ColorPickerModal from '../../components/editor/ColorPickerModal';

// Helper for the custom red floating delete button on modal cards
const CardDeleteBadge = ({ onPress, styles }) => (
  <Pressable
    style={styles.cardDeleteBadgeWrapper}
    onPress={onPress}
  >
    <View style={styles.cardDeleteBadge}>
      <X size={12} color="#FFF" />
    </View>
  </Pressable>
);

export default function DocumentEditor() {
  const { layoutStyles, textStyles, colors } = useStyles();
  const styles = getStyles(colors);
  const params = useLocalSearchParams();
  const { id } = params;
  const navigation = useNavigation();

  // TabBar patch removed


  //關於這份文件(找到文件?儲存文件、修改文件之類的都放這裡)
  const fileData = useFileStore(state => state.data.find(d => d.id === id));
  const updateFile = useFileStore(state => state.updateFile);
  const toggleStar = useFileStore(state => state.toggleStar);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'version' | 'source' | 'more' | null
  const [popoverPos, setPopoverPos] = useState(0);
  const [popoverState, setPopoverState] = useState('menu'); // 'menu' | 'wordCount'

  // Content state for Word Count
  const [content, setContent] = useState(fileData?.content || '');
  const richText = React.useRef(null);
  const [activeActions, setActiveActions] = useState([]);

  // Focus and Selection Tracking
  // const [iconColors, setIconColors] = useState({});

  // Link Modal State
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkError, setLinkError] = useState('');

  // Rename Modal State
  const [isRenameModalVisible, setRenameModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState(fileData?.title || '');

  const stripHtmlTags = (html) => html ? String(html).replace(/<[^>]*>?/gm, '') : '';
  const wordCount = stripHtmlTags(content).replace(/\s/g, '').length || 0;

  React.useEffect(() => {
    if (fileData?.title) {
      setNewTitle(fileData.title);
    }
  }, [fileData?.title]);

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

  const handleRenameConfirm = () => {
    if (id && newTitle.trim() !== '') {
      updateFile(id, { title: newTitle.trim() });
    }
    setRenameModalVisible(false);
  };

  const handleSave = () => {
    router.push('/(tabs)/(home)');
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

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
    richText.current?.blurContentEditor();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
          <EditorHeader
            title={fileData?.title || ''}
            placeholder="未命名文件"
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
                key: 'source',
                icon: <Edit2 size={24} color={colors.text} />,
                onPress: () => setActiveModal('source'),
              },
              {
                key: 'version',
                icon: <Clock size={24} color={colors.text} />,
                onPress: () => setActiveModal('version'),
              },
              {
                key: 'star',
                icon: <Star size={24} color={colors.text} fill={fileData?.starred ? colors.text : 'transparent'} />,
                onPress: () => fileData && toggleStar(id),
                disabled: !fileData,
              },
              {
                key: 'more',
                icon: <MoreVertical size={24} color={colors.text} />,
                active: activeModal === 'more',
                onPress: (e) => {
                  setPopoverPos(e.nativeEvent.pageY);
                  setPopoverState('menu');
                  setActiveModal('more');
                },
              },
            ]}
          />

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Content Area */}
            <View style={[styles.bodyInput, { overflow: 'hidden', paddingHorizontal: 24, paddingTop: 16 }]}>
              <RichEditor
                ref={richText}
                style={{ flex: 1 }}
                placeholder="輸入內容..."
                initialContentHTML={content}
                onChange={(html) => {
                  setContent(html);
                  if (id) updateFile(id, { content: html });
                }}
                editorStyle={{
                  backgroundColor: 'transparent',
                  color: colors.text,
                  placeholderColor: colors.inactiveText,
                }}
              />
            </View>

            {/* Bottom Format Toolbar Box (Floating) */}
            <EditorToolbar
              variant="document"
              richTextRef={richText}
              activeActions={activeActions}
              onOpenTextColors={() => setActiveModal('colors')}
              onOpenBgColors={() => setActiveModal('bgColors')}
              onPickImage={handlePickImage}
              onOpenLink={() => setActiveModal('link')}
            />
          </KeyboardAvoidingView>
      </View>

      {/* --- OVERLAY MODALS --- */}

      {/* 1. Version Control Bottom Sheet */}
      <Modal visible={activeModal === 'version'} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.bottomSheetOverlay}>
          {/* Invisible dismiss layer */}
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setActiveModal(null)} />

          <View style={styles.bottomSheetContainer}>
            <View style={styles.sheetDragPill} />

            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>版本控制</Text>
              <View style={layoutStyles.rowCenter}>
                <Pressable style={styles.bluePlusBtn}><Plus size={20} color={colors.text} /></Pressable>
                <Pressable style={styles.closeBtn} onPress={() => setActiveModal(null)}><X size={24} color={colors.text} /></Pressable>
              </View>
            </View>

            <View style={styles.sheetSubheadPill}>
              <Text style={[styles.subheadText, { flex: 1.2 }]}>編號</Text>
              <Text style={[styles.subheadText, { flex: 2 }]}>版本名稱</Text>
              <Text style={[styles.subheadText, { flex: 1.5, textAlign: 'right' }]}>儲存日期</Text>
            </View>

            <ScrollView style={{ flex: 1, marginTop: 8 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
              <View style={styles.sheetCard}>
                <CardDeleteBadge styles={styles} />
                <Text style={[styles.cardText, { flex: 1.2 }]}>版本5</Text>
                <Text style={[styles.cardText, { flex: 2, fontWeight: '700' }]}>版本名稱</Text>
                <Text style={[styles.cardText, { flex: 1.5, textAlign: 'right' }]}>2026.04.04</Text>
              </View>
              <View style={styles.sheetCard}>
                <CardDeleteBadge styles={styles} />
                <Text style={[styles.cardText, { flex: 1.2 }]}>版本4</Text>
                <Text style={[styles.cardText, { flex: 2, fontWeight: '700' }]}>版本名稱</Text>
                <Text style={[styles.cardText, { flex: 1.5, textAlign: 'right' }]}>2026.04.04</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. Data Sources Bottom Sheet */}
      {activeModal === 'source' && (
        <View style={[styles.bottomSheetOverlay, { position: 'absolute', bottom: 0, width: '100%', height: '50%', backgroundColor: 'transparent', zIndex: 50 }]} pointerEvents="box-none">
          <View style={[styles.bottomSheetContainer, { flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 15 }]}>
            <View style={styles.sheetDragPill} />

            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>資料來源</Text>
              <View style={layoutStyles.rowCenter}>
                <Pressable style={styles.bluePlusBtn}><Plus size={20} color={colors.text} /></Pressable>
                <Pressable style={styles.closeBtn} onPress={() => setActiveModal(null)}><X size={24} color={colors.text} /></Pressable>
              </View>
            </View>

            <View style={styles.sheetSubheadPill}>
              <Text style={[styles.subheadText, { flex: 0.8 }]}>編號</Text>
              <Text style={[styles.subheadText, { flex: 3 }]}>資料內容</Text>
              <Text style={[styles.subheadText, { flex: 1.5, textAlign: 'right' }]}>標記段落</Text>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={[styles.sheetCard, { paddingVertical: 18 }]}>
                <CardDeleteBadge styles={styles} />
                <Text style={[styles.cardText, { flex: 0.8 }]}>1</Text>
                <Text style={[styles.cardText, { flex: 3 }]}>資料內容...</Text>
                <View style={{ flex: 1.5, alignItems: 'flex-end', paddingRight: 8 }}>
                  <Edit2 size={18} color={colors.text} />
                </View>
              </View>
              <View style={[styles.sheetCard, { paddingVertical: 18 }]}>
                <CardDeleteBadge styles={styles} />
                <Text style={[styles.cardText, { flex: 0.8 }]}>2</Text>
                <Text style={[styles.cardText, { flex: 3 }]}>資料內容...</Text>
                <View style={{ flex: 1.5, alignItems: 'flex-end', paddingRight: 8 }}>
                  <Edit2 size={18} color={colors.text} />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* 3. More Options Popover overlay */}
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
                <Pressable
                  style={[styles.popoverBtn, { marginBottom: 0 }]}
                  onPress={() => {
                    setActiveModal(null);
                    setRenameModalVisible(true);
                  }}
                >
                  <Text style={styles.popoverText}>重新命名文件</Text>
                </Pressable>
              </>
            ) : (
              <View style={[styles.popoverBtn, { marginBottom: 0, justifyContent: 'center', paddingVertical: 32 }]}>
                <Text style={[styles.popoverText, { fontSize: 18 }]}>
                  共    <Text style={{ color: colors.inactiveText }}>{wordCount}</Text>    字
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      )}

      {/* 4. Rename Dialog Modal (Added from requirement) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isRenameModalVisible}
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={styles.renameOverlay}>
          <View style={styles.modalBigContent}>
            <View style={styles.renameContent}>
              <Text style={textStyles.h3}>重新命名</Text>
              <TextInput
                style={styles.renameInput}
                placeholder="輸入文字..."
                value={newTitle}
                onChangeText={setNewTitle}
                autoFocus
              />
              <View style={styles.renameActions}>
                <Pressable
                  style={styles.renameBtnSubmit}
                  onPress={() => {
                    handleRenameConfirm();
                    setActiveModal(null);
                  }}
                >
                  <Text style={styles.modalBtnTextC}>確認</Text>
                </Pressable>

                <Pressable
                  style={styles.renameBtnCancel}
                  onPress={() => {
                    setRenameModalVisible(false);
                    setActiveModal(null);
                  }}
                >
                  <Text style={styles.modalBtnTextC}>取消</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

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

      {/* 6. Link Modal */}
      <Modal visible={activeModal === 'link'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={layoutStyles.rowBetween}>
              <Text style={textStyles.h3}>插入連結</Text>
              <Pressable onPress={() => setActiveModal(null)} style={{ padding: 4 }}>
                <X size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={{ marginTop: 16 }}>
              <Text style={[textStyles.body, { marginBottom: 8 }]}>顯示文字 (選填)</Text>
              <TextInput
                style={styles.linkInput}
                placeholder="在此輸入顯示的文字..."
                value={linkTitle}
                onChangeText={setLinkTitle}
              />

              <Text style={[textStyles.body, { marginBottom: 8 }]}>網址連結 (必填)</Text>
              <TextInput
                style={styles.linkInput}
                placeholder="https://..."
                value={linkUrl}
                onChangeText={(text) => {
                  setLinkUrl(text);
                  setLinkError('');
                }}
                autoCapitalize="none"
              />
              {linkError ? <Text style={styles.errorText}>{linkError}</Text> : null}
            </View>

            <Pressable style={styles.saveBtn} onPress={handleInsertLink}>
              <Text style={styles.saveBtnText}>確定</Text>
            </Pressable>
          </View>
        </View>
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
  bodyInput: {
    flex: 1,
    lineHeight: 28,
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
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  dropdownText: {
    fontSize: 14,
    color: colors.text,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  toolIcon: {
    padding: 8,
    marginHorizontal: 6,
  },
  bottomSheetOverlay: {
    flex: 1,
    // backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: colors.recentSection,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetDragPill: {
    width: 100,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    // marginBottom: 20,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    // position: 'relative',
    // top: -20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  bluePlusBtn: {
    backgroundColor: colors.container,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  closeBtn: {
    padding: 4,
  },
  sheetSubheadPill: {
    flexDirection: 'row',
    backgroundColor: colors.recentHeader,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  subheadText: {
    fontSize: 14,
    color: colors.inactiveText,
    fontWeight: '600',
  },
  sheetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    color: colors.text,
  },
  cardDeleteBadgeWrapper: {
    position: 'absolute',
    top: -6,
    left: -6,
    padding: 6,
    zIndex: 10,
  },
  cardDeleteBadge: {
    backgroundColor: '#C1272D',
    width: 22,
    height: 22,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  renameOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  renameContent: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
  },
  renameInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  renameActions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  renameBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.tertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginRight: 8,
  },
  renameBtnSubmit: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalBtnTextC: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  colorGrid: {
    gap: 12,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorPlusBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
