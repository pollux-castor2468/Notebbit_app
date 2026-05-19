import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useStyles } from '../styles';
import { useAuthStore } from '../store/useAuthStore';
import { useAuthActions } from '../hooks/useAuthActions';

export default function LoginScreen() {
  const { colors, textStyles } = useStyles();
  const styles = getStyles(colors);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isLoading = useAuthStore(state => state.isLoading);
  const { login, loginWithGoogle } = useAuthActions();

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail.includes('@gmail.com')) {
      Alert.alert('登入失敗', '請輸入有效的 Gmail 帳號');
      return;
    }
    if (password.length < 6) {
      Alert.alert('登入失敗', '密碼需至少 6 個字元');
      return;
    }

    const res = await login(trimmedEmail, password);
    if (res.success) {
      router.replace('/(tabs)/(setting)');
    } else {
      Alert.alert('登入失敗', res.error || '帳號或密碼錯誤');
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
        <Text style={[textStyles.h2, { flex: 1, textAlign: 'center', marginRight: 28 }]}>登入</Text>
      </View>

      <View style={styles.content}>
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
          <Text style={styles.label}>輸入密碼</Text>
          <TextInput
            style={styles.input}
            placeholder="請輸入密碼"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable style={styles.loginBtn} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.loginBtnText}>登入</Text>}
        </Pressable>

        <Pressable style={styles.registerBtn} onPress={() => router.push('/register')} disabled={isLoading}>
          <Text style={styles.registerBtnText}>註冊</Text>
        </Pressable>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>或</Text>
          <View style={styles.divider} />
        </View>

        <Pressable style={styles.googleBtn} onPress={handleGoogleLogin} disabled={isLoading}>
          <Text style={styles.googleBtnText}>使用 Google 登入</Text>
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
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  inputGroup: {
    marginBottom: 24,
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
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loginBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.errow, // Usually errow is the red/dark color used for primary text on secondary background
  },
  registerBtn: {
    backgroundColor: colors.container,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  registerBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
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
