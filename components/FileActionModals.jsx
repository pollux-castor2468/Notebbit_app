import React, { useState } from 'react';
import { Alert } from 'react-native';
import FileItemPopover from './FileItemPopover';
import RenameModal from './editor/RenameModal';
import TagModal from './editor/TagModal';
import { useFileActions } from '../hooks/useFileActions';

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
          Alert.alert(
            '刪除確認',
            '確定要刪除嗎？',
            [
              { text: '刪除', style: 'destructive', onPress: () => deleteItem(idToDelete) },
              { text: '取消', style: 'cancel' }
            ]
          );
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
    </>
  );
}
