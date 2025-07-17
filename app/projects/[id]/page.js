import React from 'react';
import { t } from '@/app/i18n';
// Components
import ProjectHead from '@/app/components/features/projects/ProjectHead';
import ProjectBanner from '@/app/components/features/projects/ProjectBanner';
import DataSectionHead from '@/app/components/features/projects/DataSectionHead';
import DataTable from '@/app/components/tables/DataTable';
export default async function ProjectPage({ params }) {
    const { id } = await params;

    return  (
        <>
            <ProjectHead id={id} />
            <ProjectBanner />
            <DataSectionHead />
            <DataTable />
        </>
    );
}
