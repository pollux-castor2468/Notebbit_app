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
  require('../assets/img/1.png'),
  require('../assets/img/2.png'),
  require('../assets/img/3.png'),
  require('../assets/img/4.png'),
  require('../assets/img/5.png'),
  require('../assets/img/6.png'),
];

export default function AvatarSelectScreen() {
  const { colors, textStyles } = useStyles();
  const styles = getStyles(colors);
  
  const { profileAvatar, profileName, profileDesc } = useAuthStore();
  const { updateProfile } = useAuthActions();
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const handleSave = async () => {
    if (selectedAvatar !== null) {
      // Get the URI for the required image. In Expo, Image.resolveAssetSource can get the URI
      const asset = Image.resolveAssetSource(AVATAR_OPTIONS[selectedAvatar]);
      await updateProfile(profileName, profileDesc, asset.uri);
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
        <FlatList
          data={AVATAR_OPTIONS}
          numColumns={2}
          keyExtractor={(_, index) => index.toString()}
          columnWrapperStyle={styles.row}
          renderItem={({ item, index }) => (
            <Pressable 
              style={[styles.avatarWrapper, selectedAvatar === index && styles.selectedWrapper]}
              onPress={() => setSelectedAvatar(index)}
            >
              <Image source={item} style={styles.avatarImage} resizeMode="contain" />
            </Pressable>
          )}
        />
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
  row: {
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.tertiary,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  selectedWrapper: {
    borderColor: colors.text,
    borderWidth: 4,
  },
  avatarImage: {
    width: 100,
    height: 100,
  },
});
