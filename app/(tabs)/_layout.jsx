import { Tabs, router } from "expo-router";
import { View, Pressable, Modal, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Image } from "react-native";
import { fontSize, defaultTabBarStyle as staticTabBarStyle } from "../../constants/token";
import { useStyles } from "../../styles";
import { Home, Settings, Plus, FileText, Book, Calendar, CheckSquare } from "lucide-react-native";
import { useState } from "react";
import { useFileStore } from "../../store/useFileStore";

export default function TabLayout() {
  //寫程式怎麼可以沒有註解(怒(掀桌
  //這是什麼? 喔喔一樣是下面tab的+號鍵，有觸發是true，關閉是false
  const [isAddMenuVisible, setAddMenuVisible] = useState(false);
  const { colors } = useStyles();
  const styles = getStyles(colors);
  const tabBarStyle = {
    ...staticTabBarStyle,
    backgroundColor: colors.recentSection,
    borderColor: colors.border,
  };
  const { data: createFile } = useFileStore();

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
          tabBarStyle: tabBarStyle,
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.inactiveText,
        }}
      >
        <Tabs.Screen  //左邊的首頁按鈕
          name="(home)"
          options={{
            title: 'home',
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <View style={{
                backgroundColor: focused ? colors.recentHeader : 'transparent', // 和最近開啟頭一樣顏色啦
                paddingHorizontal: 15,
                paddingVertical: 4,
                borderRadius: 20,
                marginBottom: -15,
                left: 5,
              }}>
                <Home size={24} color={focused ? colors.text : colors.inactiveText} />
              </View>
            ),
          }}
        />
        <Tabs.Screen  //左邊的calender按鈕
          name="(calender)"
          options={{
            title: 'calender',
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <View style={{
                backgroundColor: focused ? colors.recentHeader : 'transparent', // 和最近開啟頭一樣顏色啦
                paddingHorizontal: 15,
                paddingVertical: 4,
                borderRadius: 20,
                marginBottom: -15,
              }}>
                <Calendar size={24} color={focused ? colors.text : colors.inactiveText} />
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
                    backgroundColor: colors.fab, // 黃色
                    borderRadius: 28, // 圓形
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: [{ translateY: -5 }], // 讓按鈕往上凸起，不影響 tabBar 高度
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 5,
                  }}>
                    <Plus size={28} color={colors.text} strokeWidth={3} />
                  </View>
                </Pressable>
              );
            },
          }}
        />
        <Tabs.Screen  //task按鈕
          name="(task)"
          options={{
            title: 'task',
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <View style={{
                backgroundColor: focused ? colors.recentHeader : 'transparent', // 和最近開啟頭一樣顏色啦
                paddingHorizontal: 15,
                paddingVertical: 4,
                borderRadius: 20,
                marginBottom: -15,
              }}>
                <CheckSquare size={24} color={focused ? colors.text : colors.inactiveText} />
              </View>
            ),
          }}
        />
        <Tabs.Screen  //右邊的設定按鈕
          name="(setting)"
          options={{
            title: 'setting',
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <View style={{
                backgroundColor: focused ? colors.recentHeader : 'transparent',
                paddingHorizontal: 15,
                paddingVertical: 4,
                borderRadius: 20,
                marginBottom: -15,
                right: 5,
              }}>
                <Settings size={24} color={focused ? colors.text : colors.inactiveText} />
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

const getStyles = (colors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  menuWrapper: {
    marginBottom: 90,
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
    color: colors.text,
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
    marginTop: 0,
  },
  rabbit: {
    position: 'absolute',
    height: 70,
    top: -30,
    right: -90
  }
});