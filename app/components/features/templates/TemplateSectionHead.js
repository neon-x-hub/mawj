'use client';

import React from 'react';
import { t } from '@/app/i18n';
import { useTemplates } from '../../context/templates/templatesContext';
import { SectionHead } from '../../shared/SectionHead';
import { Input, Select, SelectItem } from '@heroui/react';

export default function TemplateSectionHead() {
    const { addTemplate, setTemplates, templates, getTemplates } = useTemplates();

    // ✅ Available template types
    const templateTypes = [
        { key: 'card', label: t('common.template_types.card') },
        { key: 'video', label: t('common.template_types.video') },
        { key: 'booklet', label: t('common.template_types.booklet') },
    ];

    const actions = [
        {
            key: 'new',
            label: t('actions.generic.add.label', { object: t('common.template') }),
            description: t('actions.generic.add.desc', { object: t('common.template') }),
            icon: '/icons/coco/bold/Note-add.svg',
            modal: {
                title: t('actions.generic.add.label', { object: t('common.template') }),
                actionLabel: t('actions.generic.add.label', { object: t('common.template') }),
                content: ({ formData, handleInputChange }) => (
                    <form>
                        {/* ✅ Template Name */}
                        <h2>{t('common.placeholder.name', { pl: t('common.the_template') })}</h2>
                        <Input
                            type="text"
                            name="name"
                            placeholder={t('common.placeholder.name', { pl: t('common.the_template') })}
                            value={formData.name || ''}
                            onChange={handleInputChange}
                            className="w-full"
                        />

                        {/* ✅ Template Description */}
                        <h2 className="mt-3">{t('common.placeholder.description', { pl: t('common.the_template') })}</h2>
                        <Input
                            type="text"
                            name="description"
                            placeholder={t('common.placeholder.description', { pl: t('common.the_template') })}
                            value={formData.description || ''}
                            onChange={handleInputChange}
                            className="w-full"
                        />

                        {/* ✅ Template Type Selector */}
                        <h2 className="mt-3">{t('common.template_types.label')}</h2>
                        <Select
                            className="w-full mt-1"
                            name="type"
                            aria-label={t('common.template_types.label')}
                            placeholder={t('common.types.select')}
                            selectedKeys={new Set([formData.type || 'card'])}
                            onSelectionChange={(keys) => {
                                const selectedType = Array.from(keys)[0];
                                handleInputChange({
                                    target: {
                                        name: 'type',
                                        value: selectedType,
                                    },
                                });
                            }}
                        >
                            {templateTypes.map((type) => (
                                <SelectItem key={type.key}>{type.label}</SelectItem>
                            ))}
                        </Select>
                    </form>
                ),
                action: async (data) => {
                    try {
                        console.log('Creating new template with data:', data);
                        await addTemplate(data);
                    } catch (err) {
                        console.error('❌ Failed to create template:', err);
                    }
                },
            },
        },
    ];

    const danger = [
        {
            key: 'delete',
            label: t('actions.generic.delete_all.label', { object: t('common.templates') }),
            description: t('actions.generic.delete_all.desc', { object: t('common.templates') }),
            icon: '/icons/coco/bold/Trash-2.svg',
            modal: {
                content: t('messages.caution.confirm_delete_all', { object: t('common.templates') }),
                title: t('actions.confirm_delete'),
                actionLabel: t('actions.delete'),
                dangerAction: async () => {
                    console.log('Deleting all templates...');
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                },
            },
        },
    ];

    return (
        <SectionHead
            iconUrl="/icons/coco/bold/Note.svg"
            title={t('common.templates')}
            options={{ actions, danger }}
            search={{
                placeholder: t('common.placeholder.search', { pl: t('common.templates') }),
                onSearch: (q) => {
                    getTemplates({ name: q }).catch((err) => console.error('Search error:', err));
                },
            }}
            onSort={(sortKey) => {
                setTemplates((prev) => {
                    const sorted = [...prev].sort((a, b) => {
                        const valA = a[sortKey];
                        const valB = b[sortKey];

                        if (valA == null) return 1;
                        if (valB == null) return -1;

                        if (sortKey === 'createdAt' || sortKey === 'updatedAt') {
                            return new Date(valB) - new Date(valA); // newest first
                        }

                        return String(valA).localeCompare(String(valB), 'ar', { sensitivity: 'base' });
                    });
                    return sorted;
                });
            }}
            buttons={[
                {
                    key: 'import',
                    label: t('actions.import'),
                    endIconUrl: '/icons/coco/line/Import.svg',
                    isPrimary: true,
                    onClick: () => console.log('Import clicked'),
                    endIconSize: '18px',
                },
            ]}
        />
    );
}
