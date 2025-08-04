import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@heroui/react";
import { useState } from "react";
import ActionButton from "./actionButton";

function ActionButtonWithOptionalModal({ label, endIconUrl, endIconSize, isPrimary, onClick, modal, ...props }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [formData, setFormData] = useState({}); // <-- store form data here

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = (onClose) => {
        if (modal?.action) {
            modal.action(formData);
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
                                ) : (
                                    // Default form example
                                    <form className="space-y-2">
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Enter name"
                                            onChange={handleInputChange}
                                            className="border p-2 w-full"
                                        />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Enter email"
                                            onChange={handleInputChange}
                                            className="border p-2 w-full"
                                        />
                                    </form>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    {modal.closeLabel || "Close"}
                                </Button>
                                {modal.action && (
                                    <Button
                                        color="primary"
                                        className="text-white font-semibold"
                                        onPress={() => handleSave(onClose)}
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
