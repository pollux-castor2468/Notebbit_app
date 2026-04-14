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
          tabBarShowLabel: true,
          tabBarStyle: {
            position: 'absolute',
            bottom: 24,
            left: 15,
            right: 15,
            height: 80,
            backgroundColor: themeColors.surface, // 淺黃背景
            borderRadius: 40,
            borderTopWidth: 1, // Need border top
            elevation: 0,
            shadowOpacity: 0,
            paddingBottom: 8, // Adjust label spacing
            paddingTop: 8,
            borderWidth: 1,
            borderColor: themeColors.border,
          },
          tabBarActiveTintColor: themeColors.text,
          tabBarInactiveTintColor: themeColors.inactiveText,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: 'home',
            tabBarIcon: ({ focused }) => (
              <View style={{
                backgroundColor: focused ? 'rgba(139, 61, 255, 0.15)' : 'transparent', // Light Canva Purple
                paddingHorizontal: 20,
                paddingVertical: 4,
                borderRadius: 20,
              }}>
                <Home size={24} color={focused ? themeColors.text : themeColors.inactiveText} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="create"
          options={{
            title: '',
            tabBarButton: (props) => {
              return (
                <Pressable
                  style={[
                    props.style,
                    {
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }
                  ]}
                  onPress={(e) => {
                    e.preventDefault();
                    setAddMenuVisible(true);
                  }}
                >
                  <View style={{
                    width: 56,
                    height: 56,
                    backgroundColor: themeColors.fab, // 黃色

                    borderRadius: 28, // 圓形
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                    <Plus size={28} color={themeColors.text} strokeWidth={3} />
                  </View>
                </Pressable>
              );
            },
          }}
        />

        <Tabs.Screen
          name="(setting)"
          options={{
            title: 'setting',
            tabBarIcon: ({ focused }) => (
              <View style={{
                backgroundColor: focused ? 'rgba(139, 61, 255, 0.15)' : 'transparent',
                paddingHorizontal: 20,
                paddingVertical: 4,
                borderRadius: 20,
              }}>
                <Settings size={24} color={focused ? themeColors.text : themeColors.inactiveText} />
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
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAddMenuVisible(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.menuWrapper}>
              <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem} onPress={() => handleNavCreate('document')}>
                  <Text style={styles.menuText}>建立文件</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => handleNavCreate('diary')}>
                  <Text style={styles.menuText}>建立日記</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.menuArrow} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)', // subtle dim
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  menuWrapper: {
    marginBottom: 90, // Position right above the 80px tab bar (bottom: 24) -> 104px
    alignItems: 'center',
  },
  menuContainer: {
    flexDirection: 'row',
    backgroundColor: themeColors.recentHeader,
    borderRadius: 24,
    padding: 12,
    gap: 12, // React Native 支援 gap
    shadowColor: themeColors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  menuItem: {
    width: 100,
    height: 64,
    backgroundColor: themeColors.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '700',
    color: themeColors.text,
  },
  menuArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: themeColors.recentHeader,
    marginTop: 0, // No margin, it flush bounds exactly to popover container
  },
});
