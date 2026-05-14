import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Moon, Calendar, KeyRound } from 'lucide-react-native';
import { router } from 'expo-router';
import { useStyles } from '../styles';
import { useSettingsStore } from '../store/useSettingsStore';

export default function SettingsDetailsScreen() {
  const { colors, textStyles, isDarkMode } = useStyles();
  const styles = getStyles(colors);
  const { toggleDarkMode } = useSettingsStore();

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
          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Moon size={24} color={colors.text} />
              <Text style={styles.rowLabel}>深色模式</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.border, true: colors.secondary }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.divider} />

          {/* First day of week */}
          <Pressable style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Calendar size={24} color={colors.text} />
              <Text style={styles.rowLabel}>每週第一天</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.rowValue}>周日</Text>
              <ChevronRight size={20} color={colors.inactiveText} />
            </View>
          </Pressable>

          <View style={styles.divider} />

          {/* Reset Password */}
          <Pressable style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <KeyRound size={24} color={colors.text} />
              <Text style={styles.rowLabel}>重新設定密碼</Text>
            </View>
            <ChevronRight size={20} color={colors.inactiveText} />
          </Pressable>

        </View>
      </View>
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
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
  },
  rowValue: {
    fontSize: 14,
    color: colors.inactiveText,
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
