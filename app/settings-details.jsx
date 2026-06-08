import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Moon, Calendar, Type, Keyboard, X, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { useStyles } from '../styles';
import { useSettingsStore } from '../store/useSettingsStore';

export default function SettingsDetailsScreen() {
  const { colors, textStyles, isDarkMode } = useStyles();
  const styles = getStyles(colors);
  const { toggleDarkMode, firstDayOfWeek, setFirstDayOfWeek, defaultFontSize, setDefaultFontSize } = useSettingsStore();

  const [modalType, setModalType] = useState(null); // 'day', 'fontSize', null

  const daysOptions = [
    { label: '周日', value: 'sunday' },
    { label: '周一', value: 'monday' },
  ];

  const fontOptions = ['16', '18', '24', '32', '48'];

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={28} color={colors.text} />
        </Pressable>
        <Text style={[textStyles.h2, { flex: 1, textAlign: 'center', marginRight: 28 }]}>更多設定</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          
          {/* Dark Mode Toggle */}
          <Pressable style={styles.rowItem} onPress={toggleDarkMode}>
            <View style={styles.rowLeft}>
              <Moon size={24} color={colors.text} />
              <Text style={styles.rowLabel}>深色模式</Text>
            </View>
            <View style={[styles.customSwitch, isDarkMode && styles.customSwitchActive]}>
              <View style={[styles.switchThumb, isDarkMode && styles.switchThumbActive]}>
                {isDarkMode ? (
                  <Check size={14} color={colors.border} />
                ) : (
                  <X size={14} color={colors.white} />
                )}
              </View>
            </View>
          </Pressable>

          {/* First day of week */}
          <Pressable style={styles.rowItem} onPress={() => setModalType('day')}>
            <View style={styles.rowLeft}>
              <Calendar size={24} color={colors.text} />
              <Text style={styles.rowLabel}>每週第一天</Text>
            </View>
            <View style={styles.valuePill}>
              <Text style={styles.rowValue}>{firstDayOfWeek === 'sunday' ? '周日' : '周一'}</Text>
              <ChevronRight size={16} color={colors.text} />
            </View>
          </Pressable>

          {/* Default Font Size */}
          <Pressable style={styles.rowItem} onPress={() => setModalType('fontSize')}>
            <View style={styles.rowLeft}>
              <Type size={24} color={colors.text} />
              <Text style={styles.rowLabel}>預設字體大小</Text>
            </View>
            <View style={styles.valuePill}>
              <Text style={styles.rowValue}>{defaultFontSize}</Text>
              <ChevronRight size={16} color={colors.text} />
            </View>
          </Pressable>

          {/* Reset Password */}
          <Pressable style={[styles.rowItem, { marginBottom: 0 }]} onPress={() => router.push('/reset-password')}>
            <View style={styles.rowLeft}>
              <Keyboard size={24} color={colors.text} />
              <Text style={styles.rowLabel}>重新設定密碼</Text>
            </View>
            <ChevronRight size={20} color={colors.text} />
          </Pressable>

        </View>
      </View>

      {/* Picker Modal */}
      <Modal visible={!!modalType} transparent animationType="fade" onRequestClose={() => setModalType(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalType(null)}>
          <View style={styles.modalContent}>
            <View style={styles.modalContentInner}>
              {modalType === 'day' && daysOptions.map((opt, idx) => (
                <Pressable 
                  key={opt.value} 
                  style={[styles.modalOption, idx === daysOptions.length - 1 && { borderBottomWidth: 0 }]} 
                  onPress={() => { setFirstDayOfWeek(opt.value); setModalType(null); }}
                >
                  <Text style={styles.modalOptionText}>{opt.label}</Text>
                  {firstDayOfWeek === opt.value && <Check size={20} color={colors.text} />}
                </Pressable>
              ))}
              {modalType === 'fontSize' && fontOptions.map((opt, idx) => (
                <Pressable 
                  key={opt} 
                  style={[styles.modalOption, idx === fontOptions.length - 1 && { borderBottomWidth: 0 }]} 
                  onPress={() => { setDefaultFontSize(opt); setModalType(null); }}
                >
                  <Text style={styles.modalOptionText}>{opt}</Text>
                  {defaultFontSize === opt && <Check size={20} color={colors.text} />}
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
  },
  backBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.surface,
  },
  card: {
    flex: 1,
    backgroundColor: colors.recentSection, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 16,
  },
  valuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 4,
  },
  customSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBE5F0',
    borderWidth: 1,
    borderColor: '#6b6058',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  customSwitchActive: {
    backgroundColor: '#6b6058',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#9F95AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchThumbActive: {
    backgroundColor: colors.surface,
    transform: [{ translateX: 22 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    width: '80%',
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
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});
