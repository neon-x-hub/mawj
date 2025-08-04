'use client'

import React from 'react'
import { t } from '@/app/i18n'
import { SectionHead } from '../../shared/SectionHead'
import { Input } from '@heroui/react'
import { useProjects } from '../../context/projects/projectsContext'
export default function DataSectionHead({ project }) {
    const { uploadProjectDataFile } = useProjects();
    return (
        <SectionHead
            title={t('common.data')}
            iconUrl={'/icons/coco/bold/Todo.svg'}
            options={{
                actions: [
                    {
                        key: 'new',
                        label: t('actions.generic.add.label', { object: t('common.data') }),
                        description: t('actions.generic.add.desc', { object: t('common.data') }),
                        icon: '/icons/coco/bold/Note-add.svg',
                        modal: {
                            title: t('actions.generic.add.label', { object: t('common.data') }),
                            actionLabel: t('actions.generic.add.label', { object: t('common.data') }),
                            content: ({ formData, handleInputChange }) => (
                                <form className="flex flex-col gap-3 border-none">
                                    {/* File Upload */}
                                    <h2>{t('actions.upload_file')}</h2>
                                    <Input
                                        type="file"
                                        name="file"
                                        accept=".csv,.json"
                                        onChange={handleInputChange}
                                    />
                                </form>
                            ),
                            action: async (data) => {
                                try {
                                    if (!data.file) {
                                        throw new Error('No file selected for upload');
                                    }

                                    console.log('Uploading data file:', data.file);

                                    const res = await uploadProjectDataFile(project.id, data.file);
                                    console.log('Data file uploaded successfully:', res);

                                } catch (err) {
                                    console.error('❌ Failed to upload data file:', err);
                                }
                            }
                        }
                    }
                    ,
                ],
                danger: [],
            }}
            onSort={() => console.log('Sort clicked')}
            search={{
                placeholder: t('common.placeholder.search', { pl: t('common.data') }),
                onSearch: (q) => console.log('Search:', q),
            }}
        />
    )
}
