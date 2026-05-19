import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useStyles } from '../styles';
import { useAuthStore } from '../store/useAuthStore';
import { useAuthActions } from '../hooks/useAuthActions';

export default function RegisterScreen() {
  const { colors, textStyles } = useStyles();
  const styles = getStyles(colors);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const isLoading = useAuthStore(state => state.isLoading);
  const { register, loginWithGoogle } = useAuthActions();

  const handleRegister = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert('註冊失敗', '請輸入名稱');
      return;
    }
    if (!trimmedEmail.includes('@gmail.com')) {
      Alert.alert('註冊失敗', '請輸入有效的 Gmail 帳號');
      return;
    }
    if (password.length < 6) {
      Alert.alert('註冊失敗', '密碼需至少 6 個字元');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('註冊失敗', '兩次輸入的密碼不相符');
      return;
    }

    const res = await register(trimmedName, trimmedEmail, password);
    if (res.success) {
      router.replace('/(tabs)/(setting)');
    } else {
      Alert.alert('註冊失敗', res.error || '發生未知錯誤');
    }
  };

  const handleGoogleLogin = async () => {
    const loginRes = await loginWithGoogle();
    if (loginRes.success) {
      router.replace('/(tabs)/(setting)');
    } else if (loginRes.error !== '已取消登入') {
      Alert.alert('Google 登入發生錯誤', loginRes.error);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={28} color={colors.text} />
        </Pressable>
        <Text style={[textStyles.h2, { flex: 1, textAlign: 'center', marginRight: 28 }]}>註冊</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>輸入名稱</Text>
          <TextInput
            style={styles.input}
            placeholder="請輸入名稱"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>輸入帳號</Text>
          <TextInput
            style={styles.input}
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>設定密碼</Text>
          <TextInput
            style={styles.input}
            placeholder="請輸入密碼"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>再次輸入密碼</Text>
          <TextInput
            style={styles.input}
            placeholder="請再次輸入密碼"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <Pressable style={styles.loginBtn} onPress={handleRegister} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.loginBtnText}>註冊 / 登入</Text>}
        </Pressable>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>或</Text>
          <View style={styles.divider} />
        </View>

        <Pressable style={styles.googleBtn} onPress={handleGoogleLogin} disabled={isLoading}>
          <Text style={styles.googleBtnText}>使用 Google 註冊</Text>
        </Pressable>
      </ScrollView>
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
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.tertiary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  loginBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loginBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.errow,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.text,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  googleBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#757575',
  },
});
