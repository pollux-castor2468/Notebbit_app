import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="(home)" options={{title: 'HOME'}} />
            <Tabs.Screen name="setting" options={{title: 'setting'}} />
        </Tabs>
    )
}