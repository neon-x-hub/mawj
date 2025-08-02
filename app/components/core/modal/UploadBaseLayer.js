'use client';
import React, { useState, useRef } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input
} from '@heroui/react';
import { t } from '@/app/i18n';
import { useTemplates } from '@/app/components/context/templates/templatesContext';
import { useLayers } from '@/app/lib/layers/context/LayerContext';

export default function UploadBaseLayerModal({ template, isOpen, onClose, force = true }) {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const { uploadBaseLayer, getTemplateById } = useTemplates();
    const { setLayers } = useLayers();

    if (!template) return null;

    /** ✅ Handle Upload */
    const handleUpload = async () => {
        const files = fileInputRef.current?.files;
        if (!files || files.length === 0) {
            setError(t('messages.error.no_file_selected'));
            return;
        }

        try {
            setUploading(true);
            setError(null);

            // Prepare FormData
            const formData = new FormData();
            Array.from(files).forEach(file => formData.append('files', file));

            // Call API to upload
            await uploadBaseLayer(template.id, formData);

            // Re-fetch template to reflect updates
            const updatedTemplate = await getTemplateById(template.id);

            if (updatedTemplate) {
                // Update layers context with new base layer
                setLayers(prev => ({
                    ...prev,
                    base: updatedTemplate.baseLayers
                }));
            }
            // ✅ Close modal on success
            onClose();
        } catch (err) {
            console.error('❌ Upload error:', err);
            setError(t('messages.error.upload_failed'));
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            isDismissable={!force}                   // ✅ allow cancel only if force is false
            isKeyboardDismissDisabled={force}       // ✅ disable ESC when force is true
            onOpenChange={!force ? onClose : () => { }} // ✅ allow closing only if cancelable
            size="md"
            backdrop="blur"
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            {t('actions.upload_base_layer')}
                        </ModalHeader>

                        <ModalBody>
                            <p className="text-gray-600 mb-4">{t('messages.upload_base_layer_info')}</p>

                            <Input
                                ref={fileInputRef}
                                type="file"
                                multiple={template?.type === 'booklet'}
                                accept="image/*"
                                className="mb-4"
                                isDisabled={uploading}
                            />

                            {error && <p className="text-red-500 text-sm">{error}</p>}
                        </ModalBody>

                        <ModalFooter>
                            {!force && (
                                <Button
                                    variant="light"
                                    color="danger"
                                    onPress={onClose}
                                    isDisabled={uploading}
                                >
                                    {t('actions.cancel')}
                                </Button>
                            )}
                            <Button
                                color="primary"
                                className="text-white font-semibold"
                                onPress={handleUpload}
                                isLoading={uploading}
                                isDisabled={uploading}
                            >
                                {uploading ? t('messages.uploading') : t('actions.upload')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
