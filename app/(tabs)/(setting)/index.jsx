import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText,
  Edit,
  Star,
  CheckSquare,
  Settings as SettingsIcon,
  Moon,
  Search,
  Rabbit,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { colors } from '../../../constants/token';
import TopHeader from '../../../components/TopHeader';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { useFileStore } from '../../../store/useFileStore';

export default function Setting() {
  const { isDarkMode, setIsDarkMode } = useSettingsStore();
  const data = useFileStore(state => state.data);

  const documentCount = data.filter(d => d.type === 'document').length;
  const diaryCount = data.filter(d => d.type === 'diary').length;

  const ListSettingItem = ({ icon: Icon, title, onPress, children }) => (
    <Pressable style={styles.listItem} onPress={onPress}>
      <Icon size={24} color={colors.text} style={{ marginRight: 16 }} />
      <Text style={styles.listItemText}>{title}</Text>
      {children}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Extracted RWD Header */}
        <TopHeader />

        {/* Top Grid Area: 2 tiles of 182x120 */}
        <View style={styles.topGridRow}>
          <Pressable
            style={[styles.topGridCard, { backgroundColor: colors.container }]}
            onPress={() => router.push({ pathname: '/file-browser', params: { type: 'document' } })}
          >
            <View style={styles.topCardContent}>
              <FileText size={26} color={colors.text} style={{ marginBottom: 6 }} />
              <Text style={styles.gridTitle}>所有文件</Text>
              <Text style={styles.gridCount}>共 {documentCount} 篇</Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.topGridCard, { backgroundColor: colors.secondary }]}
            onPress={() => router.push({ pathname: '/file-browser', params: { type: 'diary' } })}
          >
            <View style={styles.topCardContent}>
              <Edit size={26} color={colors.text} style={{ marginBottom: 6 }} />
              <Text style={styles.gridTitle}>所有日記</Text>
              <Text style={styles.gridCount}>共 {diaryCount} 篇</Text>
            </View>
          </Pressable>
        </View>

        {/* List Items matching exactly 378x60 */}
        <View style={styles.listSection}>
          <ListSettingItem
            icon={Star}
            title="星號文件"
            onPress={() => router.push({ pathname: '/file-browser', params: { type: 'starred' } })}
          />
          <ListSettingItem
            icon={CheckSquare}
            title="自訂任務"
            onPress={() => router.push('/custom-tasks')}
          />
          <ListSettingItem
            icon={SettingsIcon}
            title="其他設定"
            onPress={() => router.push('/settings-details')}
          />
          <ListSettingItem
            icon={Moon}
            title="深色模式"
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: 'rgba(101,68,69,0.2)', true: colors.fab }}
              thumbColor={isDarkMode ? colors.surface : colors.text}
            />
          </ListSettingItem>
          {/* Blank 378x60 block based on formatting requirement bottom tag */}
          <View style={[styles.listItem, { backgroundColor: 'transparent', borderWidth: 0 }]} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120, // Tab bar clearance
    paddingTop: 16,
  },
  topGridRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topGridCard: {
    flex: 0.48,
    height: 120,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  topCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  gridCount: {
    fontSize: 12,
    color: colors.inactiveText,
    marginTop: 2,
  },
  listSection: {
    width: '100%',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 60,
    backgroundColor: colors.tertiary,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: colors.text,
  },
});
