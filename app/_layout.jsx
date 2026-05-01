import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TouchableWithoutFeedback, Keyboard, View } from "react-native";

import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useFileStore } from "../store/useFileStore";
import { useTaskStore } from "../store/useTaskStore";

export default function RootLayout() {
    const autoLogin = useAuthStore((state) => state.autoLogin);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        autoLogin();
    }, []);

    useEffect(() => {
        if (user) {
            useFileStore.getState().fetchFiles();
            useTaskStore.getState().fetchTasks();
        }
    }, [user]);
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1 }}>
                    <StatusBar style="dark" />
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="search" options={{ animation: 'slide_from_right' }} />
                    </Stack>
                </View>
            </TouchableWithoutFeedback>
        </GestureHandlerRootView>
    );
}