'use client';

import React, { useEffect, useState } from 'react';
import { t } from '@/app/i18n';
import HoverCard from '../../core/cards/HoverCard';
import LineChart from '../../charts/LineChart'; // LegacyConvertedGradientChart
import { Chip, Button, Spinner } from '@heroui/react';
import { useRouter } from 'next/navigation';

export default function ProjectBanner({ project }) {
    const router = useRouter();
    const [statsData, setStatsData] = useState(null);
    const [eventType, setEventType] = useState('generation'); // default event type

    useEffect(() => {
        fetch(`/api/v1/projects/${project.id}/stats/`)
            .then(res => res.json())
            .then(data => setStatsData(data));
    }, []);

    const toggleEventType = () => {
        setEventType(prev => (prev === 'generation' ? 'data_ingestion' : 'generation'));
    };

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
                            <Chip size="md" className="font-medium">
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
                    OptionsDropdown={{
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
                    }}
                />
            </div>
            <div className='flex-1 bg-white p-4 shadow-lg h-full r30 flex flex-col'>
                <div className='flex justify-between items-center mb-2'>
                    <h3 className='text-md font-semibold'>
                        {eventType === 'generation' ? 'Generations' : 'Data Ingestion'} Activity
                    </h3>
                    <Button size="sm" variant="outline" onClick={toggleEventType}>
                        Switch to {eventType === 'generation' ? 'Data Ingestion' : 'Generations'}
                    </Button>
                </div>
                <div className='flex-1 min-h-[200px]'>
                    {statsData ? (
                        <LineChart
                            data={statsData}
                            eventType={eventType}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <Spinner />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
