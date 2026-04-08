import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import {
  Files,
  BookOpen,
  Star,
  CheckSquare,
  Settings as SettingsIcon,
  ChevronRight
} from 'lucide-react-native';
import { router } from 'expo-router';
import { colors } from '../../../constants/token';
import { layoutStyles, textStyles, cardStyles } from '../../../styles';

export default function Setting() {
  const SettingItem = ({ icon: Icon, title, onPress, showBorder = true, subtitle }) => (
    <Pressable style={[cardStyles.listItem, showBorder && cardStyles.listItemBorder]} onPress={onPress}>
      <View style={styles.iconBox}>
        <Icon size={22} color={colors.text} />
      </View>
      <View style={styles.textGroup}>
        <Text style={[textStyles.body, { fontWeight: '600' }]}>{title}</Text>
        {subtitle && <Text style={[textStyles.subtitle, { marginTop: 4 }]}>{subtitle}</Text>}
      </View>
      <ChevronRight size={20} color={colors.inactiveText} />
    </Pressable>
  );

  return (
    <SafeAreaView style={layoutStyles.root}>
      <ScrollView contentContainerStyle={layoutStyles.scrollContent}>
        <View style={styles.header}>
          <Text style={textStyles.h1}>設定與管理</Text>
        </View>

        <View style={styles.cardGroup}>
          <Text style={textStyles.h3}>內容圖書館</Text>
          <View style={cardStyles.listContainer}>
            <SettingItem 
              icon={Files} 
              title="瀏覽所有文件" 
              subtitle="依上次開啟日期排序"
              onPress={() => router.push({ pathname: '/file-browser', params: { type: 'document' } })} 
            />
            <SettingItem 
              icon={BookOpen} 
              title="瀏覽所有日記" 
              subtitle="依新增日期排序"
              onPress={() => router.push({ pathname: '/file-browser', params: { type: 'diary' } })} 
            />
            <SettingItem 
              icon={Star} 
              title="標記星號文件" 
              showBorder={false}
              onPress={() => router.push({ pathname: '/file-browser', params: { type: 'starred' } })} 
            />
          </View>
        </View>

        <View style={styles.cardGroup}>
          <Text style={textStyles.h3}>工作區</Text>
          <View style={cardStyles.listContainer}>
            <SettingItem 
              icon={CheckSquare} 
              title="自訂任務區" 
              showBorder={false}
              onPress={() => {}} // Placeholder
            />
          </View>
        </View>

        <View style={styles.cardGroup}>
          <Text style={textStyles.h3}>系統</Text>
          <View style={cardStyles.listContainer}>
            <SettingItem 
              icon={SettingsIcon} 
              title="其他設定" 
              subtitle="深色模式、背景樣式等"
              showBorder={false}
              onPress={() => router.push('/settings-details')} 
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  cardGroup: {
    marginBottom: 32,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.container,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textGroup: {
    flex: 1,
    justifyContent: 'center',
  },
});
