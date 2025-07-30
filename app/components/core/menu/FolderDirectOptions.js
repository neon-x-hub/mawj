'use client';

import React, { useState } from 'react';
import { t } from '@/app/i18n';
import { Listbox, ListboxItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from '@heroui/react';
import MaskedIcon from '@/app/components/core/icons/Icon';
import { useFolders } from '../../context/folders/foldersContext';

export const ListboxWrapper = ({ children }) => (
    <div className="flex flex-col gap-2 w-full">{children}</div>
);

export default function FolderDirectOptions({ folder }) {

    const { addFolder, deleteFolder } = useFolders();
    const [isLoading, setIsLoading] = useState(false);

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleFolderAction = (key) => {
        switch (key) {
            case 'open':
                console.log(`📂 Opening folder: ${folder?.name}`);
                window.location.href = `/projects?f=${folder.id}`;
                break;

            case 'duplicate':
                console.log(`✏️ Duplicating folder: ${folder?.name}`);
                addFolder({
                    name: `${folder.name} (Copy)`,
                    description: folder.description,
                });
                break;

            case 'delete':
                onOpen(); // ✅ open modal
                break;

            default:
                console.warn('Unknown folder action:', key);
        }
    };

    const confirmDelete = async (onClose) => {
        setIsLoading(true);
        await deleteFolder(folder.id);
        setIsLoading(false);
        onClose();
    };

    return (
        <>
            <div className="space-y-1 w-[150px] max-w-md">
                <ListboxWrapper>
                    <Listbox aria-label="Folder Actions" onAction={handleFolderAction}>

                        {/* ✅ Open Folder */}
                        <ListboxItem
                            key="open"
                            startContent={<MaskedIcon src="/icons/coco/line/Export.svg" height="18px" width="18px" color="currentColor" />}
                            classNames={{ title: 'font-medium' }}
                        >
                            {t('actions.open')}
                        </ListboxItem>

                        {/* ✅ Duplicate Folder */}
                        <ListboxItem
                            key="duplicate"
                            startContent={<MaskedIcon src="/icons/coco/line/Copy.svg" height="18px" width="18px" color="currentColor" />}
                            classNames={{ title: 'font-medium' }}
                            showDivider
                        >
                            {t('actions.duplicate')}
                        </ListboxItem>

                        {/* ✅ Delete Folder */}
                        <ListboxItem
                            key="delete"
                            color="danger"
                            startContent={
                                <MaskedIcon
                                    src="/icons/coco/line/Trash-2.svg"
                                    height="18px"
                                    width="18px"
                                    color="currentColor"
                                    className="group-hover:text-white"
                                />
                            }
                            classNames={{
                                wrapper: 'group text-danger',
                                title: 'group-hover:text-white font-medium',
                            }}
                        >
                            {t('actions.delete')}
                        </ListboxItem>

                    </Listbox>
                </ListboxWrapper>
            </div>

            {/* ✅ Confirmation Modal (fixed) */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {t('actions.confirm_delete')}
                            </ModalHeader>
                            <ModalBody>
                                <p>{t('messages.caution.confirm_delete', { object: folder.name })}</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    {t('actions.cancel')}
                                </Button>
                                <Button color="danger" isLoading={isLoading} className='font-medium text-white' onPress={() => confirmDelete(onClose)}>
                                    {t('actions.delete')}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
