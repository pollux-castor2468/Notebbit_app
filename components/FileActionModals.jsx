import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import FileItemPopover from './FileItemPopover';
import RenameModal from './editor/RenameModal';
import TagModal from './editor/TagModal';
import { useFileActions } from '../hooks/useFileActions';
import { useStyles } from '../styles';

export function useFileActionModals() {
  const [activePopover, setActivePopover] = useState(null); // { id, type, title }
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const [renameModalData, setRenameModalData] = useState(null); // { id, title }
  const [tagModalData, setTagModalData] = useState(null); // { id }

  const openPopover = (item, x, y) => {
    setPopoverPos({ x, y });
    setActivePopover({ id: item.id, type: item.type, title: item.title });
  };
 
  const closePopover = () => setActivePopover(null);

  const modalProps = {
    activePopover,
    popoverPos,
    renameModalData,
    tagModalData,
    setActivePopover,
    setRenameModalData,
    setTagModalData,
    closePopover,
  };

  return { openPopover, closePopover, modalProps };
}

export function FileActionModals({
  activePopover,
  popoverPos,
  renameModalData,
  tagModalData,
  setActivePopover,
  setRenameModalData,
  setTagModalData,
  closePopover,
}) {
  const { updateFile, deleteItem } = useFileActions();
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteID, setDeleteID] = useState(null);
  const { colors, textStyles } = useStyles();
  const styles = getStyles(colors);

  return (
    <>
      <FileItemPopover
        visible={!!activePopover}
        type={activePopover?.type}
        popoverPos={popoverPos}
        onClose={closePopover}
        onRename={() => {
          setRenameModalData(activePopover);
          setActivePopover(null);
        }}
        onSetTag={() => {
          setTagModalData(activePopover);
          setActivePopover(null);
        }}
        onDelete={() => {
          const idToDelete = activePopover.id;
          setActivePopover(null);
          setDeleteID(idToDelete);
          setDeleteModal(true);
          // Alert.alert(
          //   '刪除確認',
          //   '確定要刪除嗎？',
          //   [
          //     { text: '刪除', style: 'destructive', onPress: () => deleteItem(idToDelete) },
          //     { text: '取消', style: 'cancel' }
          //   ]
          // );
        }}
      />

      <RenameModal
        visible={!!renameModalData}
        initialTitle={renameModalData?.title}
        onClose={() => setRenameModalData(null)}
        onConfirm={(newTitle) => {
          if (renameModalData?.id && newTitle.trim()) {
            updateFile(renameModalData.id, { title: newTitle.trim() });
          }
          setRenameModalData(null);
        }}
      />

      <TagModal
        visible={!!tagModalData}
        fileId={tagModalData?.id}
        onClose={() => setTagModalData(null)}
      />

      <Modal transparent visible={deleteModal} animationType="fade" onRequestClose={() => setDeleteModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setDeleteModal(false)}>
          <Pressable style={styles.modalContent}>
            <View style={styles.modalContentInner}>
              <Text style={[textStyles.h3, { marginBottom: 16 }]}>是否刪除</Text>
              {/* <Text style={{ color: colors.text, marginBottom: 20 }}>確定要刪除這個項目嗎？</Text> */}
              <View style={styles.modalBtnRow}>
                <Pressable style={styles.modalBtnCancel} onPress={() => setDeleteModal(false)}>
                  <Text style={styles.modalBtnCancelText}>取消</Text>
                </Pressable>
                <Pressable
                  style={styles.modalBtnConfirm}
                  onPress={() => {
                    if (deleteID) {
                      deleteItem(deleteID);
                    }
                    // deleteItem(deleteID);
                    setDeleteModal(false);
                    setDeleteID(null);
                  }}
                >
                  <Text style={styles.modalBtnConfirmText}>確認</Text>
                </Pressable>
              </View>
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
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: {
   width: 300,
   backgroundColor: colors.surfaceVariant, 
   borderRadius: 20, 
   padding: 5, 
   borderWidth: 1, 
   borderColor: colors.border 
  },
  modalContentInner: {
    backgroundColor: colors.surface,
    // width: '90%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  modalBtnRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 12 
  },
  modalBtnCancel: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 10, 
    backgroundColor: colors.tertiary,
    borderWidth: 1, 
    borderColor: colors.border 
  },
  modalBtnConfirm: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 10, 
    backgroundColor: colors.secondary, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  modalBtnCancelText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: colors.text 
  },
  modalBtnConfirmText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: colors.text 
  },
});