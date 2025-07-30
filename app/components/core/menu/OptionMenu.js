'use client';
import React, { useState } from 'react';
// I18N
import { t } from '@/app/i18n';
// Design Tokens
import { colors } from '@/app/styles/designTokens';
// Components
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
    const [activeModal, setActiveModal] = useState(null);   // stores modal data for clicked action
    const [formData, setFormData] = useState({});           // stores form data

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (onClose) => {
        if (activeModal?.action) {
            await activeModal.action(formData);
        }
        setFormData({});
        setActiveModal(null);
        onClose();
    };

    const handleItemClick = (item) => {
        if (item.modal) {
            setActiveModal(item.modal);
            onOpen(); // open modal instead of executing directly
        } else if (item.do) {
            item.do(); // normal action execution
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
                    {/* Actions Section */}
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

                    {/* Danger Section */}
                    {danger.length > 0 && (
                        <DropdownSection title={t('actions.types.danger_zone')}>
                            {danger.map(({ key, label, description, shortcut, icon: Icon, modal }) => (
                                <DropdownItem
                                    key={key}
                                    className="hover:!bg-red-50 !border-0"
                                    color="danger"
                                    description={description}
                                    shortcut={shortcut}
                                    startContent={
                                        Icon ? <MaskedIcon src={Icon} className={iconClasses} color={colors.danger} /> : null
                                    }
                                    onPress={() => handleItemClick({ modal })}
                                >
                                    <span className="font-medium text-red-600">{label}</span>
                                </DropdownItem>
                            ))}
                        </DropdownSection>
                    )}
                </DropdownMenu>
            </Dropdown>

            {/* Modal for Actions with Forms */}
            {activeModal && (
                <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>{activeModal.title}</ModalHeader>
                                <ModalBody>
                                    {activeModal.content ? (
                                        typeof activeModal.content === 'string' ? (
                                            <p>{activeModal.content}</p>
                                        ) : (
                                            // ✅ If content is a function, pass state & handlers
                                            activeModal.content({ formData, handleInputChange })
                                        )
                                    ) : (
                                        // ✅ Default form fallback
                                        <form className="space-y-2">
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Enter name"
                                                onChange={handleInputChange}
                                                className="border p-2 w-full"
                                            />
                                        </form>
                                    )}
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        {activeModal.closeLabel || t('actions.cancel')}
                                    </Button>
                                    {activeModal.action && (
                                        <Button
                                            color="primary"
                                            className="text-white font-semibold"
                                            onPress={() => handleSave(onClose)}
                                        >
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
