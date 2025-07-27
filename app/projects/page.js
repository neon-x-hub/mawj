'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
// I18N
import { t } from '@/app/i18n';
// Components
import ProjectSectionHead from '../components/features/projects/ProjectSectionHead';
import ResponiveGrid from '../components/layout/ResponiveGrid';
import GenericCard from '../components/core/cards/GenericCard';
import DynamicBreadcrumbs from '../components/core/breadcrumbs/DynamicBreadCrumbs';
import ProjectDirectOptions from '../components/core/menu/ProjectDirectOptions';

export default function Page() {
    const router = useRouter();

    // ✅ Placeholder project list
    const projects = [
        {
            id: 101,
            title: 'المشروع الافتراضي 1',
            description: 'وصف مختصر للمشروع الأول و محتوياته',
            previews: ['https://picsum.photos/200/300', 'https://picsum.photos/200/300'],
        },
        {
            id: 102,
            title: 'المشروع الافتراضي 2',
            description: 'وصف مختصر للمشروع الثاني و محتوياته',
            previews: ['https://picsum.photos/200/300', 'https://picsum.photos/200/300'],
        },
        {
            id: 103,
            title: 'المشروع الافتراضي 3',
            description: 'وصف مختصر للمشروع الثالث و محتوياته',
            previews: ['https://picsum.photos/200/300', 'https://picsum.photos/200/300'],
        },
        {
            id: 104,
            title: 'المشروع الافتراضي 4',
            description: 'وصف مختصر للمشروع الرابع و محتوياته',
            previews: ['https://picsum.photos/200/300', 'https://picsum.photos/200/300'],
        },
        {
            id: 105,
            title: 'المشروع الافتراضي 5',
            description: 'وصف مختصر للمشروع الخامس و محتوياته',
            previews: ['https://picsum.photos/200/300', 'https://picsum.photos/200/300'],
        },
    ];

    return (
        <>
            <ProjectSectionHead />
            <DynamicBreadcrumbs basePath="/projects" baseLabel={t('common.projects')} />

            <ResponiveGrid>
                {projects.map((project) => (
                    <GenericCard
                        key={project.id}
                        title={project.title}
                        description={project.description}
                        previews={project.previews}
                        onPress={() => router.push(`/projects/${project.id}`)} // ✅ Navigate on click
                        optionsContent={<ProjectDirectOptions project={project} />} // ✅ Popover options for project
                    />
                ))}
            </ResponiveGrid>
        </>
    );
}
