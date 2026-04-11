import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Rabbit, Search } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors } from '../constants/token';
import { layoutStyles } from '../styles';

export default function TopHeader() {
  return (
    <View style={styles.header}>
      <View style={[layoutStyles.rowCenter, { flex: 1 }]}>
        <View style={styles.brandBox}>
          <Rabbit size={28} color={colors.text} />
        </View>
        <Text style={styles.brandText}>Notebbit</Text>
      </View>
      <Pressable style={layoutStyles.iconButtonBg} onPress={() => router.push('/search')}>
        <Search size={24} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 62,
    marginTop: 8,
    marginBottom: 24,
  },
  brandBox: {
    width: 52,
    height: 52,
    borderRadius: 24,
    backgroundColor: colors.container,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.text,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 12,
  },
});
