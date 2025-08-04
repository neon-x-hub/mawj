import React from 'react';
import { t } from '@/app/i18n';
import ProjectHead from '@/app/components/features/projects/ProjectHead';
import ProjectBanner from '@/app/components/features/projects/ProjectBanner';
import DataSection from '@/app/components/features/projects/DataSections';

export default async function ProjectPage({ params }) {
    const { id } = await params;

    // Fetch project data from your API
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/projects/${id}`);

    if (!res.ok) {
        // Handle errors gracefully
        throw new Error(`Failed to fetch project ${id}`);
    }

    const project = await res.json();

    return (
        <>
            <ProjectHead project={project} />
            <ProjectBanner project={project} />
            <DataSection project={project} />
        </>
    );
}
