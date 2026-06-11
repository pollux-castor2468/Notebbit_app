import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function AuthCallback() {
  useEffect(() => {
    // 當 Expo Router 接收到深層連結時，會跳轉到這個頁面。
    // AuthSession 會在背景處理登入邏輯，我們只需要在這裡稍微等待一下，
    // 然後把畫面導航回首頁或上一頁，就能避免「Unmatched Route」的錯誤畫面。
    const timer = setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    }, 500); // 給 AuthSession 一點時間處理 URL

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF9F6', // 符合你的 App 背景色
  },
});
