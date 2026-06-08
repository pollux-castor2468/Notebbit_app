import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useStyles } from '../styles';
import { AuthService } from '../services/authService';

export default function ResetPasswordScreen() {
  const { colors, textStyles } = useStyles();
  const styles = getStyles(colors);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (password.length < 6) {
      Alert.alert('修改失敗', '密碼需至少 6 個字元');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('修改失敗', '兩次輸入的密碼不一致');
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.updatePassword(password);
      Alert.alert('成功', '密碼已成功修改！', [
        { text: '確定', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('修改失敗', error.message || '無法修改密碼，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={28} color={colors.text} />
        </Pressable>
        <Text style={[textStyles.h2, { flex: 1, textAlign: 'center', marginRight: 28 }]}>重新設定密碼</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>輸入新密碼</Text>
            <TextInput
              style={styles.input}
              placeholder="請輸入新密碼（至少 6 字元）"
              placeholderTextColor={colors.inactiveText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>確認新密碼</Text>
            <TextInput
              style={styles.input}
              placeholder="請再次輸入新密碼"
              placeholderTextColor={colors.inactiveText}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
        </View>

        <Pressable style={styles.submitBtn} onPress={handleResetPassword} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.submitBtnText}>確認修改</Text>}
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
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  content: {
    borderWidth: 1,
    borderRadius: 20,
    borderColor: colors.border,
    padding: 16,
    paddingTop: 20,
    backgroundColor: colors.recentSection,
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
    backgroundColor: colors.input,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  submitBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.errow,
  },
});
