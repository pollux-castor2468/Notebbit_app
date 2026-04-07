import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="(home)" options={{
                title: 'HOME', headerShown: false,
                tabBarIcon: ({focused}) => (<Ionicons name="home" size={20} color={focused ? 'black' : 'gray'} />)}} />
            <Tabs.Screen name="setting" options={{title: 'setting'}} />
        </Tabs>
    )
}