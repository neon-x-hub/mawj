import React from 'react'
// I18N
import { t } from '@/app/i18n'

// Components
import { SectionHead } from '../../shared/SectionHead'


const actions = [
    {
        key: 'new',
        label: t('actions.generic.add.label', { object: t('common.folder') }),
        description: t('actions.generic.add.desc', { object: t('common.folder') }),
        icon: '/icons/coco/bold/Note-add.svg',
    },
    {
        key: 'copy',
        label: 'Copy link',
        description: 'Copy the file link',
        icon: '/icons/coco/bold/Note-add.svg',
    },
    {
        key: 'edit',
        label: 'Edit file',
        description: 'Allows you to edit the file',
        icon: '/icons/coco/bold/Note-add.svg',
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
