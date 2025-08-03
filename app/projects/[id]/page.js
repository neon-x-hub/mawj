import React from 'react';
import { t } from '@/app/i18n';
import ProjectHead from '@/app/components/features/projects/ProjectHead';
import ProjectBanner from '@/app/components/features/projects/ProjectBanner';
import DataSectionHead from '@/app/components/features/projects/DataSectionHead';
import DataTable from '@/app/components/tables/DataTable';

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
            <DataSectionHead project={project} />
            <DataTable project={project} />
        </>
    );
}
