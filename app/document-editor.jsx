import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Edit2, Clock, Star, MoreVertical, ChevronDown, Bold, Italic, Underline, Baseline, X, Plus, ChevronRight, Highlighter, Trash2, PaintBucket, Image as ImageIcon, Link, X as XIcon } from 'lucide-react-native';
import { RichEditor, actions } from 'react-native-pell-rich-editor';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '../constants/token';
import { layoutStyles, textStyles } from '../styles';

// Helper for the custom red floating delete badge (used in version control)
const CardDeleteBadge = ({ onPress }) => (
  <Pressable style={styles.cardDeleteBadgeWrapper} onPress={onPress}>
    <View style={styles.cardDeleteBadge}>
       <X size={12} color="#FFF" />
    </View>
  </Pressable>
);

export default function DocumentEditor() {
  const params = useLocalSearchParams();
  const { title } = params;

  // --- States ---
  const [content, setContent] = useState('');
  const richText = useRef(null);
  const wordCount = content.replace(/<[^>]*>?/gm, '').replace(/\s/g, '').length || 7; // Basic HTML stripping for wordCount

  // Modals state: 'version' | 'source' | 'more' | 'colors' | 'bgColors' | 'link' | null
  const [activeModal, setActiveModal] = useState(null); 
  const [popoverPos, setPopoverPos] = useState(0);
  const [popoverState, setPopoverState] = useState('menu');

  // Title processing (strictly 7 characters maximum)
  const trimmedTitle = title ? (title.length > 7 ? title.slice(0, 7) + '...' : title) : '文件名稱';

  // Link Modal
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');

  // Data Source System
  const [sources, setSources] = useState([{ id: 1, text: '' }]);
  // Formatting tracking
  const [currentFont, setCurrentFont] = useState('Arial');
  const [currentSize, setCurrentSize] = useState('14');

  const fontFamilies = ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana'];
  const fontSizes = [
    { label: '12', value: 2 },
    { label: '14', value: 3 },
    { label: '16', value: 4 },
    { label: '18', value: 5 },
    { label: '24', value: 6 },
    { label: '36', value: 7 },
  ];
  // --- Data & Constants ---
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

  // --- Handlers ---
  const handleSetFontFamily = (font) => {
    setCurrentFont(font);
    richText.current?.sendAction('fontName', 'result', font);
    setActiveModal(null);
  };

  const handleSetFontSize = (sizeObj) => {
    setCurrentSize(sizeObj.label);
    richText.current?.sendAction('fontSize', 'result', sizeObj.value);
    setActiveModal(null);
  };

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

  // Data Source Handlers
  const handleAddSource = () => {
    const newId = sources.length > 0 ? Math.max(...sources.map(s => s.id)) + 1 : 1;
    setSources([...sources, { id: newId, text: '' }]);
  };

  const handleUpdateSource = (id, text) => {
    setSources(sources.map(s => s.id === id ? { ...s, text } : s));
  };

  const confirmDeleteSource = (id) => {
    Alert.alert(
      "刪除資料",
      "確定要刪除這筆資料來源嗎？",
      [
        { text: "取消", style: "cancel" },
        { text: "確認", style: "destructive", onPress: () => setSources(sources.filter(s => s.id !== id)) }
      ]
    );
  };

  const handleHighlightParagraph = () => {
    // Prototyping "Highlighting Paragraph" behavior
    richText.current?.sendAction('hiliteColor', 'result', '#FEF08A'); // yellow highlight
  };

  return (
    <SafeAreaView style={layoutStyles.root}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={[layoutStyles.rowCenter, { flex: 1, marginRight: 8 }]}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 8 }}>
            <ChevronLeft size={28} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { flex: 1 }]} numberOfLines={1}>
            {trimmedTitle}
          </Text>
        </View>
        <View style={layoutStyles.rowCenter}>
          <Pressable style={styles.iconButton} onPress={() => setActiveModal('source')}>
            <Edit2 size={24} color={colors.text} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => setActiveModal('version')}>
            <Clock size={24} color={colors.text} />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Star size={24} color={colors.text} />
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
            <View style={[styles.bodyInput, { overflow: 'hidden' }]}>
              {Platform.OS === 'web' ? (
                <TextInput
                  style={[textStyles.body, { flex: 1, outline: 'none' }]}
                  placeholder="網頁版編輯器尚在測試中，請先使用純文字..."
                  placeholderTextColor={'rgba(101, 68, 69, 0.4)'}
                  multiline
                  textAlignVertical="top"
                  value={content}
                  onChangeText={setContent}
                />
              ) : (
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
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>

        {/* Bottom Format Toolbar Box (Floating) */}
        <View style={styles.bottomToolbar}>
          <View style={styles.dragPill} />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarRow}>
            {/* Font Selectors */}
            <View style={styles.dropdownGroup}>
              <Pressable style={styles.dropdownContainer} onPress={() => setActiveModal('fontFamily')}>
                <Text style={styles.dropdownText}>{currentFont}</Text>
                <ChevronDown size={16} color={colors.text} style={{ marginLeft: 16 }} />
              </Pressable>
              <Pressable style={styles.dropdownContainer} onPress={() => setActiveModal('fontSize')}>
                <Text style={styles.dropdownText}>{currentSize}</Text>
                <ChevronDown size={16} color={colors.text} style={{ marginLeft: 8 }} />
              </Pressable>
            </View>

            {/* Action Icons */}
            <View style={styles.actionGroup}>
              <Pressable style={styles.toolIcon} onPress={() => richText.current?.sendAction(actions.setBold, 'result')}><Bold size={20} color={colors.text} /></Pressable>
              <Pressable style={styles.toolIcon} onPress={() => richText.current?.sendAction(actions.setItalic, 'result')}><Italic size={20} color={colors.text} /></Pressable>
              <Pressable style={styles.toolIcon} onPress={() => richText.current?.sendAction(actions.setUnderline, 'result')}><Underline size={20} color={colors.text} /></Pressable>
              <Pressable style={styles.toolIcon} onPress={() => setActiveModal('colors')}><Baseline size={20} color={colors.text} /></Pressable>
              <Pressable style={styles.toolIcon} onPress={() => setActiveModal('bgColors')}><PaintBucket size={20} color={colors.text} /></Pressable>
              <Pressable style={styles.toolIcon} onPress={handlePickImage}><ImageIcon size={20} color={colors.text} /></Pressable>
              <Pressable style={styles.toolIcon} onPress={() => setActiveModal('link')}><Link size={20} color={colors.text} /></Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* --- OVERLAY MODALS --- */}

      {/* 1. Version Control Bottom Sheet */}
      <Modal visible={activeModal === 'version'} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.bottomSheetOverlay}>
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
                   <CardDeleteBadge />
                   <Text style={[styles.cardText, { flex: 1.2 }]}>版本5</Text>
                   <Text style={[styles.cardText, { flex: 2, fontWeight: '700' }]}>版本名稱</Text>
                   <Text style={[styles.cardText, { flex: 1.5, textAlign: 'right' }]}>2026.04.04</Text>
                </View>
                <View style={styles.sheetCard}>
                   <CardDeleteBadge />
                   <Text style={[styles.cardText, { flex: 1.2 }]}>版本4</Text>
                   <Text style={[styles.cardText, { flex: 2, fontWeight: '700' }]}>版本名稱</Text>
                   <Text style={[styles.cardText, { flex: 1.5, textAlign: 'right' }]}>2026.04.04</Text>
                </View>
              </ScrollView>
           </View>
        </View>
      </Modal>

      {/* 2. Data Sources Bottom Sheet */}
      <Modal visible={activeModal === 'source'} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.bottomSheetOverlay}>
           <Pressable style={StyleSheet.absoluteFill} onPress={() => setActiveModal(null)} />
           <View style={styles.bottomSheetContainer}>
              <View style={styles.sheetDragPill} />
              
              <View style={styles.sheetHeaderRow}>
                 <Text style={styles.sheetTitle}>資料來源</Text>
                 <View style={layoutStyles.rowCenter}>
                    <Pressable style={styles.bluePlusBtn} onPress={handleAddSource}><Plus size={20} color={colors.text} /></Pressable>
                    <Pressable style={styles.closeBtn} onPress={() => setActiveModal(null)}><X size={24} color={colors.text} /></Pressable>
                 </View>
              </View>

              <View style={styles.sheetSubheadPill}>
                <Text style={styles.subheadTextDesc}>標題欄：用來介紹下面的資料文字或按鈕代表的意思</Text>
              </View>

              <ScrollView style={{ flex: 1, marginTop: 8 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                {sources.map((source, index) => (
                  <View key={source.id} style={styles.sourceCardRow}>
                    <Text style={styles.sourceIndex}>{index + 1}</Text>
                    <TextInput
                      style={styles.sourceInput}
                      placeholder="輸入資料內容..."
                      value={source.text}
                      onChangeText={(t) => handleUpdateSource(source.id, t)}
                    />
                    <Pressable style={styles.sourceActionBtn} onPress={handleHighlightParagraph}>
                      <Highlighter size={20} color={colors.primary} />
                    </Pressable>
                    <Pressable style={styles.sourceActionBtn} onPress={() => confirmDeleteSource(source.id)}>
                      <Trash2 size={20} color="#FF3B30" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
           </View>
        </View>
      </Modal>

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
                <Pressable style={[styles.popoverBtn, { marginBottom: 0 }]} onPress={() => setActiveModal(null)}>
                  <Text style={styles.popoverText}>重新命名文件</Text>
                </Pressable>
              </>
            ) : (
              <View style={[styles.popoverBtn, { marginBottom: 0, justifyContent: 'center', paddingVertical: 32 }]}>
                <Text style={[styles.popoverText, { fontSize: 18 }]}>
                  共    <Text style={{color: '#9CA3AF'}}>{wordCount}</Text>    字
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      )}

      {/* 4. Colors Modal */}
      <Modal visible={activeModal === 'colors' || activeModal === 'bgColors'} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <Pressable style={styles.modalBackdropColor} onPress={() => setActiveModal(null)}>
          <Pressable style={styles.colorSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.colorHeader}>
              <Text style={styles.colorTitle}>Colors</Text>
              <Pressable style={styles.closeBtn} onPress={() => setActiveModal(null)}>
                <XIcon size={24} color="#666" />
              </Pressable>
            </View>

            {/* Grid Colors */}
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

            {/* Circle Colors */}
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

      {/* 5. Link Modal */}
      <Modal visible={activeModal === 'link'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
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

      {/* 6. Font Family Modal */}
      <Modal visible={activeModal === 'fontFamily'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <Pressable style={styles.modalBackdropCenter} onPress={() => setActiveModal(null)}>
          <Pressable style={styles.fontModalCard} onPress={e => e.stopPropagation()}>
            <Text style={[styles.colorTitle, { marginBottom: 16 }]}>選擇字體</Text>
            {fontFamilies.map((font) => (
              <Pressable 
                key={font} 
                style={[styles.fontOptionBtn, currentFont === font && styles.fontOptionActive]} 
                onPress={() => handleSetFontFamily(font)}
              >
                <Text style={[styles.fontOptionText, { fontFamily: Platform.OS === 'web' ? font : undefined }]}>{font}</Text>
                {currentFont === font && <ChevronLeft size={20} color={colors.primary || '#666'} style={{ transform: [{ rotate: '180deg' }] }} />}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* 7. Font Size Modal */}
      <Modal visible={activeModal === 'fontSize'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <Pressable style={styles.modalBackdropCenter} onPress={() => setActiveModal(null)}>
          <Pressable style={styles.fontModalCard} onPress={e => e.stopPropagation()}>
            <Text style={[styles.colorTitle, { marginBottom: 16 }]}>選擇字型大小</Text>
            {fontSizes.map((size) => (
              <Pressable 
                key={size.label} 
                style={[styles.fontOptionBtn, currentSize === size.label && styles.fontOptionActive]} 
                onPress={() => handleSetFontSize(size)}
              >
                <Text style={styles.fontOptionText}>{size.label}</Text>
                {currentSize === size.label && <ChevronLeft size={20} color={colors.primary || '#666'} style={{ transform: [{ rotate: '180deg' }] }} />}
              </Pressable>
            ))}
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
    marginLeft: 6,
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
    paddingBottom: 80, 
  },
  bodyInput: {
    padding: 0,
    margin: 0,
    flex: 1,
  },
  bottomToolbar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width:0, height:4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  dragPill: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownGroup: {
    flexDirection: 'row',
    marginRight: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  dropdownText: {
    fontSize: 16,
    color: colors.text,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toolIcon: {
    padding: 10,
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '80%',
  },
  sheetDragPill: {
    width: 100,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeBtn: {
    backgroundColor: '#EBEBEB',
    padding: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  bluePlusBtn: {
    backgroundColor: '#D6E4FF',
    padding: 8,
    borderRadius: 20,
  },
  sheetSubheadPill: {
    flexDirection: 'row',
    backgroundColor: '#EBEBEB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  subheadText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  subheadTextDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    flex: 1,
  },
  sheetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    position: 'relative',
  },
  cardDeleteBadgeWrapper: {
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 10,
    padding: 8,
  },
  cardDeleteBadge: {
    backgroundColor: '#FF3B30',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    color: colors.text,
  },
  popoverContainer: {
    position: 'absolute',
    right: 20,
    minWidth: 150,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width:0, height:4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  popoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 8,
  },
  popoverText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  // Data Source specific row
  sourceCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sourceIndex: {
    flex: 0.5,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary || '#666',
  },
  sourceInput: {
    flex: 3,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 8,
  },
  sourceActionBtn: {
    flex: 0.8,
    alignItems: 'center',
    padding: 8,
  },
  // Colors Modal
  modalBackdropColor: {
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
  // Link Modal
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
  
  // --- Font Selection Modals Styles ---
  fontModalCard: {
    width: '70%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  fontOptionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  fontOptionActive: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  fontOptionText: {
    fontSize: 18,
    color: colors.text,
  },
});
