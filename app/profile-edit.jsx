import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, Image, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useStyles } from '../styles';
import { useAuthStore } from '../store/useAuthStore';
import { useAuthActions } from '../hooks/useAuthActions';

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

export default function ProfileEditScreen() {
  const { colors, textStyles } = useStyles();
  const styles = getStyles(colors);
  
  const { profileName, profileDesc, profileAvatar } = useAuthStore();
  const { updateProfile } = useAuthActions();
  
  const [name, setName] = useState(profileName || '');
  const [desc, setDesc] = useState(profileDesc || '');
  const [avatar, setAvatar] = useState(profileAvatar || null);

  React.useEffect(() => {
    if (profileAvatar) {
      setAvatar(profileAvatar);
    }
  }, [profileAvatar]);

  const handleCustomAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const mimeType = asset.mimeType || 'image/jpeg';
      const base64Img = `data:${mimeType};base64,${asset.base64}`;
      setAvatar(base64Img);
    }
  };

  const handleSave = async () => {
    const res = await updateProfile(name, desc, avatar);
    if (res.success) {
      router.back();
    } else {
      Alert.alert('儲存失敗', res.error || '發生錯誤');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={28} color={colors.text} />
        </Pressable>
        <Text style={[textStyles.h3, { flex: 1, textAlign: 'center', marginRight: 28 }]}>編輯個人檔案</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            {avatar ? (
              avatar.startsWith('app-avatar-') ? (
                <Image source={AVATAR_OPTIONS[parseInt(avatar.replace('app-avatar-', ''), 10)]} style={styles.avatarImage} resizeMode="contain" />
              ) : (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              )
            ) : (
              <Image source={require('../assets/img/head1.png')} style={styles.avatarImage} resizeMode="contain" />
            )}
          </View>
          <View style={styles.avatarActions}>
            <Pressable style={styles.avatarBtn} onPress={() => router.push('/avatar-select')}>
              <Text style={styles.avatarBtnText}>選擇頭像</Text>
            </Pressable>
            <Pressable style={[styles.avatarBtn, {backgroundColor: colors.secondary}]} onPress={handleCustomAvatar}>
              <Text style={styles.avatarBtnText}>自訂頭像</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>修改名稱</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="請輸入名稱"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>修改介紹</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            value={desc}
            onChangeText={setDesc}
            placeholder="請輸入介紹"
            multiline
          />
        </View>

        </ScrollView>
        <View style={styles.footer}>
           <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>保存</Text>
           </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: colors.tertiary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    margin: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 140,
    height: 140,
  },
  avatarActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  avatarBtn: {
    flex: 0.48,
    backgroundColor: colors.recentHeader,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  avatarBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.input,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  saveBtn: {
    backgroundColor: colors.recentHeader,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
});
