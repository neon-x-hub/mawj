'use client'

import React from 'react'
import HoverCard from '../../core/cards/HoverCard'
import LineChart from '../../charts/LineChart'
export default function ProjectBanner() {
    return (
        <div className='w-full h-[280] flex items-center justify-center gap-3'>
            <div className='w-1/3 h-full r30'>
                <HoverCard
                    imageSrc="https://picsum.photos/200/300"
                    title="مشروع تجريبي"
                    subtitle="مشروع تجريبي"
                    footerTitle="مشروع تجريبي"
                    onEditClick={() => console.log('Edit clicked')}
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
