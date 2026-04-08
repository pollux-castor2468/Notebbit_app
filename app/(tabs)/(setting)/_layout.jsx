import { Stack } from "expo-router";
import { View } from "react-native";
import { colors } from "../../../constants/token";

export default function SettingScreenLayout() {
    return (
        <View style={{ flex: 1, backgroundColor: colors.surface }}>
            <Stack screenOptions={{
                headerShown: false,
            }}>
                <Stack.Screen name="index" 
                options={{ headerShown: false }}/>
            </Stack>
        </View>
    )
}