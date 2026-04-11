import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { colors } from '../constants/token';
import { layoutStyles, textStyles } from '../styles';

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');

  return (
    <SafeAreaView style={layoutStyles.root}>
      {/* Header aligned with 402x62 dimensions */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search size={22} color={colors.inactiveText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={colors.inactiveText}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')} style={{ padding: 4 }}>
              <X size={20} color={colors.text} />
            </Pressable>
          )}
        </View>
        <Pressable onPress={() => router.back()} style={{ marginLeft: 16 }}>
          <Text style={[textStyles.body, { color: colors.tertiary, fontWeight: '600' }]}>取消</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.emptyText}>請輸入關鍵字...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 62,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(101, 68, 69, 0.08)',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(101, 68, 69, 0.2)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  emptyText: {
    fontSize: 18,
    color: colors.inactiveText,
    fontWeight: '600',
  }
});
