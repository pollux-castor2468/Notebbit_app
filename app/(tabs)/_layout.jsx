import { Tabs, router } from "expo-router";
import { View, Pressable, Modal, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Image } from "react-native";
import { colors as themeColors, fontSize, colors, defaultTabBarStyle } from "../../constants/token";
import { Home, Settings, Plus, FileText, Book } from "lucide-react-native";
import { useState } from "react";
import { useFileStore } from "../../store/useFileStore";

export default function TabLayout() {
  //寫程式怎麼可以沒有註解(怒(掀桌
  //這是什麼? 喔喔一樣是下面tab的+號鍵，有觸發是true，關閉是false
  const [isAddMenuVisible, setAddMenuVisible] = useState(false);
  //用全域變數儲存！這樣才不會不見
  const { data: historyData, createFile, updateFile } = useFileStore();

  // Close menu and navigate 點擊下面的tab鍵後觸發，在最下面
  const handleNavCreate = (type) => {
    setAddMenuVisible(false);
    if (type === 'document') {  //連到編輯文件頁
      const newFile = createFile('document', '未命名文件');
      router.push(`/document/${newFile.id}`);
    } else {  //連到日記頁
      const newFile = createFile('diary', '未命名日記');
      router.push(`/diary/${newFile.id}`);
    }
  };

  return (
    <>
      <Tabs  //下面的tab區域
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: defaultTabBarStyle,
          tabBarActiveTintColor: themeColors.text,
          tabBarInactiveTintColor: themeColors.inactiveText,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen  //左邊的首頁按鈕
          name="(home)"
          options={{
            title: 'home',
            tabBarIcon: ({ focused }) => (
              <View style={{
                backgroundColor: focused ? colors.recentHeader : 'transparent', // 和最近開啟頭一樣顏色啦
                paddingHorizontal: 20,
                paddingVertical: 4,
                borderRadius: 20,
              }}>
                <Home size={24} color={focused ? themeColors.text : themeColors.inactiveText} />
              </View>
            ),
          }}
        />

        <Tabs.Screen  //中間的+號按鈕
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

        <Tabs.Screen  //右邊的設定按鈕
          name="(setting)"
          options={{
            title: 'setting',
            tabBarIcon: ({ focused }) => (
              <View style={{
                backgroundColor: focused ? colors.recentHeader : 'transparent',
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
                <TouchableOpacity style={styles.menuItemL} onPress={() => handleNavCreate('document')}>
                  <Text style={styles.menuText}>建立文件</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItemR} onPress={() => handleNavCreate('diary')}>
                  <Text style={styles.menuText}>建立日記</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.menuArrow} />
              <Image source={require('../../assets/img/3.png')} style={styles.rabbit} resizeMode="contain" />
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
    // backgroundColor: 'rgba(0,0,0,0.1)', // subtle dim
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  menuWrapper: {
    marginBottom: 60, // Position right above the 80px tab bar (bottom: 24) -> 104px
    alignItems: 'center',
  },
  menuContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 12, // React Native 支援 gap
    // shadowColor: themeColors.text,
    // shadowOffset: { width: 0, height: 8 },
    // shadowOpacity: 0.15,
    // shadowRadius: 16,
    elevation: 8,
  },
  menuItemL: {
    width: 100,
    height: 64,
    backgroundColor: colors.container,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemR: {
    width: 100,
    height: 64,
    backgroundColor: colors.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderTopColor: colors.surface,
    marginTop: 0, // No margin, it flush bounds exactly to popover container
  },
  rabbit: {
    position: 'absolute',
    height: 70,
    top: -30,
    right: -90
  }
});
