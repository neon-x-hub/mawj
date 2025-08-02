'use client';

import React, { useState } from 'react';
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
    useDisclosure,
} from '@heroui/react';
import MaskedIcon from '@/app/components/core/icons/Icon';
import { useTemplates } from '../../context/templates/templatesContext';

export const ListboxWrapper = ({ children }) => (
    <div className="flex flex-col gap-2 w-full">{children}</div>
);

export default function TemplateDirectOptions({ template }) {
    const router = useRouter();
    const { addTemplate, deleteTemplate } = useTemplates();

    // ✅ Delete confirmation modal
    const {
        isOpen: isDeleteOpen,
        onOpen: openDeleteModal,
        onOpenChange: onDeleteOpenChange
    } = useDisclosure();

    const [deleting, setDeleting] = useState(false);

    // ✅ Handle actions
    const handleAction = (key) => {
        switch (key) {
            case 'open':
                router.push(`/templates/${template.id}`);
                break;
            case 'duplicate':
                console.log(`Duplicating template: ${template.name}`);
                addTemplate({
                    ...template,
                    name: `${template.name} (Copy)`,
                    id: undefined,
                });
                break;
            case 'delete':
                openDeleteModal();
                break;
            default:
                console.warn('Unknown template action:', key);
        }
    };

    // ✅ Confirm template deletion
    const confirmDelete = async (onClose) => {
        try {
            setDeleting(true);
            await deleteTemplate(template.id);
            console.log(`✅ Template ${template.name} deleted`);
            onClose();
        } catch (err) {
            console.error('❌ Failed to delete template:', err);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            {/* ✅ Template Options List */}
            <div className="space-y-1 w-[180px] max-w-md">
                <ListboxWrapper>
                    <Listbox aria-label="Template Actions" onAction={handleAction}>

                        {/* ✅ Open Template */}
                        <ListboxItem
                            key="open"
                            startContent={<MaskedIcon src="/icons/coco/line/Export.svg" height="18px" width="18px" color="currentColor" />}
                            classNames={{ title: 'font-medium' }}
                        >
                            {t('actions.open')}
                        </ListboxItem>

                        {/* ✅ Duplicate Template */}
                        <ListboxItem
                            key="duplicate"
                            startContent={<MaskedIcon src="/icons/coco/line/Copy.svg" height="18px" width="18px" color="currentColor" />}
                            classNames={{ title: 'font-medium' }}
                            showDivider
                        >
                            {t('actions.duplicate')}
                        </ListboxItem>

                        {/* ✅ Delete Template */}
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

            {/* ✅ Delete Confirmation Modal */}
            <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {t('actions.confirm_delete')}
                            </ModalHeader>
                            <ModalBody>
                                <p>{t('messages.caution.confirm_delete', { object: template.name })}</p>
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
