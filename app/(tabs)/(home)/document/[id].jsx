import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { ChevronLeft, Edit2, Clock, Star, MoreVertical, ChevronDown, Bold, Italic, Underline, Baseline, X, Plus, ChevronRight } from 'lucide-react-native';
import { colors } from '../../../../constants/token';
import { layoutStyles, textStyles } from '../../../../styles';
import { useFileStore } from '../../../../store/useFileStore';

// Helper for the custom red floating delete button on modal cards
const CardDeleteBadge = ({ onPress }) => (
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
  const [activeModal, setActiveModal] = useState(null); // 'version' | 'source' | 'more' | null
  const [popoverPos, setPopoverPos] = useState(0);
  const [popoverState, setPopoverState] = useState('menu'); // 'menu' | 'wordCount'

  // Content state for Word Count
  const [content, setContent] = useState(fileData?.content || '');
  const wordCount = content.replace(/\s/g, '').length || 7;

  React.useEffect(() => {
    if (id) {
      updateFile(id, { content });
    }
  }, [content, id, updateFile]);

  return (
    <SafeAreaView style={layoutStyles.root}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={[layoutStyles.rowCenter, { flex: 1, marginRight: 16 }]}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
            <ChevronLeft size={28} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
            {fileData?.title || '文件名稱'}
          </Text>
        </View>
        <View style={layoutStyles.rowCenter}>
          <Pressable style={styles.iconButton} onPress={() => setActiveModal('source')}>
            <Edit2 size={24} color={colors.text} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => setActiveModal('version')}>
            <Clock size={24} color={colors.text} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => fileData && toggleStar(id)}>
            <Star size={24} color={colors.text} fill={fileData?.starred ? colors.text : 'transparent'} />
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
        {/* Content Area */}
        <View style={styles.content}>
          <TextInput
            style={[textStyles.body, styles.bodyInput]}
            placeholder="輸入內容..."
            placeholderTextColor={'rgba(101, 68, 69, 0.4)'}
            multiline
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
          />
        </View>

        {/* Bottom Format Toolbar Box (Floating) */}
        <View style={styles.bottomToolbar}>
          <View style={styles.dragPill} />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarRow}>
            {/* Font Selectors */}
            <View style={styles.dropdownGroup}>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownText}>Arial</Text>
                <ChevronDown size={16} color={colors.text} style={{ marginLeft: 16 }} />
              </View>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownText}>14</Text>
                <ChevronDown size={16} color={colors.text} style={{ marginLeft: 8 }} />
              </View>
            </View>

            {/* Action Icons */}
            <View style={styles.actionGroup}>
              <Pressable style={styles.toolIcon}><Bold size={20} color={colors.text} /></Pressable>
              <Pressable style={styles.toolIcon}><Italic size={20} color={colors.text} /></Pressable>
              <Pressable style={styles.toolIcon}><Underline size={20} color={colors.text} /></Pressable>
              <Pressable style={styles.toolIcon}><Baseline size={20} color={colors.text} /></Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

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
      {activeModal === 'source' && (
        <View style={[styles.bottomSheetOverlay, { position: 'absolute', bottom: 0, width: '100%', height: '50%', backgroundColor: 'transparent', zIndex: 50 }]} pointerEvents="box-none">
           <View style={[styles.bottomSheetContainer, { flex: 1, shadowColor: '#000', shadowOffset: { width:0, height:-2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 15 }]}>
              <View style={styles.sheetDragPill} />
              
              <View style={styles.sheetHeaderRow}>
                 <Text style={styles.sheetTitle}>資料來源</Text>
                 <Pressable style={styles.closeBtn} onPress={() => setActiveModal(null)}><X size={24} color={colors.text} /></Pressable>
              </View>

              <View style={styles.sheetSubheadPill}>
                <Text style={[styles.subheadText, { flex: 0.8 }]}>編號</Text>
                <Text style={[styles.subheadText, { flex: 3 }]}>資料內容</Text>
                <Text style={[styles.subheadText, { flex: 1.5, textAlign: 'right' }]}>標記段落</Text>
              </View>

              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <View style={[styles.sheetCard, { paddingVertical: 18 }]}>
                   <CardDeleteBadge />
                   <Text style={[styles.cardText, { flex: 0.8 }]}>1</Text>
                   <Text style={[styles.cardText, { flex: 3 }]}>資料內容...</Text>
                   <View style={{ flex: 1.5, alignItems: 'flex-end', paddingRight: 8 }}>
                     <Edit2 size={18} color={colors.text} />
                   </View>
                </View>
                <View style={[styles.sheetCard, { paddingVertical: 18 }]}>
                   <CardDeleteBadge />
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
  bodyInput: {
    flex: 1,
    lineHeight: 28,
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
  dropdownGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    backgroundColor: '#AEAEAE',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
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
    backgroundColor: '#BCE0F3',
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
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  subheadText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  sheetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
});
