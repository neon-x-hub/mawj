'use client'

import React from 'react'
import { t } from '@/app/i18n'
import { SectionHead } from '../../shared/SectionHead'

export default function DataSectionHead() {
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
                    },
                ],
                danger: [],
            }}
            onFilter={() => console.log('Filter clicked')}
            onSort={() => console.log('Sort clicked')}
            search={{
                placeholder: t('common.placeholder.search', { pl: t('common.data') }),
                onSearch: (q) => console.log('Search:', q),
            }}
        />
    )
}
