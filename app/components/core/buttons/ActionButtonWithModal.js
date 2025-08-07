import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@heroui/react";
import { useState } from "react";
import ActionButton from "./actionButton";

function ActionButtonWithOptionalModal({ label, endIconUrl, endIconSize, isPrimary, onClick, modal, ...props }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [formData, setFormData] = useState({}); // <-- store form data here
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (onClose) => {
        if (modal?.action) {
            setIsLoading(true);
            await modal.action(formData);
            setIsLoading(false);
        }
        onClose();
    };

    if (!modal) {
        return (
            <ActionButton
                label={label}
                endIconUrl={endIconUrl}
                endIconSize={endIconSize}
                isPrimary={isPrimary}
                onClick={onClick}
                {...props}
            />
        );
    }

    return (
        <>
            <ActionButton
                label={label}
                endIconUrl={endIconUrl}
                endIconSize={endIconSize}
                isPrimary={isPrimary}
                onClick={onOpen}
                {...props}
            />

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>{modal.title}</ModalHeader>
                            <ModalBody>
                                {/* If modal.content is a custom component, pass down handlers */}
                                {modal.content ? (
                                    typeof modal.content === "string" ? (
                                        <p>{modal.content}</p>
                                    ) : (
                                        modal.content({ formData, handleInputChange })
                                    )
                                ) : null
                                }
                            </ModalBody>
                            <ModalFooter>
                                {modal.hasCancelButton && <Button color="danger" variant="light" onPress={onClose} disabled={isLoading}>
                                    {modal.closeLabel || "Close"}
                                </Button>}
                                {modal.action && (
                                    <Button
                                        color={modal.isDanger ? "danger" : "primary"}
                                        className="text-white font-semibold"
                                        onPress={() => handleSave(onClose)}
                                        isLoading={isLoading}
                                    >
                                        {modal.actionLabel || "Save"}
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
