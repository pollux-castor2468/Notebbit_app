import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Edit, Settings as SettingsIcon, LogOut, CheckSquare, Trash2, PenBox, X } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { useStyles } from '../../../styles';
import TopHeader from '../../../components/TopHeader';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAuthActions } from '../../../hooks/useAuthActions';
import { useFileStore } from '../../../store/useFileStore';
import { useTaskStore } from '../../../store/useTaskStore';
import { useTaskActions } from '../../../hooks/useTaskActions';

export default function Setting() {
  const { colors, layoutStyles, textStyles } = useStyles();
  const styles = getStyles(colors);
  
  const { user, profileName, profileDesc, profileAvatar } = useAuthStore();
  const { logout } = useAuthActions();
  const fileData = useFileStore(state => state.data);
  const { level } = useTaskStore();
  const { fetchTasks } = useTaskActions();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [statModal, setStatModal] = useState({ visible: false, type: null });

  // Auto-refresh tasks/level when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );

  const documentCount = fileData.filter(d => d.type === 'document' && !d.is_deleted).length;
  const diaryCount = fileData.filter(d => d.type === 'diary' && !d.is_deleted).length;

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
  };

  const renderProfileCard = () => {
    if (!user) {
      return (
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>兔</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>未登入</Text>
              <Text style={styles.profileDesc}>請登入以同步您的紀錄</Text>
            </View>
            <Pressable style={styles.loginBtn} onPress={() => router.push('/login')}>
              <Text style={styles.loginBtnText}>登入</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.profileCard}>
        <View style={styles.profileInfo}>
          {profileAvatar ? (
            <Image source={{ uri: profileAvatar }} style={styles.avatarImage} />
          ) : (
             <Image source={require('../../../assets/img/1.png')} style={styles.avatarImage} resizeMode="contain" />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profileName}</Text>
            <Text style={styles.profileDesc}>{profileDesc}</Text>
          </View>
          <Pressable style={styles.editBtn} onPress={() => router.push('/profile-edit')}>
             <PenBox size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>
    );
  };

  const renderStatModalContent = () => {
    switch (statModal.type) {
      case 'document':
        return (
          <>
            <Text style={styles.statModalTitle}>你總共建立了</Text>
            <View style={styles.statModalCountRow}>
              <Text style={styles.statModalNumber}>{documentCount}</Text>
              <Text style={styles.statModalUnit}> 篇文件</Text>
            </View>
            <Image source={require('../../../assets/img/count_rabbit1.png')} style={styles.statModalImage} resizeMode="contain" />
          </>
        );
      case 'diary':
        return (
          <>
            <Text style={styles.statModalTitle}>你總共建立了</Text>
            <View style={styles.statModalCountRow}>
              <Text style={styles.statModalNumber}>{diaryCount}</Text>
              <Text style={styles.statModalUnit}> 篇日記</Text>
            </View>
            <Image source={require('../../../assets/img/count_rabbit2.png')} style={styles.statModalImage} resizeMode="contain" />
          </>
        );
      case 'task':
        return (
          <>
            <Text style={styles.statModalTitle}>你目前的任務等級</Text>
            <View style={styles.statModalCountRow}>
              <Text style={styles.statModalUnit}>Lv. </Text>
              <Text style={styles.statModalNumber}>{level}</Text>
            </View>
            <Image source={require('../../../assets/img/count_rabbit3.png')} style={styles.statModalImage} resizeMode="contain" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TopHeader title="個人檔案" />

        {renderProfileCard()}

        <View style={styles.statsRow}>
          <Pressable style={styles.statCard} onPress={() => setStatModal({ visible: true, type: 'document' })}>
            <View style={layoutStyles.rowCenter}>
              <FileText size={18} color={colors.text} />
              <Text style={styles.statLabel}>文件</Text>
            </View>
            <Text style={styles.statValue}>{documentCount}</Text>
          </Pressable>
          <Pressable style={styles.statCard} onPress={() => setStatModal({ visible: true, type: 'diary' })}>
            <View style={layoutStyles.rowCenter}>
              <Edit size={18} color={colors.text} />
              <Text style={styles.statLabel}>日記</Text>
            </View>
            <Text style={styles.statValue}>{diaryCount}</Text>
          </Pressable>
          <Pressable style={styles.statCard} onPress={() => setStatModal({ visible: true, type: 'task' })}>
            <View style={layoutStyles.rowCenter}>
              <CheckSquare size={18} color={colors.text} />
              <Text style={styles.statLabel}>任務</Text>
            </View>
            <Text style={styles.statValue}>Lv.{level}</Text>
          </Pressable>
        </View>

        <Text style={[textStyles.h3, { marginBottom: 12 }]}>其他功能</Text>
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <Pressable style={styles.gridItem} onPress={() => router.push({ pathname: '/file-browser', params: { type: 'document' } })}>
              <View style={styles.circleIconBox}>
                <FileText size={28} color={colors.text} />
              </View>
              <Text style={styles.gridItemText}>所有文件</Text>
            </Pressable>
            <Pressable style={styles.gridItem} onPress={() => router.push({ pathname: '/file-browser', params: { type: 'diary' } })}>
              <View style={styles.circleIconBox}>
                <Edit size={28} color={colors.text} />
              </View>
              <Text style={styles.gridItemText}>所有日記</Text>
            </Pressable>
            <Pressable style={styles.gridItem} onPress={() => router.push('/trash')}>
              <View style={styles.circleIconBox}>
                <Trash2 size={28} color={colors.text} />
              </View>
              <Text style={styles.gridItemText}>刪除暫存</Text>
            </Pressable>
          </View>
          <View style={styles.gridRow}>
            <Pressable style={styles.gridItem} onPress={() => router.push('/settings-details')}>
              <View style={styles.circleIconBox}>
                <SettingsIcon size={28} color={colors.text} />
              </View>
              <Text style={styles.gridItemText}>更多設定</Text>
            </Pressable>
            <View style={styles.gridItem} />
            <View style={styles.gridItem} />
          </View>
        </View>

        {user && (
          <Pressable style={styles.logoutBtn} onPress={() => setLogoutModalVisible(true)}>
            <LogOut size={20} color={colors.errow} />
            <Text style={styles.logoutBtnText}>登出</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalContentInner}>
              <Text style={styles.modalTitle}>是否登出帳號</Text>
              <View style={styles.modalActions}>
                <Pressable style={styles.modalConfirm} onPress={handleLogout}>
                  <Text style={styles.modalConfirmText}>確認</Text>
                </Pressable>
                <Pressable style={styles.modalCancel} onPress={() => setLogoutModalVisible(false)}>
                  <Text style={styles.modalCancelText}>取消</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Stat Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={statModal.visible}
        onRequestClose={() => setStatModal({ visible: false, type: null })}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setStatModal({ visible: false, type: null })} />
          <View style={styles.statModalContainer}>
            <View style={styles.statModalContainerInner}>
              <Pressable 
                style={styles.statModalCloseBtn} 
                onPress={() => setStatModal({ visible: false, type: null })}
              >
                <X size={28} color={colors.text} />
              </Pressable>
              {renderStatModalContent()}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120, // Tab bar clearance
  },
  profileCard: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  profileDesc: {
    fontSize: 12,
    color: colors.inactiveText,
  },
  editBtn: {
    padding: 8,
  },
  loginBtn: {
    backgroundColor: colors.container,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loginBtnText: {
    fontWeight: 'bold',
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
    color: colors.text,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    color: colors.text,
  },
  gridContainer: {
    backgroundColor: colors.tertiary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 24,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
  },
  circleIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.container,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    marginBottom: 20,
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.errow,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 5,
    alignItems: 'center',
  },
  modalContentInner: {
    backgroundColor: colors.surface,
    // width: '90%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalConfirm: {
    flex: 1,
    backgroundColor: colors.container,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginRight: 8,
  },
  modalCancel: {
    flex: 1,
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.errow,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  statModalContainer: {
    width: '75%',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 5,
    alignItems: 'center',
  },
  statModalContainerInner: {
    backgroundColor: colors.surface,
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  statModalCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 10,
  },
  statModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    position: 'relative',
    top: 5,
    left: 10,
  },
  statModalCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 100,
    position: 'relative',
    // top: 5,
    left: 120,
  },
  statModalNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  statModalUnit: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  statModalImage: {
    width: 200,
    height: 150,
    position: 'absolute',
    top: 90,
    left: 50,
  },
});
