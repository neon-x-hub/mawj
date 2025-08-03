'use client'

import React from 'react'
import { t } from '@/app/i18n'
import HoverCard from '../../core/cards/HoverCard'
import LineChart from '../../charts/LineChart'
import { Chip } from '@heroui/react'
import { useRouter } from 'next/navigation'
export default function ProjectBanner({ project }) {
    const router = useRouter();
    return (
        <div className='w-full h-[280] flex items-center justify-center gap-3'>
            <div className='w-1/3 h-full r30'>
                <HoverCard
                    imageSrc={project.template ? `/api/v1/templates/${project.template}/preview` : null}
                    title={project.name}
                    subtitle={project.description}
                    footerTitle={
                        <div className="flex items-center gap-2">
                            <span>{t('common.project_types.label')}:</span>
                            <Chip
                                size="md"
                                className="font-medium"
                            >
                                {t(`common.project_types.${project.type}`)}
                            </Chip>
                        </div>
                    }
                    project={project}
                    onEditClick={() => {
                        if (project.template) {
                            router.push(`/templates/${project.template}`);
                        } else {
                            alert(t('messages.no_template_selected') || 'No template has been selected for this project');
                        }
                    }}
                    OptionsDropdown={
                        {
                            actions: [
                                {
                                    key: 'copy',
                                    label: 'Copy link',
                                    description: 'Copy the file link',
                                    icon: '/icons/coco/bold/Note-add.svg',
                                    do: () => console.log('Copy link'),
                                },
                            ],
                            danger: [
                                {
                                    key: 'delete',
                                    label: 'Delete project',
                                    description: 'This action is irreversible',
                                    icon: '/icons/coco/bold/Delete.svg',
                                    do: () => console.log('Delete project'),
                                },
                            ],
                        }
                    }
                />
            </div>
            <div className='flex-1 bg-white p-4 shadow-lg h-full r30'>
                <LineChart />
            </div>
        </div>
    )
}
