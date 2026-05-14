import { Stack } from "expo-router";

export default function TaskScreenLayout() {
    return (
        <Stack screenOptions={{
            headerShown: false,
        }}>
            <Stack.Screen name="index" />
            
        </Stack>
    )
}