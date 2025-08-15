'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@/app/i18n';
import {
    Listbox,
    ListboxItem,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Select,
    SelectItem,
    useDisclosure,
} from '@heroui/react';
import MaskedIcon from '@/app/components/core/icons/Icon';
import { useFolders } from '../../context/folders/foldersContext';
import { useProjects } from '../../context/projects/projectsContext';

export const ListboxWrapper = ({ children }) => (
    <div className="flex flex-col gap-2 w-full">{children}</div>
);

export default function ProjectDirectOptions({ project }) {
    const router = useRouter();
    const { folders } = useFolders();
    const { addProject, deleteProject } = useProjects();

    // ✅ Modals
    const { isOpen, onOpen, onOpenChange } = useDisclosure(); // Folder modal
    const {
        isOpen: isDeleteOpen,
        onOpen: openDeleteModal,
        onOpenChange: onDeleteOpenChange
    } = useDisclosure(); // Delete confirmation modal

    // ✅ State
    const [selectedFolders, setSelectedFolders] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // ✅ Fetch folders this project belongs to
    useEffect(() => {
        const fetchProjectFolders = async () => {
            try {
                const res = await fetch(`/api/v1/projects/${project.id}/folders`);
                if (!res.ok) throw new Error('Failed to load project folders');
                const data = await res.json();
                setSelectedFolders(new Set(data.data.map((f) => f.id)));
            } catch (err) {
                console.error('❌ Failed to fetch project folders:', err);
            }
        };
        fetchProjectFolders();
    }, [project.id]);

    // ✅ Handle actions
    const handleAction = (key) => {
        switch (key) {
            case 'open':
                router.push(`/projects/${project.id}`);
                break;
            case 'folders':
                onOpen();
                break;
            case 'duplicate':
                console.log(`Duplicating project: ${project.name}, it has folders: ${project.folders}`);
                addProject({
                    ...project,
                    name: `${project.name} (Copy)`,
                });
                break;
            case 'delete':
                openDeleteModal();
                break;
            default:
                console.warn('Unknown project action:', key);
        }
    };

    // ✅ Save updated folder associations in bulk
    const handleSaveFolders = async (onClose) => {
        try {
            setLoading(true);
            const folderArray = Array.from(selectedFolders);
            console.log(`Saving folders for project ${project.id}:`, folderArray);

            const res = await fetch(`/api/v1/projects/${project.id}/folders`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folders: folderArray }),
            });

            if (!res.ok) throw new Error('Failed to update project folders');
            console.log('✅ Project folders updated');
            onClose();
        } catch (err) {
            console.error('❌ Update failed:', err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Confirm project deletion
    const confirmDelete = async (onClose) => {
        try {
            setDeleting(true);
            await deleteProject(project.id);
            onClose();
        } catch (err) {
            console.error('❌ Failed to delete project:', err);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            {/* ✅ Project Options List */}
            <div className="space-y-1 w-[180px] max-w-md">
                <ListboxWrapper>
                    <Listbox aria-label="Project Actions" onAction={handleAction}>

                        {/* ✅ Open Project */}
                        <ListboxItem
                            key="open"
                            startContent={<MaskedIcon src="/icons/coco/line/Export.svg" height="18px" width="18px" color="currentColor" />}
                            classNames={{ title: 'font-medium' }}
                        >
                            {t('actions.open')}
                        </ListboxItem>

                        {/* ✅ Add to Folder */}
                        <ListboxItem
                            key="folders"
                            startContent={<MaskedIcon src="/icons/coco/line/Folder.svg" height="18px" width="18px" color="currentColor" />}
                            classNames={{ title: 'font-medium' }}
                        >
                            {t('common.folders')}
                        </ListboxItem>

                        {/* ✅ Duplicate Project */}
                        <ListboxItem
                            key="duplicate"
                            startContent={<MaskedIcon src="/icons/coco/line/Copy.svg" height="18px" width="18px" color="currentColor" />}
                            classNames={{ title: 'font-medium' }}
                            showDivider
                        >
                            {t('actions.duplicate')}
                        </ListboxItem>

                        {/* ✅ Delete Project */}
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

            {/* ✅ Folder Management Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{t('actions.manage_folders')}</ModalHeader>
                            <ModalBody>
                                <p className="text-sm opacity-70 mb-2">{t('messages.select_folders_for_project')}</p>

                                {/* ✅ Multi-select for folders */}
                                <Select
                                    label={t('common.folders')}
                                    placeholder={t('common.placeholder.select_folders')}
                                    selectionMode="multiple"
                                    selectedKeys={selectedFolders}
                                    onSelectionChange={setSelectedFolders}
                                    className="w-full"
                                    items={folders}
                                >
                                    {(folder) => <SelectItem key={folder.id}>{folder.name}</SelectItem>}
                                </Select>

                                {/* ✅ Display currently selected folders */}
                                <div className="mt-4">
                                    <h3 className="font-semibold mb-2">{t('common.current_folders')}</h3>
                                    {Array.from(selectedFolders).length > 0 ? (
                                        <ul className="space-y-1">
                                            {Array.from(selectedFolders).map((fid) => {
                                                const folder = folders.find((f) => f.id === fid);
                                                return (
                                                    <li key={fid} className="flex justify-between items-center border-b pb-1">
                                                        <span>{folder?.name || fid}</span>
                                                        <Button size="sm" color="danger" variant="light" onPress={() => {
                                                            setSelectedFolders((prev) => {
                                                                const updated = new Set(prev);
                                                                updated.delete(fid);
                                                                return updated;
                                                            });
                                                        }}>
                                                            {t('actions.remove')}
                                                        </Button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">{t('messages.no_folders_assigned')}</p>
                                    )}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>{t('actions.cancel')}</Button>
                                <Button color="primary" isLoading={loading} onPress={() => handleSaveFolders(onClose)} className='font-semibold text-white'>
                                    {t('actions.save')}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* ✅ Delete Confirmation Modal */}
            <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {t('actions.confirm_delete')}
                            </ModalHeader>
                            <ModalBody>
                                <p>{t('messages.caution.confirm_delete', { object: project.name })}</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    {t('actions.cancel')}
                                </Button>
                                <Button color="danger" isLoading={deleting} className="font-medium text-white" onPress={() => confirmDelete(onClose)}>
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
