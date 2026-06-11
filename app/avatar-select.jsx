import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { useStyles } from '../styles';
import { useAuthStore } from '../store/useAuthStore';
import { useAuthActions } from '../hooks/useAuthActions';

// Assuming these images exist in the project
const AVATAR_OPTIONS = [
  require('../assets/img/head1.png'),
  require('../assets/img/head2.png'),
  require('../assets/img/head3.png'),
  require('../assets/img/head4.png'),
  require('../assets/img/head5.png'),
  require('../assets/img/head6.png'),
  require('../assets/img/head7.png'),
  require('../assets/img/head8.png'),
  require('../assets/img/head9.png'),
  require('../assets/img/head10.png'),
];

export default function AvatarSelectScreen() {
  const { colors, textStyles } = useStyles();
  const styles = getStyles(colors);
  
  const { profileAvatar, profileName, profileDesc } = useAuthStore();
  const { updateProfile } = useAuthActions();
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const handleSave = () => {
    if (selectedAvatar !== null) {
      updateProfile(profileName, profileDesc, `app-avatar-${selectedAvatar}`);
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={28} color={colors.text} />
        </Pressable>
        <Text style={[textStyles.h3, { flex: 1, textAlign: 'center' }]}>選擇頭像</Text>
        <Pressable onPress={handleSave} style={styles.backBtn}>
          <Check size={28} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.listContainer}>
          <FlatList
            data={AVATAR_OPTIONS}
            numColumns={3}
            keyExtractor={(_, index) => index.toString()}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <Pressable 
                style={[styles.avatarWrapper, selectedAvatar === index && styles.selectedWrapper]}
                onPress={() => setSelectedAvatar(index)}
              >
                <View style={styles.imageContainer}>
                  <Image source={item} style={styles.avatarImage} resizeMode="contain" />
                </View>
              </Pressable>
            )}
          />
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
  },
  listContainer: {
    flex: 1,
    backgroundColor: colors.recentSection,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: 32,
    gap: 16, // using gap for React Native >= 0.71
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 0,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedWrapper: {
    // borderColor: '#6b6058',
    borderWidth: 5,
  },
  imageContainer: {
    width: '100%',
    // height: 76,
    // borderRadius: 50,
    // borderWidth: 1,
    // borderColor: colors.border,
    // backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 100,
    height: 100,
  },
});
