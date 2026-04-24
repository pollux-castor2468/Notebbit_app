import { Stack } from "expo-router";
import { View } from "react-native";
import { useStyles } from "../../../styles";

export default function SettingScreenLayout() {
    const { colors } = useStyles();
    return (
        <View style={{ flex: 1, backgroundColor: colors.surface }}>
            <Stack screenOptions={{
                headerShown: false,
            }}>
                <Stack.Screen name="index" 
                options={{ headerShown: false }}/>
                <Stack.Screen name="file-browser" />
            </Stack>
        </View>
    )
}