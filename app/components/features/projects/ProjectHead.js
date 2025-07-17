'use client'

import React from 'react'
import { t } from '@/app/i18n'
import { SectionHead } from '../../shared/SectionHead'

export default function ProjectHead({ id }) {
    return (
        <SectionHead
            title={`${id}`}
            iconUrl={'/icons/coco/bold/Bag.svg'}
            options={{
                actions: [
                    {
                        key: 'new',
                        label: 'Add New Project',
                        description: 'Create a new project',
                        icon: '/icons/coco/bold/Note-add.svg',
                    },
                ],
                danger: [],
            }}
            buttons={[
                {
                    key: 'Generate',
                    label: t('actions.generate'),
                    endIconUrl: '/icons/coco/line/Star.svg',
                    isPrimary: true,
                    onClick: () => console.log('Generate'),
                    endIconSize: '20px',
                },
                {
                    key: 'export',
                    label: t('actions.export'),
                    endIconUrl: '/icons/coco/line/Export.svg',
                    isPrimary: false,
                    onClick: () => console.log('Export'),
                    endIconSize: '20px',
                }
            ]}
        />
    )
}
