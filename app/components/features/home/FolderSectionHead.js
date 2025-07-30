import React from 'react'
// I18N
import { t } from '@/app/i18n'

// Components
import { SectionHead } from '../../shared/SectionHead'
import { Input } from '@heroui/react';


const actions = [
    {
        key: 'new',
        label: t('actions.generic.add.label', { object: t('common.folder') }),
        description: t('actions.generic.add.desc', { object: t('common.folder') }),
        icon: '/icons/coco/bold/Note-add.svg',
        modal: {
            title: t('actions.generic.add.label', { object: t('common.folder') }),
            actionLabel: t('actions.generic.add.label', { object: t('common.folder') }),
            content: ({ formData, handleInputChange }) => (
                <form className="">
                    <h2>{t('common.placeholder.name', { pl: t('common.the_folder') })}</h2>
                    <Input
                        type="text"
                        name="name"
                        placeholder={t('common.placeholder.name', { pl: t('common.the_folder') })}
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="w-full"
                    />
                    <h2 className='mt-3'>{t('common.placeholder.description', { pl: t('common.the_folder') })}</h2>
                    <Input
                        type="text"
                        name="description"
                        placeholder={t('common.placeholder.description', { pl: t('common.the_folder') })}
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        className="w-full"
                    />
                </form>
            ),
            action: async (data) => {
                try {
                    const response = await fetch('/api/v1/folders', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const result = await response.json();
                    console.log('✅ Folder created successfully:', result);
                    // You might also trigger a toast or refresh data here
                } catch (error) {
                    console.error('❌ Failed to create folder:', error);
                    // Optionally handle error UI feedback
                }
            },
        },
    },
];


const danger = [
    {
        key: 'delete',
        label: 'Delete file',
        description: 'Permanently delete the file',
        icon: '/icons/coco/bold/Note-add.svg',
    },
];

export default function FolderSectionHead() {
    return (
        <SectionHead
            iconUrl="/icons/coco/bold/Folder.svg"
            title={t('common.sections.folders')}
            options={{
                actions: actions,
                danger: danger,
            }}
            search={{
                placeholder: t('common.placeholder.search', { pl: t('common.sections.folders') }),
                onSearch: (q) => console.log('Search:', q),
            }}
            onSort={() => console.log('Sort clicked')}
            onFilter={() => console.log('Filter clicked')}
        />
    )
}
