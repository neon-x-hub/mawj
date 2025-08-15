'use client';

import React from 'react';
import { t } from '@/app/i18n';
import { useProjects } from '../../context/projects/projectsContext';
import { SectionHead } from '../../shared/SectionHead';
import { Input, Select, SelectItem } from '@heroui/react';
import ImportProjectModal from '../../core/modal/ImportProjectModal';

export default function ProjectSectionHead() {
    const { addProject, setProjects, projects, getProjects } = useProjects();

    // ✅ Available project types
    const projectTypes = [
        { key: 'card', label: t('common.project_types.card') },
        { key: 'video', label: t('common.project_types.video') },
        { key: 'booklet', label: `${t('common.template_types.booklet')} - ${t('common.soon')}` },
    ];

    const actions = [
        {
            key: 'new',
            label: t('actions.generic.add.label', { object: t('common.project') }),
            description: t('actions.generic.add.desc', { object: t('common.project') }),
            icon: '/icons/coco/bold/Note-add.svg',
            modal: {
                title: t('actions.generic.add.label', { object: t('common.project') }),
                actionLabel: t('actions.generic.add.label', { object: t('common.project') }),
                content: ({ formData, handleInputChange }) => (
                    <form>
                        {/* ✅ Project Name */}
                        <h2>{t('common.placeholder.name', { pl: t('common.the_project') })}</h2>
                        <Input
                            type="text"
                            name="name"
                            placeholder={t('common.placeholder.name', { pl: t('common.the_project') })}
                            value={formData.name || ''}
                            onChange={handleInputChange}
                            className="w-full"
                        />

                        {/* ✅ Project Description */}
                        <h2 className="mt-3">{t('common.placeholder.description', { pl: t('common.the_project') })}</h2>
                        <Input
                            type="text"
                            name="description"
                            placeholder={t('common.placeholder.description', { pl: t('common.the_project') })}
                            value={formData.description || ''}
                            onChange={handleInputChange}
                            className="w-full"
                        />

                        {/* ✅ Project Type Selector */}
                        <h2 className="mt-3">{t('common.project_types.label')}</h2>
                        <Select
                            className="w-full mt-1"
                            name="type"
                            aria-label={t('common.project_types.label')}
                            placeholder={t('common.types.select')}
                            selectedKeys={new Set([formData.type || 'card'])}
                            disabledKeys={new Set(['booklet'])}
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
                            {projectTypes.map((type) => (
                                <SelectItem key={type.key}>{type.label}</SelectItem>
                            ))}
                        </Select>

                    </form>
                ),
                action: async (data) => {
                    try {
                        console.log('Creating new project with data:', data);
                        await addProject(data);
                    } catch (err) {
                        console.error('❌ Failed to create project:', err);
                    }
                },
            },
        },
    ];

    const danger = [
        {
            key: 'delete',
            label: t('actions.generic.delete_all.label', { object: t('common.projects') }),
            description: t('actions.generic.delete_all.desc', { object: t('common.projects') }),
            icon: '/icons/coco/bold/Trash-2.svg',
            modal: {
                content: t('messages.caution.confirm_delete_all', { object: t('common.projects') }),
                title: t('actions.confirm_delete'),
                actionLabel: t('actions.delete'),
                dangerAction: async () => {
                    console.log('Deleting all projects...');
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                },
            },
        },
    ];

    return (
        <SectionHead
            iconUrl="/icons/coco/bold/Bag.svg"
            title={t('common.projects')}
            options={{ actions, danger }}
            search={{
                placeholder: t('common.placeholder.search', { pl: t('common.projects') }),
                onSearch: (q) => {
                    getProjects({ name: q }).catch((err) => console.error('Search error:', err));
                },
            }}
            onSort={(sortKey) => {
                setProjects((prev) => {
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
                    modal: {
                        title: t('actions.import'),
                        content: () => <ImportProjectModal />,
                    },
                },
            ]}
        />
    );
}
