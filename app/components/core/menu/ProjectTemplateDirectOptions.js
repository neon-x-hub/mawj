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
    Select,
    SelectItem,
    useDisclosure,
} from '@heroui/react';
import MaskedIcon from '@/app/components/core/icons/Icon';
import { useProjects } from '../../context/projects/projectsContext';
import { useTemplates } from '../../context/templates/templatesContext';

export const ListboxWrapper = ({ children }) => (
    <div className="flex flex-col gap-2 w-full">{children}</div>
);

export default function ProjectTemplateOptions({ project }) {
    const router = useRouter();
    const { templates } = useTemplates();
    const { updateProject } = useProjects();


    const { isOpen, onOpen, onOpenChange } = useDisclosure(); // Change Template Modal
    const {
        isOpen: isRemoveOpen,
        onOpen: openRemoveModal,
        onOpenChange: onRemoveOpenChange,
    } = useDisclosure(); // Confirm Removal Modal


    const [selectedTemplate, setSelectedTemplate] = useState(project.template || null);
    const [loading, setLoading] = useState(false);
    const [removing, setRemoving] = useState(false);


    const handleAction = (key) => {
        switch (key) {
            case 'open-template-editor':
                if (selectedTemplate) {
                    router.push(`/templates/${selectedTemplate}`);
                } else {
                    console.warn('No template associated with this project');
                }
                break;
            case 'change-template':
                onOpen();
                break;
            case 'remove-template':
                openRemoveModal();
                break;
            default:
                console.warn('Unknown template action:', key);
        }
    };


    const removeTemplate = async (onClose) => {
        try {
            setRemoving(true);
            await updateProject(project.id, { template: null });
            setSelectedTemplate(null);

            window.location.reload();
            onClose();
        } catch (err) {
            console.error('❌ Failed to remove template:', err);
        } finally {
            setRemoving(false);
        }
    };


    const saveTemplate = async (onClose) => {
        try {
            setLoading(true);
            await updateProject(project.id, { template: selectedTemplate });

            onClose();
        } catch (err) {
            console.error('❌ Failed to change template:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>

            <div className="space-y-1 w-[180px] max-w-md">
                <ListboxWrapper>
                    <Listbox aria-label="Template Actions" onAction={handleAction}>


                        <ListboxItem
                            key="open-template-editor"
                            startContent={<MaskedIcon src="/icons/coco/line/Export.svg" height="18px" width="18px" color={"currentColor"} />}
                            classNames={{ title: 'font-medium' }}
                        >
                            {t('actions.open')}
                        </ListboxItem>


                        <ListboxItem
                            key="change-template"
                            startContent={
                                <MaskedIcon
                                    src="/icons/coco/line/Swap.svg"
                                    height="18px" width="18px"
                                    color={"currentColor"}
                                />
                            }
                            classNames={{ title: 'font-medium' }}
                        >
                            {t('actions.swap')}
                        </ListboxItem>


                        <ListboxItem
                            key="remove-template"
                            color="danger"
                            startContent={
                                <MaskedIcon
                                    src="/icons/haicon/line/x-mark.svg"
                                    height="18px"
                                    width="18px"
                                    color={"currentColor"}
                                    className="group-hover:text-white"
                                />
                            }
                            classNames={{
                                wrapper: 'group text-danger',
                                title: 'group-hover:text-white font-medium',
                            }}
                        >
                            {t('actions.remove')}
                        </ListboxItem>

                    </Listbox>
                </ListboxWrapper>
            </div>


            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{t('templates.change_template')}</ModalHeader>
                            <ModalBody>
                                <p className="text-sm opacity-70 mb-2">{t('messages.select_template_for_project')}</p>

                                <Select
                                    label={t('templates.available_templates')}
                                    placeholder={t('templates.select_placeholder')}
                                    selectedKeys={selectedTemplate ? [selectedTemplate] : []}
                                    onSelectionChange={(keys) => setSelectedTemplate(Array.from(keys)[0])}
                                    className="w-full"
                                    items={templates}
                                >
                                    {(template) => <SelectItem key={template.id}>{template.name}</SelectItem>}
                                </Select>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>{t('actions.cancel')}</Button>
                                <Button
                                    color="primary"
                                    isLoading={loading}
                                    isDisabled={!selectedTemplate}
                                    onPress={() => saveTemplate(onClose)}
                                    className="font-semibold text-white"
                                >
                                    {t('actions.save')}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>


            <Modal isOpen={isRemoveOpen} onOpenChange={onRemoveOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {t('templates.confirm_remove')}
                            </ModalHeader>
                            <ModalBody>
                                <p>{t('messages.caution.confirm_remove_template', { object: project.name })}</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    {t('actions.cancel')}
                                </Button>
                                <Button
                                    color="danger"
                                    isLoading={removing}
                                    className="font-medium text-white"
                                    onPress={() => removeTemplate(onClose)}
                                >
                                    {t('actions.remove')}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
