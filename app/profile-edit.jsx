import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useStyles } from '../styles';
import { useAuthStore } from '../store/useAuthStore';
import { useAuthActions } from '../hooks/useAuthActions';

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
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
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

      <View style={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <Image source={require('../assets/img/1.png')} style={styles.avatarImage} resizeMode="contain" />
            )}
          </View>
          <View style={styles.avatarActions}>
            <Pressable style={styles.avatarBtn} onPress={() => router.push('/avatar-select')}>
              <Text style={styles.avatarBtnText}>選擇頭像</Text>
            </Pressable>
            <Pressable style={styles.avatarBtn} onPress={handleCustomAvatar}>
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

      </View>
      <View style={styles.footer}>
         <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>保存</Text>
         </Pressable>
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
    width: 120,
    height: 120,
  },
  avatarActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  avatarBtn: {
    flex: 0.48,
    backgroundColor: colors.container,
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
    backgroundColor: '#EBEBEB',
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
    backgroundColor: colors.container,
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
