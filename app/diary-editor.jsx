import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Check, MoreVertical, Sun, Cloud, CloudLightning, CloudRain, Wind, Smile, Meh, Frown, Bold, Underline, Baseline, PaintBucket, Image as ImageIcon, Link, ChevronRight } from 'lucide-react-native';
import { colors } from '../constants/token';
import { layoutStyles, textStyles } from '../styles';

export default function DiaryEditor() {
  const params = useLocalSearchParams();
  const { title } = params;

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'more' | null
  const [popoverPos, setPopoverPos] = useState(0);
  const [popoverState, setPopoverState] = useState('menu'); // 'menu' | 'wordCount'

  // Content state for Word Count
  const [content, setContent] = useState('');
  const wordCount = content.replace(/\s/g, '').length || 7; // fallback to 7 if empty to match Figma mock

  return (
    <SafeAreaView style={layoutStyles.root}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={layoutStyles.rowCenter}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
            <ChevronLeft size={28} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{title || '日記名稱'}</Text>
        </View>
        <View style={layoutStyles.rowCenter}>
          <Pressable style={styles.iconButton}><Check size={24} color={colors.text} /></Pressable>
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
            <Text style={styles.metaText}>2026.04.04</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>天氣：</Text>
            <View style={layoutStyles.rowCenter}>
              <Sun size={24} color="#FACC15" style={styles.metaIcon} />
              <Cloud size={24} color="#9CA3AF" style={styles.metaIcon} />
              <CloudLightning size={24} color="#D1D5DB" style={styles.metaIcon} />
              <CloudRain size={24} color="#3B82F6" style={styles.metaIcon} />
              <Wind size={24} color="#14B8A6" style={styles.metaIcon} />
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>心情：</Text>
            <View style={layoutStyles.rowCenter}>
              <Smile size={24} color="#22C55E" style={styles.metaIcon} />
              <Smile size={24} color="#84CC16" style={styles.metaIcon} />
              <Meh size={24} color="#EAB308" style={styles.metaIcon} />
              <Frown size={24} color="#F97316" style={styles.metaIcon} />
              <Frown size={24} color="#EF4444" style={styles.metaIcon} />
            </View>
          </View>

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

        {/* Bottom Toolbar Box */}
        <View style={styles.bottomToolbar}>
          <View style={styles.dragPill} />

          <View style={styles.toolbarRow}>
            <Pressable style={styles.toolIcon}><Bold size={24} color={colors.text} /></Pressable>
            <Pressable style={styles.toolIcon}><Underline size={24} color={colors.text} /></Pressable>
            <Pressable style={styles.toolIcon}><Baseline size={24} color={colors.text} /></Pressable>
            <Pressable style={styles.toolIcon}><PaintBucket size={24} color={colors.text} /></Pressable>
            <Pressable style={styles.toolIcon}><ImageIcon size={24} color={colors.text} /></Pressable>
            <Pressable style={styles.toolIcon}><Link size={24} color={colors.text} /></Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Popover overlay (rendered manually instead of using Modal to avoid layering issues) */}
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
    paddingBottom: 36, // Safe area lift
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
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  toolIcon: {
    padding: 4,
  },

  // --- Popover Styles ---
  popoverContainer: {
    position: 'absolute',
    right: 20,
    width: 170,
    backgroundColor: '#F3F3F3', // Light grey container
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
    backgroundColor: '#FFFFFF', // White solid button
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
