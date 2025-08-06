'use client'

import React from 'react'
import { t } from '@/app/i18n'
import { SectionHead } from '../../shared/SectionHead'
import { Input } from '@heroui/react'
import { useProjects } from '../../context/projects/projectsContext'
export default function DataSectionHead({ project, data, setData }) {
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

                                    window.location.reload();

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
            search={{
                placeholder: t('common.placeholder.search', { pl: t('common.data') }),
                onSearch: async (q) => {

                    // ✅ Regex to match key:'value', 'key':value, key:value, etc.
                    const regex = /'([^']+)'\s*:\s*'([^']+)'|'([^']+)'\s*:\s*(\S+)|(\w+)\s*:\s*'([^']+)'|(\w+)\s*:\s*(\S+)/g;
                    const params = {};

                    let match;
                    while ((match = regex.exec(q)) !== null) {
                        const key = match[1] || match[3] || match[5] || match[7];
                        const value = match[2] || match[4] || match[6] || match[8];
                        params[key] = value;
                    }

                    const queryString = new URLSearchParams(params).toString();

                    try {
                        const res = await fetch(`/api/v1/projects/${project.id}/data?${queryString}`);
                        if (!res.ok) throw new Error('Failed to fetch project data');

                        const result = await res.json();
                        console.log('Fetched Data:', result);
                        const apiRows = result.data.map((doc) => ({
                            key: doc.id,
                            status: doc.status,
                            ...doc.data,
                        }));

                        setData(apiRows);
                    } catch (error) {
                        console.error('Search error:', error);
                    }
                }

            }}
        />
    )
}
