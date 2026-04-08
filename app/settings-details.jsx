import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Switch } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Monitor, Moon, Image as ImageIcon } from 'lucide-react-native';
import { colors } from '../constants/token';
import { layoutStyles, textStyles } from '../styles';

export default function SettingsDetails() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  return (
    <SafeAreaView style={layoutStyles.root}>
      <View style={[layoutStyles.rowBetween, styles.header]}>
        <Pressable onPress={() => router.back()} style={layoutStyles.iconButtonBg}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={textStyles.h3}>其他設定</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.settingGroup}>
          <Text style={[textStyles.subtitle, styles.groupLabel]}>外觀</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={layoutStyles.rowCenter}>
                <Moon size={20} color={colors.text} />
                <Text style={[textStyles.body, styles.rowTitle]}>深色模式</Text>
              </View>
              <Switch 
                value={isDarkMode} 
                onValueChange={setIsDarkMode} 
                trackColor={{ false: colors.surfaceVariant, true: colors.tertiary }}
              />
            </View>
            <View style={styles.divider} />
            <Pressable style={styles.settingRow}>
              <View style={layoutStyles.rowCenter}>
                <ImageIcon size={20} color={colors.text} />
                <Text style={[textStyles.body, styles.rowTitle]}>更改背景圖片</Text>
              </View>
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={styles.settingRow}>
              <View style={layoutStyles.rowCenter}>
                <Monitor size={20} color={colors.text} />
                <Text style={[textStyles.body, styles.rowTitle]}>字體大小</Text>
              </View>
              <Text style={textStyles.subtitle}>中</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    padding: 24,
  },
  settingGroup: {
    marginBottom: 32,
  },
  groupLabel: {
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 12,
  },
  settingCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  rowTitle: {
    marginLeft: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(101, 68, 69, 0.06)',
    marginHorizontal: 20,
  },
});
