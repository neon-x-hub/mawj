'use client';
import React, { useState } from 'react';
import { t } from '@/app/i18n';
import { colors } from '@/app/styles/designTokens';
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure
} from '@heroui/react';
import MaskedIcon from '../icons/Icon';

const iconClasses = 'text-xl text-default-500 pointer-events-none flex-shrink-0 w-6 h-6';

export default function ActionsDropdown({
    triggerLabel = 'Open Menu',
    actions = [],
    danger = [],
    icon = '/icons/coco/line/More.svg',
    color = '#000',
    iconSize = 30,
    IconClassName = '',
}) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [activeModal, setActiveModal] = useState(null);
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, type, files, value, multiple } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "file"
                ? (multiple ? Array.from(files) : files[0])
                : value
        }));
    };


    const handleSave = async (onClose) => {
        if (activeModal?.action) {
            setIsLoading(true);
            await activeModal.action(formData);
            setIsLoading(false);
        }
        cleanup(onClose);
    };

    const handleConfirmDanger = async (onClose) => {
        if (activeModal?.dangerAction) {
            setIsLoading(true);
            await activeModal.dangerAction();
            setIsLoading(false)
        }
        cleanup(onClose);
    };

    const cleanup = (onClose) => {
        setFormData({});
        setActiveModal(null);
        onClose();
    };

    const handleItemClick = (item, isDanger = false) => {
        if (item.modal) {
            // ✅ Custom modal provided
            setActiveModal(item.modal);
            onOpen();
        } else if (isDanger && item.do) {
            // ✅ Fallback to confirmation modal
            setActiveModal({
                title: t('actions.confirm_delete'),
                content: t('messages.confirm_delete', { object: item.label || t('common.item') }),
                dangerAction: item.do,
                closeLabel: t('actions.cancel'),
                confirmLabel: t('actions.delete')
            });
            onOpen();
        } else if (item.do) {
            item.do();
        }
    };

    return (
        <>
            <Dropdown>
                <DropdownTrigger>
                    <button>
                        {icon ? (
                            <MaskedIcon
                                src={icon}
                                color={color}
                                className={`flex-shrink-0 cursor-pointer ${IconClassName}`}
                                alt="Options Menu"
                                height={iconSize || '30px'}
                                width={iconSize || '30px'}
                            />
                        ) : triggerLabel}
                    </button>
                </DropdownTrigger>

                <DropdownMenu aria-label="Dynamic actions dropdown" variant="faded">
                    {/* ✅ Actions Section */}
                    {actions.length > 0 && (
                        <DropdownSection showDivider={danger.length > 0} title={t('actions.types.actions')}>
                            {actions.map(({ key, label, description, shortcut, do: Do, icon: Icon, modal }) => (
                                <DropdownItem
                                    key={key}
                                    className="hover:!bg-blue-50 !border-0"
                                    description={description}
                                    shortcut={shortcut}
                                    startContent={
                                        Icon ? <MaskedIcon src={Icon} className={iconClasses} color={colors.primary} /> : null
                                    }
                                    onPress={() => handleItemClick({ do: Do, modal })}
                                >
                                    <span className="font-medium">{label}</span>
                                </DropdownItem>
                            ))}
                        </DropdownSection>
                    )}

                    {/* ✅ Danger Section */}
                    {danger.length > 0 && (
                        <DropdownSection title={t('actions.types.danger_zone')}>
                            {danger.map(({ key, label, description, shortcut, do: Do, icon: Icon, modal }) => (
                                <DropdownItem
                                    key={key}
                                    className="hover:!bg-red-50 !border-0"
                                    color="danger"
                                    description={description}
                                    shortcut={shortcut}
                                    startContent={
                                        Icon ? <MaskedIcon src={Icon} className={iconClasses} color={colors.danger} /> : null
                                    }
                                    onPress={() => handleItemClick({ label, do: Do, modal }, true)}
                                >
                                    <span className="font-medium text-red-600">{label}</span>
                                </DropdownItem>
                            ))}
                        </DropdownSection>
                    )}
                </DropdownMenu>
            </Dropdown>

            {/* ✅ Modal (supports both custom and confirmation modals) */}
            {activeModal && (
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior='inside'>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>{activeModal.title}</ModalHeader>
                                <ModalBody>
                                    {activeModal.content && (
                                        typeof activeModal.content === 'string'
                                            ? <p>{activeModal.content}</p>
                                            : activeModal.content({ formData, handleInputChange })
                                    )}
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="default" variant="light" onPress={onClose}>
                                        {activeModal.closeLabel || t('actions.cancel')}
                                    </Button>

                                    {/* ✅ Confirmation Button for Danger */}
                                    {activeModal.dangerAction && (
                                        <Button color="danger" className='font-semibold text-white' isLoading={isLoading} onPress={() => handleConfirmDanger(onClose)}>
                                            {activeModal.confirmLabel || t('actions.delete')}
                                        </Button>
                                    )}

                                    {/* ✅ Regular Form Modal Save Button */}
                                    {activeModal.action && (
                                        <Button color="primary" isLoading={isLoading} className="text-white font-semibold" onPress={() => handleSave(onClose)}>
                                            {activeModal.actionLabel || t('actions.save')}
                                        </Button>
                                    )}
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            )}
        </>
    );
}
