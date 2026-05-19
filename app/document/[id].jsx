import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, Modal, ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { Edit2, Clock, Star, MoreVertical, X, Plus, ChevronRight } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { RichEditor, actions } from 'react-native-pell-rich-editor';
import { useStyles } from '../../styles';
import { useFileStore } from '../../store/useFileStore';
import { useFileActions } from '../../hooks/useFileActions';
import EditorHeader from '../../components/editor/EditorHeader';
import EditorToolbar from '../../components/editor/EditorToolbar';
import ColorPickerModal from '../../components/editor/ColorPickerModal';
import LinkModal from '../../components/editor/LinkModal';
import RenameModal from '../../components/editor/RenameModal';
import TagModal from '../../components/editor/TagModal';
import EditorPopover from '../../components/editor/EditorPopover';
import VersionSheet from '../../components/editor/VersionSheet';
import DataSourceSheet from '../../components/editor/DataSourceSheet';

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
  const { updateFile, toggleStar, addSource } = useFileActions();

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'version' | 'source' | 'more' | null
  const [popoverPos, setPopoverPos] = useState(0);
  const [autoEditSourceId, setAutoEditSourceId] = useState(null);


  // Content state for Word Count
  const [content, setContent] = useState(fileData?.content || '');
  const richText = React.useRef(null);
  const [activeActions, setActiveActions] = useState([]);

  const savedSelection = React.useRef({ text: '' });
  const [isRenameModalVisible, setRenameModalVisible] = useState(false);
  const [isTagModalVisible, setTagModalVisible] = useState(false);
  const [showReferences, setShowReferences] = useState(false);

  const stripHtmlTags = (html) => html ? String(html).replace(/<[^>]*>?/gm, '') : '';
  const wordCount = stripHtmlTags(content).replace(/\s/g, '').length || 0;

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

  React.useEffect(() => {
    if (!richText.current) return;
    
    // Inject selectionchange listener
    richText.current?.injectJavascript(`
      document.addEventListener("selectionchange", function() {
        var text = window.getSelection().toString();
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECTION_CHANGE', text: text }));
      });
      true;
    `);

    const js = showReferences ? `
      (function() {
        document.querySelectorAll('.ref-highlight').forEach(el => {
          const parent = el.parentNode;
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
        });
        const sources = ${JSON.stringify(fileData?.source || [])};
        sources.forEach(s => {
          if (!s.markedText) return;
          const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
          let n;
          const nodes = [];
          while(n = walk.nextNode()) {
            if (n.nodeValue.includes(s.markedText)) nodes.push(n);
          }
          nodes.forEach(node => {
            const span = document.createElement('span');
            span.innerHTML = node.nodeValue.split(s.markedText).join('<span class="ref-highlight" style="border-bottom: 2px dotted gray;" data-source-id="'+s.sourceId+'">'+s.markedText+'</span>');
            node.parentNode.replaceChild(span, node);
          });
        });
        document.querySelectorAll('.ref-highlight').forEach(el => {
          el.onclick = function(e) {
            e.stopPropagation();
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SOURCE_CLICK', id: this.getAttribute('data-source-id') }));
          };
        });
        true;
      })();
    ` : `
      (function() {
        document.querySelectorAll('.ref-highlight').forEach(el => {
          const parent = el.parentNode;
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
        });
        true;
      })();
    `;
    richText.current?.injectJavascript?.(js);
  }, [showReferences, fileData?.source]);

  const handleRenameConfirm = (updatedTitle) => {
    if (id && updatedTitle.trim() !== '') {
      updateFile(id, { title: updatedTitle.trim() });
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

  const handleInsertLink = (title, url) => {
    richText.current?.insertLink(title, url);
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
              }
            }}
            actions={[
              {
                key: 'reference_toggle',
                customComponent: (
                  <Pressable 
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: showReferences ? colors.recentSection : 'transparent',
                      justifyContent: 'center',
                      paddingHorizontal: 2,
                    }}
                    onPress={() => setShowReferences(!showReferences)}
                  >
                    <View style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      backgroundColor: showReferences ? colors.text : colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: [{ translateX: showReferences ? 20 : 0 }],
                      borderWidth: 1,
                      borderColor: showReferences ? colors.text : colors.border,
                    }}>
                      {!showReferences && <X size={12} color={colors.inactiveText} />}
                    </View>
                  </Pressable>
                ),
              },
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
                onMessage={(message) => {
                  if (message && message.type === 'SELECTION_CHANGE') {
                    savedSelection.current.text = message.text;
                  }
                  if (message && message.type === 'SOURCE_CLICK') {
                    setActiveModal('source');
                  }
                  if (message && message.type === 'ADD_SOURCE_SELECTION') {
                    const text = message.text;
                    if (text && text.trim().length > 0) {
                      const newId = addSource(id, text.trim());
                      setAutoEditSourceId(newId);
                    }
                    setActiveModal('source');
                  }
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
              onAddSource={() => {
                const text = savedSelection.current.text;
                if (text && text.trim().length > 0) {
                  const newId = addSource(id, text.trim());
                  // 根據您的需求，透過 insertHTML 插入包覆後的 HTML
                  const htmlTag = \`<span class="ref-highlight" data-source-id="\${newId}" style="background-color: #ffe0b2; border-bottom: 2px solid #fb8c00;">\${text}</span>\`;
                  richText.current?.insertHTML(htmlTag);
                  
                  setAutoEditSourceId(newId);
                }
                setActiveModal('source');
              }}
            />
          </KeyboardAvoidingView>
      </View>

      {/* --- OVERLAY MODALS --- */}

      {/* 1. Version Control Bottom Sheet */}
      <VersionSheet
        visible={activeModal === 'version'}
        fileId={id}
        onClose={() => setActiveModal(null)}
      />

      {/* 2. Data Sources Bottom Sheet */}
      <DataSourceSheet
        visible={activeModal === 'source'}
        fileId={id}
        autoEditSourceId={autoEditSourceId}
        onClearAutoEdit={() => setAutoEditSourceId(null)}
        onClose={() => { setActiveModal(null); setAutoEditSourceId(null); }}
      />

      {/* 3. More Options Popover overlay */}
      <EditorPopover
        visible={activeModal === 'more'}
        popoverPos={popoverPos}
        wordCount={wordCount}
        type="document"
        isStarred={fileData?.starred}
        onToggleStar={() => {
          if (fileData) toggleStar(id);
          setActiveModal(null);
        }}
        onClose={() => setActiveModal(null)}
        onRename={() => {
          setActiveModal(null);
          setRenameModalVisible(true);
        }}
        onSetTags={() => {
          setActiveModal(null);
          setTagModalVisible(true);
        }}
      />

      {/* 4. Rename Dialog Modal (Added from requirement) */}
      <RenameModal
        visible={isRenameModalVisible}
        initialTitle={fileData?.title}
        onClose={() => setRenameModalVisible(false)}
        onConfirm={handleRenameConfirm}
      />

      {/* 5. Tag Modal */}
      <TagModal
        visible={isTagModalVisible}
        fileId={id}
        onClose={() => setTagModalVisible(false)}
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

      {/* 6. Link Modal */}
      <LinkModal
        visible={activeModal === 'link'}
        onClose={() => setActiveModal(null)}
        onInsert={handleInsertLink}
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
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
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
