'use client';

import { useRouter } from 'next/navigation'; // ✅ For navigation
import { t } from '@/app/i18n';

// Components
import HeroBanner from './components/features/home/banner';
import FolderSectionHead from './components/features/home/FolderSectionHead';
import GenericCard from './components/core/cards/GenericCard';
import ResponiveGrid from './components/layout/ResponiveGrid';
import ProjectDirectOptions from './components/core/menu/ProjectDirectOptions';

export default function Home() {
    const router = useRouter(); // ✅ Hook for programmatic navigation

    // ✅ Placeholder projects
    const projects = [
        {
            id: 1,
            title: 'المشروع الافتراضي 1',
            description: 'وصف مختصر للمشروع الأول',
            previews: ['https://picsum.photos/200/300', 'https://picsum.photos/200/300'],
        },
        {
            id: 2,
            title: 'المشروع الافتراضي 2',
            description: 'وصف مختصر للمشروع الثاني',
            previews: ['https://picsum.photos/200/300', 'https://picsum.photos/200/300'],
        },
        {
            id: 3,
            title: 'المشروع الافتراضي 3',
            description: 'وصف مختصر للمشروع الثالث',
            previews: ['https://picsum.photos/200/300', 'https://picsum.photos/200/300'],
        },
    ];

    return (
        <>
            <HeroBanner />
            <FolderSectionHead />

            <ResponiveGrid>
                {projects.map((project) => (
                    <GenericCard
                        key={project.id}
                        title={project.title}
                        description={project.description}
                        previews={project.previews}
                        onPress={() => router.push(`/projects?f=${project.id}`)} // ✅ Navigate on click
                        optionsContent={<ProjectDirectOptions project={project} />}
                    />
                ))}
            </ResponiveGrid>
        </>
    );
}
