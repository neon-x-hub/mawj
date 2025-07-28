import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@heroui/react";
import ActionButton from "./actionButton";


function ActionButtonWithOptionalModal({ label, endIconUrl, endIconSize, isPrimary, onClick, modal }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    // If no modal is provided → use normal ActionButton
    if (!modal) {
        return (
            <ActionButton
                label={label}
                endIconUrl={endIconUrl}
                endIconSize={endIconSize}
                isPrimary={isPrimary}
                onClick={onClick}
            />
        );
    }

    // If modal data exists → show modal on button press
    return (
        <>
            <ActionButton
                label={label}
                endIconUrl={endIconUrl}
                endIconSize={endIconSize}
                isPrimary={isPrimary}
                onClick={onOpen}
            />

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">{modal.title}</ModalHeader>
                            <ModalBody>
                                {typeof modal.content === 'string' ? <p>{modal.content}</p> : modal.content}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    {modal.closeLabel || 'Close'}
                                </Button>
                                {modal.action && (
                                    <Button color="primary" onPress={() => { modal.action(); onClose(); }}>
                                        {modal.actionLabel || 'Action'}
                                    </Button>
                                )}
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default ActionButtonWithOptionalModal;
