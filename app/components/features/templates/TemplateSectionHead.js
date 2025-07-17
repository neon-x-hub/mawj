import React from 'react'
// I18N
import { t } from '@/app/i18n'
// Components
import { SectionHead } from '../../shared/SectionHead'
export default function TemplateSectionHead() {
    return (
        <SectionHead
            title={t('common.templates')}
            iconUrl={"/icons/coco/bold/Document.svg"}
            options={{
                actions: [
                    {
                        key: 'new',
                        label: t('actions.generic.add.label', { object: t('common.template') }),
                        description: t('actions.generic.add.desc', { object: t('common.template') }),
                        icon: '/icons/coco/bold/Note-add.svg',
                    },
                ],
                danger: [],
            }}
            onFilter={() => console.log('Filter clicked')}
            onSort={() => console.log('Sort clicked')}
            search={{
                placeholder: t('common.placeholder.search', { pl: t('common.templates') }),
                onSearch: (q) => console.log('Search:', q),
            }}
            buttons={[
                {
                    key: 'export',
                    label: t('actions.import'),
                    endIconUrl: '/icons/coco/line/Import.svg',
                    isPrimary: true,
                    onClick: () => console.log('Import'),
                    endIconSize: '20px',
                },
            ]}
        />
    )
}
