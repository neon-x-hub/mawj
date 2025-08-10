'use client';

import React, { useEffect, useState } from 'react';
import { t } from '@/app/i18n';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from '@heroui/react';
import { useTemplates } from '../../context/templates/templatesContext';

export default function ChooseTemplateModal({ isOpen, onClose, onChoose, templateType }) {
    const { getTemplates } = useTemplates();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) return;

        const fetchTemplates = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getTemplates({ type: templateType });
                setTemplates(data || []);
            } catch (err) {
                console.error('Error fetching templates:', err);
                setError(t('errors.fetch_templates_failed') || 'Failed to load templates');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [isOpen, templateType]);

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onClose}
            size="md"
            backdrop="blur"
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader>{t('actions.choose_template')}</ModalHeader>
                        <ModalBody>
                            <p className="text-gray-600 mb-4">
                                {t('messages.select_template_to_start') || 'Select a template to start your project'}
                            </p>

                            {loading && <Spinner label={t('messages.loading') || 'Loading templates...'} />}
                            {error && <p className="text-red-500">{error}</p>}

                            {!loading && !error && templates.length === 0 && (
                                <p className="text-gray-500">
                                    {t('messages.no_templates_for_type') || 'No templates found for this type of project'}
                                </p>
                            )}

                            {!loading && !error && templates.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    {templates.map(template => (
                                        <Button
                                            key={template.id}
                                            className="w-full justify-between bg-gray-100 hover:bg-gray-200"
                                            onPress={() => {
                                                onChoose(template);
                                                onClose();
                                            }}
                                            endContent={
                                                <img src={template.preview || `/api/v1/templates/${template.id}/preview`} alt={`${template.name} preview`}
                                                className='h-[90%] w-auto object-contain rounded-sm'
                                                />
                                            }
                                        >
                                            {template.name}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                {t('actions.cancel')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
