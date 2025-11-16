'use client'

import React from 'react'
import { t } from '@/app/i18n'
import { SectionHead } from '../../shared/SectionHead'
import { addToast, Input } from '@heroui/react'
import { useProjects } from '../../context/projects/projectsContext'
import AddRowDynamicModal from '../../core/modal/AddRowDynamicModal'
export default function DataSectionHead({ project, data, setData }) {
    const { uploadProjectDataFile, addProjectData } = useProjects();
    return (
        <SectionHead
            title={t('common.data')}
            iconUrl={'/icons/coco/bold/Todo.svg'}
            options={{
                actions: [
                    {
                        key: 'new',
                        label: t('actions.generic.upload.label', { object: t('common.data') }),
                        description: t('actions.generic.upload.desc', { object: t('common.data') }),
                        icon: '/icons/coco/bold/Arrow-Top-3.svg',
                        modal: {
                            title: t('actions.generic.upload.label', { object: t('common.data') }),
                            actionLabel: t('actions.generic.upload.label', { object: t('common.data') }),
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
                                        addToast({
                                            title: 'لم يتم تحديد أي ملف',
                                            color: 'danger',
                                        });
                                        return
                                    }

                                    const res = await uploadProjectDataFile(project.id, data.file);

                                    window.location.reload();

                                } catch (err) {
                                    console.error('❌ Failed to upload data file:', err);
                                }
                            }
                        }
                    },
                    {
                        label: t('actions.generic.add.label', { object: t('common.data') }),
                        description: t('actions.generic.add.desc', { object: t('common.data') }),
                        icon: '/icons/coco/bold/Add.svg',
                        modal: {
                            title: t('actions.generic.add.label', { object: t('common.data') }),
                            actionLabel: t('actions.generic.add.label', { object: t('common.data') }),
                            content: ({ formData, handleInputChange }) => (
                                <AddRowDynamicModal project={project} formData={formData} handleInputChange={handleInputChange} />
                            ),
                            action: async (data) => {
                                try {
                                    const res = await addProjectData(project.id, [data]);
                                    console.log('Data added successfully:', res);
                                    window.location.reload();
                                } catch (err) {
                                    console.error('❌ Failed to add data:', err);
                                }
                            }
                        }
                    }
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
