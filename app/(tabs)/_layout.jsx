<<<<<<< Updated upstream
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
=======
import { Tabs, router } from "expo-router";
import { View, Pressable, Modal, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { colors as themeColors, fontSize } from "../../constants/token";
import { Home, Settings, Plus, FileText, Book } from "lucide-react-native"; 
import { useState } from "react";

export default function TabLayout() {
  const [isAddMenuVisible, setAddMenuVisible] = useState(false);

  // Close menu and navigate
  const handleNavCreate = (type) => {
    setAddMenuVisible(false);
    if (type === 'document') {
      router.push('/document-editor');
    } else {
      router.push('/diary-editor');
    }
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: themeColors.onPrimary, // 白色背景
            height: 85, 
            paddingBottom: 20,
            paddingTop: 10,
            borderTopWidth: 0,
            elevation: 0, // 移除 Android 陰影
            shadowOpacity: 0, // 移除 iOS 陰影
          },
          tabBarActiveTintColor: themeColors.text, // 選中文字顏色
          tabBarInactiveTintColor: themeColors.inactiveText, // 未選中文字顏色
          tabBarLabelStyle: {
            fontSize: fontSize.xs,
            fontWeight: '600',
            marginTop: 5,
          },
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: '首頁',
            tabBarIcon: ({ focused, color }) => (
              <View style={{
                backgroundColor: focused ? themeColors.container : 'transparent',
                paddingHorizontal: 20,
                paddingVertical: 4,
                borderRadius: 20,
              }}>
                <Home size={24} color={color} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="create"
          options={{
            title: '',
            tabBarButton: (props) => (
              <Pressable 
                {...props} 
                onPress={() => setAddMenuVisible(true)}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View style={{
                  width: 56,
                  height: 56,
                  backgroundColor: themeColors.canva, // Canva 紫色
                  borderRadius: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 10, 
                  shadowColor: themeColors.canva,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}>
                  <Plus size={30} color={themeColors.onPrimary} />
                </View>
              </Pressable>
            ),
          }}
        />

        <Tabs.Screen
          name="(setting)"
          options={{
            title: '設定',
            tabBarIcon: ({ focused, color }) => (
              <View style={{
                backgroundColor: focused ? themeColors.container : 'transparent',
                paddingHorizontal: 20,
                paddingVertical: 4,
                borderRadius: 20,
              }}>
                <Settings size={24} color={color} />
              </View>
            ),
          }}
        />
      </Tabs>

      <Modal
        visible={isAddMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAddMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAddMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.menuContainer}>
              <View style={styles.menuArrow} />
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavCreate('document')}>
                <FileText size={20} color={themeColors.text} />
                <Text style={styles.menuText}>建立新文件</Text>
              </TouchableOpacity>
              <View style={styles.menuSeparator} />
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavCreate('diary')}>
                <Book size={20} color={themeColors.text} />
                <Text style={styles.menuText}>建立新日記</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: themeColors.onPrimary,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: 180,
    marginBottom: 100, // 就在 Tab Bar 上方
    shadowColor: themeColors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  menuArrow: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: themeColors.onPrimary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  menuSeparator: {
    height: 1,
    backgroundColor: themeColors.surfaceVariant,
    marginHorizontal: 8,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: themeColors.text,
  },
});
>>>>>>> Stashed changes
