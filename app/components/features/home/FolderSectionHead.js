'use client';

import React from 'react';
import { t } from '@/app/i18n';
import { useFolders } from '../../context/folders/foldersContext';
import { SectionHead } from '../../shared/SectionHead';
import { Input } from '@heroui/react';

export default function FolderSectionHead() {
    const { addFolder, setFolders, folders } = useFolders();
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
                    <form>
                        <h2>{t('common.placeholder.name', { pl: t('common.the_folder') })}</h2>
                        <Input
                            type="text"
                            name="name"
                            placeholder={t('common.placeholder.name', { pl: t('common.the_folder') })}
                            value={formData.name || ''}
                            onChange={handleInputChange}
                            className="w-full"
                        />
                        <h2 className="mt-3">{t('common.placeholder.description', { pl: t('common.the_folder') })}</h2>
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
                        await addFolder(data); // ✅ use context method
                    } catch (err) {
                        console.error('❌ Failed to create folder:', err);
                    }
                },
            },
        },
    ];

    const danger = [
        {
            key: 'delete',
            label: t('actions.generic.delete_all.label', { object: t('common.folders') }),
            description: t('actions.generic.delete_all.desc', { object: t('common.folders') }),
            icon: '/icons/coco/bold/Trash-2.svg',
            modal: {
                content: t('messages.caution.confirm_delete_all', { object: t('common.folders') }),
                title: t('actions.confirm_delete'),
                actionLabel: t('actions.delete'),
                dangerAction: async () => {
                    console.log('Deleting file...');
                    // Implement delete logic here
                    // wait for 3 seconds
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                },

            }
        },
    ];

    return (
        <SectionHead
            iconUrl="/icons/coco/bold/Folder.svg"
            title={t('common.sections.folders')}
            options={{ actions, danger }}
            search={{
                placeholder: t('common.placeholder.search', { pl: t('common.sections.folders') }),
                onSearch: (q) => console.log('Search:', q),
            }}
            onSort={(sortKey) => {
                console.log(`Sorting folders by ${sortKey}`);

                setFolders((prev) => {
                    const sorted = [...prev].sort((a, b) => {
                        const valA = a[sortKey];
                        const valB = b[sortKey];

                        if (valA == null) return 1;
                        if (valB == null) return -1;

                        if (sortKey === 'createdAt' || sortKey === 'updatedAt') {
                            // newest first
                            return new Date(valB) - new Date(valA);
                        }

                        // For names, handle Arabic locale
                        return String(valA).localeCompare(String(valB), 'ar', { sensitivity: 'base' });
                    });
                    return sorted;
                });


                console.log("Folders: ", folders);

            }}
        />
    );
}
